import { Kysely } from "../../deps.ts";
import { Database } from "./types.ts"; // this is the Database interface we defined earlier
import { postgres, PostgresJSDialect } from "../../mod.ts";

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
