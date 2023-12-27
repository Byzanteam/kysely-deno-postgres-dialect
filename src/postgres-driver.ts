import {
  CompiledQuery,
  DatabaseConnection,
  Driver,
  Pool,
  PoolClient,
  TransactionSettings,
} from "../deps.ts";
import { PostgresDialectConfig } from "./postgres-dialect-config.ts";
import {
  PostgresConnection,
  PRIVATE_RELEASE_METHOD,
} from "./postgres-connection.ts";

export class PostgresDriver implements Driver {
  readonly #config: PostgresDialectConfig;
  readonly #connections = new WeakMap<PoolClient, DatabaseConnection>();
  #pool?: Pool;

  constructor(config: PostgresDialectConfig) {
    this.#config = Object.freeze({ ...config });
  }

  async init(): Promise<void> {
    this.#pool = typeof this.#config.pool === "function"
      ? await this.#config.pool()
      : this.#config.pool;
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    const client = await this.#pool!.connect();
    let connection = this.#connections.get(client);

    if (!connection) {
      connection = new PostgresConnection(client);
      this.#connections.set(client, connection);

      // The driver must take care of calling `onCreateConnection` when a new
      // connection is created. The `pg` module doesn't provide an async hook
      // for the connection creation. We need to call the method explicitly.
      if (this.#config.onCreateConnection) {
        await this.#config.onCreateConnection(connection);
      }
    }

    return connection;
  }

  async beginTransaction(
    connection: DatabaseConnection,
    settings: TransactionSettings,
  ): Promise<void> {
    if (settings.isolationLevel) {
      await connection.executeQuery(
        CompiledQuery.raw(
          `start transaction isolation level ${settings.isolationLevel}`,
        ),
      );
    } else {
      await connection.executeQuery(CompiledQuery.raw("begin"));
    }
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("commit"));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("rollback"));
  }

  // deno-lint-ignore require-await
  async releaseConnection(connection: PostgresConnection): Promise<void> {
    connection[PRIVATE_RELEASE_METHOD]();
  }

  async destroy(): Promise<void> {
    if (this.#pool) {
      const pool = this.#pool;
      this.#pool = undefined;
      await pool.end();
    }
  }
}
