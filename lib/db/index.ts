import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  postgresClient?: postgres.Sql;
};

function getPostgresClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL es obligatoria para consultar el catalogo.");
  }

  const client =
    globalForDb.postgresClient ??
    postgres(connectionString, {
      max: 1,
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = client;
  }

  return client;
}

export function isDbConnected(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDb() {
  if (!isDbConnected()) {
    throw new Error("DATABASE_URL no está configurada.");
  }
  return drizzle(getPostgresClient());
}
