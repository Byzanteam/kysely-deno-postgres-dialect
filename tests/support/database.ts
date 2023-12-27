import { DatabaseConnection, Kysely } from "../../deps.ts";
import { Database } from "./types.ts"; // this is the Database interface we defined earlier
import { KyselyDenoPostgresDialect, Pool } from "../../mod.ts";
import { PostgresConnection } from "../../src/postgres-connection.ts";

const connections: PostgresConnection[] = [];

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
  onCreateConnection: (connection: DatabaseConnection) => {
    connections.push(connection as PostgresConnection);
  },
});

export const db = new Kysely<Database>({
  dialect,
});

export async function endConnections() {
  for (const connection of connections) {
    await connection.end();
  }
}
