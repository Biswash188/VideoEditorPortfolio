import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { requireDatabaseUrl } from "./env.js";
import * as schema from "./database/schema.js";

function createDatabase() {
  const sql = neon(requireDatabaseUrl());
  return drizzle({ client: sql, schema });
}

export type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

export function getDatabase(): Database {
  database ??= createDatabase();
  return database;
}
