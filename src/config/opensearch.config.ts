import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export interface OpenSearchConfig {
  node: string;
  auth?: {
    username?: string;
    password?: string;
  };
  indexPrefix: string;
  ssl: {
    rejectUnauthorized: boolean;
  };
}

export const opensearchConfig: OpenSearchConfig = {
  node: process.env.OPENSEARCH_NODE || "http://localhost:9200",
  auth:
    process.env.OPENSEARCH_USERNAME && process.env.OPENSEARCH_PASSWORD
      ? {
          username: process.env.OPENSEARCH_USERNAME,
          password: process.env.OPENSEARCH_PASSWORD,
        }
      : undefined,
  indexPrefix: process.env.OPENSEARCH_INDEX_PREFIX || "audit-trail-bihar-crm",
  ssl: {
    rejectUnauthorized: process.env.OPENSEARCH_SSL_REJECT_UNAUTHORIZED === "true",
  },
};

export default opensearchConfig;
