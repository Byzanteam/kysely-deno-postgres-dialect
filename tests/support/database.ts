import { Kysely } from "kysely/index.js";
import type { Database } from "./types.ts";
import { PostgresJSDialect } from "../../mod.ts";
import postgres from "postgresjs/mod.js";

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
