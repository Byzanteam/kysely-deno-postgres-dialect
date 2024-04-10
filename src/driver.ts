import type { Driver, TransactionSettings } from "../deps.ts";
import { PostgresJSConnection } from "./connection.ts";
import type { PostgresJSDialectConfig } from "./types.ts";
import { freeze } from "./postgres-utils.ts";

export class PostgresJSDriver implements Driver {
  readonly #config: PostgresJSDialectConfig;

  constructor(config: PostgresJSDialectConfig) {
    this.#config = freeze({ ...config });
  }

  async init(): Promise<void> {
    // noop
  }

  async acquireConnection(): Promise<PostgresJSConnection> {
    const reservedConnection = await this.#config.postgres.reserve();

    return new PostgresJSConnection(reservedConnection);
  }

  async beginTransaction(
    connection: PostgresJSConnection,
    settings: TransactionSettings,
  ): Promise<void> {
    await connection.beginTransaction(settings);
  }

  async commitTransaction(connection: PostgresJSConnection): Promise<void> {
    await connection.commitTransaction();
  }

  async rollbackTransaction(connection: PostgresJSConnection): Promise<void> {
    await connection.rollbackTransaction();
  }

  // deno-lint-ignore require-await
  async releaseConnection(connection: PostgresJSConnection): Promise<void> {
    connection.releaseConnection();
  }

  async destroy(): Promise<void> {
    await this.#config.postgres.end();
  }
}
