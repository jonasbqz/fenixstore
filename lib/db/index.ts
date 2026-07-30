import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  postgresClient?: postgres.Sql;
  drizzleDb?: PostgresJsDatabase<typeof schema>;
};

function getPostgresClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL es obligatoria para consultar el catalogo.");
  }

  if (!globalForDb.postgresClient) {
    globalForDb.postgresClient = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }

  return globalForDb.postgresClient;
}

export function isDbConnected(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDb() {
  if (!isDbConnected()) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  if (!globalForDb.drizzleDb) {
    globalForDb.drizzleDb = drizzle(getPostgresClient(), { schema });
  }

  return globalForDb.drizzleDb;
}
