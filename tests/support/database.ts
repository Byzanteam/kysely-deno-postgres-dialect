import { Kysely } from "kysely";
import type { Database } from "./types.ts";
import { PostgresJSDialect } from "../../mod.ts";
import postgres from "postgresjs";

const dialect = new PostgresJSDialect({
  postgres: postgres(
    {
      database: "postgres",
      hostname: "localhost",
      password: "postgres",
      port: 5432,
      user: "postgres",
      max: 10,
    },
  ),
});

export const db = new Kysely<Database>({
  dialect,
});
