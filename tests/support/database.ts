import { Database } from "./types.ts"; // this is the Database interface we defined earlier
import { Kysely } from "kysely";
import { KyselyDenoPostgresDialect, Pool } from "../../mod.ts";

const dialect = new KyselyDenoPostgresDialect({
  pool: new Pool(
    {
      database: "postgres",
      hostname: "localhost",
      password: "postgres",
      port: 5432,
      user: "postgres",
    },
    10,
    true,
  ),
});

export const db = new Kysely<Database>({
  dialect,
});
