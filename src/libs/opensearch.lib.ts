import { Client } from "@opensearch-project/opensearch";
import opensearchConfig from "../config/opensearch.config.js";

let opensearchClient: Client | null = null;
let isConnected = false;

/**
 * Initializes and returns the OpenSearch client instance
 */
export const getOpenSearchClient = (): Client => {
  if (opensearchClient) {
    return opensearchClient;
  }

  const clientOptions: any = {
    node: opensearchConfig.node,
    ssl: opensearchConfig.ssl,
  };

  if (opensearchConfig.auth?.username && opensearchConfig.auth?.password) {
    clientOptions.auth = {
      username: opensearchConfig.auth.username,
      password: opensearchConfig.auth.password,
    };
  }

  opensearchClient = new Client(clientOptions);
  return opensearchClient;
};

/**
 * Generates the periodic index name (e.g. audit-trail-bihar-crm-2026.10)
 */
export const getMonthlyIndexName = (date: Date = new Date()): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${opensearchConfig.indexPrefix}-${year}.${month}`;
};

export const getWriteAliasName = (): string => {
  return `${opensearchConfig.indexPrefix}-write`;
};

export const getReadAliasName = (): string => {
  return `${opensearchConfig.indexPrefix}-read`;
};

/**
 * Strict Government API Audit Trail Index Mapping
 */
export const AUDIT_INDEX_MAPPINGS = {
  properties: {
    "@timestamp": { type: "date" },
    timestamp: { type: "date" },
    requestId: { type: "keyword" },
    correlationId: { type: "keyword" },
    environment: { type: "keyword" },
    service: { type: "keyword" },
    version: { type: "keyword" },
    event: { type: "keyword" },
    outcome: { type: "keyword" }, // SUCCESS, CLIENT_ERROR, SERVER_ERROR
    actor: {
      properties: {
        type: { type: "keyword" }, // USER, CITIZEN, API_KEY, ANONYMOUS
        id: { type: "keyword" },
        identifier: { type: "keyword" },
        roles: { type: "keyword" },
      },
    },
    client: {
      properties: {
        ip: { type: "keyword" },
        rawIp: { type: "keyword" },
        userAgent: { type: "text", fields: { keyword: { type: "keyword" } } },
      },
    },
    http: {
      properties: {
        method: { type: "keyword" },
        route: { type: "keyword" },
        url: { type: "keyword" },
        statusCode: { type: "integer" },
        responseTimeMs: { type: "float" },
        responseSizeBytes: { type: "long" },
      },
    },
    error: {
      properties: {
        code: { type: "keyword" },
        message: { type: "text" },
      },
    },
  },
};

/**
 * Ensures monthly index exists with mappings and aliases configured
 */
export const ensureAuditIndexAndAlias = async (): Promise<boolean> => {
  const client = getOpenSearchClient();
  const indexName = getMonthlyIndexName();
  const writeAlias = getWriteAliasName();
  const readAlias = getReadAliasName();

  try {
    const { body: exists } = await client.indices.exists({ index: indexName });

    if (!exists) {
      console.log(`[OpenSearch] Creating audit index: ${indexName}`);
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            "index.refresh_interval": "5s",
          },
          mappings: AUDIT_INDEX_MAPPINGS as any,
          aliases: {
            [writeAlias]: { is_write_index: true },
            [readAlias]: {},
          },
        },
      });
      console.log(`[OpenSearch] Audit index ${indexName} & aliases initialized successfully.`);
    }

    isConnected = true;
    return true;
  } catch (error: any) {
    isConnected = false;
    console.warn(`[OpenSearch] Could not verify/create audit index (${error.message}). Queue will buffer.`);
    return false;
  }
};

export const isOpenSearchConnected = (): boolean => isConnected;
