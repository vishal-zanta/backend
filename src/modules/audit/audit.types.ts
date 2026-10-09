export type ActorType = "USER" | "CITIZEN" | "API_KEY" | "ANONYMOUS";
export type AuditOutcome = "SUCCESS" | "CLIENT_ERROR" | "SERVER_ERROR";

export interface AuditActor {
  type: ActorType;
  id?: string;
  identifier?: string;
  roles?: string[];
}

export interface AuditClient {
  ip: string;
  rawIp?: string;
  userAgent: string;
}

export interface AuditHttp {
  method: string;
  route: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  responseSizeBytes: number;
}

export interface AuditError {
  code?: string;
  message?: string;
  details?: any;
}

export interface AuditResponse {
  body?: any;
}

export interface AuditLogDocument {
  "@timestamp": string;
  timestamp: string;
  requestId: string;
  correlationId?: string;
  environment: string;
  service: string;
  version: string;
  event: string;
  outcome: AuditOutcome;
  actor: AuditActor;
  client: AuditClient;
  http: AuditHttp;
  response?: AuditResponse | null;
  error?: AuditError | null;
}
