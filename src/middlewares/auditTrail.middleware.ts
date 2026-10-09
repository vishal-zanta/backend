import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { enqueueAuditLog } from "../modules/audit/audit.queue.js";
import {
  AuditLogDocument,
  AuditActor,
  AuditOutcome,
} from "../modules/audit/audit.types.js";

/**
 * Resolves the authenticated actor from the Express request
 */
const resolveActor = (req: Request): AuditActor => {
  const user = (req as any).user;
  if (user) {
    const roles: string[] = Array.isArray(user.roles)
      ? user.roles.map((r: any) => (typeof r === "string" ? r : r.name || r.role || r.code || "")).filter(Boolean)
      : [];

    return {
      type: "USER",
      id: user.id || (user._id ? String(user._id) : undefined),
      identifier: user.email || user.loginId || user.phone || user.name,
      roles: roles.length > 0 ? roles : undefined,
    };
  }

  const citizen = (req as any).citizen;
  if (citizen) {
    return {
      type: "CITIZEN",
      id: citizen._id ? String(citizen._id) : citizen.id,
      identifier: citizen.mobile || citizen.email || citizen.name,
    };
  }

  const apiKey = (req as any).apiKey;
  if (apiKey) {
    return {
      type: "API_KEY",
      id: apiKey._id ? String(apiKey._id) : undefined,
      identifier: apiKey.name || apiKey.key?.slice(0, 8) + "...",
    };
  }

  return {
    type: "ANONYMOUS",
  };
};

/**
 * Classifies the high-level audit event based on route, method, and HTTP status
 */
const classifyAuditEvent = (
  method: string,
  url: string,
  statusCode: number,
  actorType: string
): string => {
  const normalized = url.toLowerCase().split("?")[0];

  // Authentication specific events
  if (normalized.includes("/auth/login") || normalized.includes("/citizen/login")) {
    return statusCode >= 200 && statusCode < 300 ? "LOGIN_SUCCESS" : "LOGIN_FAILED";
  }

  if (normalized.includes("/logout") || normalized.includes("/admin-logout")) {
    return "LOGOUT";
  }

  // Authorization failures
  if (statusCode === 401) return "401_UNAUTHORIZED";
  if (statusCode === 403) return "403_FORBIDDEN";

  // User management events
  if (normalized.startsWith("/api/v1/users")) {
    if (method === "POST" && statusCode >= 200 && statusCode < 300) return "USER_CREATED";
    if ((method === "PUT" || method === "PATCH") && statusCode >= 200 && statusCode < 300) return "USER_UPDATED";
    if (method === "DELETE" && statusCode >= 200 && statusCode < 300) return "USER_DELETED";
  }

  // Role & permission management
  if (normalized.startsWith("/api/v1/roles")) {
    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
      return "ROLE_CHANGED";
    }
  }

  if (normalized.includes("/permission") || normalized.includes("/workflow-level")) {
    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
      return "PERMISSION_CHANGED";
    }
  }

  // Grievance domain events
  if (normalized.includes("/grievance")) {
    if (method === "POST" && statusCode >= 200 && statusCode < 300) return "GRIEVANCE_CREATED";
    if ((method === "PUT" || method === "PATCH") && statusCode >= 200 && statusCode < 300) return "GRIEVANCE_UPDATED";
    if (normalized.includes("/transfer")) return "GRIEVANCE_TRANSFERRED";
    if (normalized.includes("/feedback")) return "GRIEVANCE_FEEDBACK_SUBMITTED";
  }

  // Default event fallback
  return `API_${method}_${statusCode}`;
};

/**
 * Global audit trail middleware capturing 100% of API requests
 */
export const auditTrailMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = performance.now();
  const requestDate = new Date();

  // Extract or generate unique Request ID
  const incomingId = (req.headers["x-request-id"] || req.headers["x-correlation-id"]) as string;
  const requestId = incomingId || crypto.randomUUID();

  // Attach request ID to response header for audit tracing
  res.setHeader("x-request-id", requestId);
  (req as any).requestId = requestId;

  // Intercept response body safely
  let capturedResponseBody: any = null;
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (body: any) {
    capturedResponseBody = body;
    return originalJson.call(this, body);
  };

  res.send = function (body: any) {
    if (!capturedResponseBody && typeof body === "string") {
      try {
        capturedResponseBody = JSON.parse(body);
      } catch {
        capturedResponseBody = body.length > 500 ? body.slice(0, 500) + "..." : body;
      }
    }
    return originalSend.call(this, body);
  };

  // Intercept the end of response cycle to ensure all down-stream auth context is present
  res.on("finish", () => {
    try {
      const responseTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      const statusCode = res.statusCode;

      // Extract outcome
      let outcome: AuditOutcome = "SUCCESS";
      if (statusCode >= 500) {
        outcome = "SERVER_ERROR";
      } else if (statusCode >= 400) {
        outcome = "CLIENT_ERROR";
      }

      // Extract client info
      const forwarded = req.headers["x-forwarded-for"];
      const rawIp = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded || req.socket.remoteAddress || req.ip || "127.0.0.1";
      const cleanIp = String(rawIp) === "::1" ? "127.0.0.1" : String(rawIp).replace(/^.*:/, "");

      const userAgent = (req.headers["user-agent"] as string) || "unknown";

      // Extract actor details
      const actor = resolveActor(req);

      // Classify event
      const event = classifyAuditEvent(req.method, req.originalUrl || req.url, statusCode, actor.type);

      // Extract response size
      const contentLengthHeader = res.getHeader("content-length");
      const responseSizeBytes = contentLengthHeader ? parseInt(String(contentLengthHeader), 10) : 0;

      // Redact sensitive tokens in response if present
      let sanitizedResponse: any = null;
      if (capturedResponseBody && typeof capturedResponseBody === "object") {
        try {
          sanitizedResponse = JSON.parse(
            JSON.stringify(capturedResponseBody, (key, value) => {
              const lower = key.toLowerCase();
              if (
                lower.includes("token") ||
                lower.includes("password") ||
                lower.includes("secret") ||
                lower.includes("otp")
              ) {
                return "[REDACTED]";
              }
              return value;
            })
          );
        } catch {
          sanitizedResponse = { message: "Serialized response data" };
        }
      }

      // Extract error details if attached in error handler
      const auditError = (res.locals && res.locals.auditError) || undefined;

      const doc: AuditLogDocument = {
        "@timestamp": requestDate.toISOString(),
        timestamp: requestDate.toISOString(),
        requestId,
        correlationId: requestId,
        environment: process.env.NODE_ENV || "development",
        service: "bihar-crm-backend",
        version: "1.0.0",
        event,
        outcome,
        actor,
        client: {
          ip: cleanIp,
          rawIp: String(rawIp),
          userAgent,
        },
        http: {
          method: req.method,
          route: req.route?.path || req.baseUrl || req.path,
          url: req.originalUrl || req.url,
          statusCode,
          responseTimeMs,
          responseSizeBytes,
        },
        response: sanitizedResponse ? { body: sanitizedResponse } : null,
        error: auditError || null,
      };

      // Asynchronously dispatch to BullMQ queue without blocking
      enqueueAuditLog(doc).catch((err) => {
        console.error(`[AuditMiddleware] Error enqueuing doc: ${err.message}`);
      });
    } catch (err: any) {
      console.error(`[AuditMiddleware] Critical error generating audit record: ${err.message}`);
    }
  });

  next();
};
