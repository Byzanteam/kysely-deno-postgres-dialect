import {
  CompiledQuery,
  DatabaseConnection,
  QueryResult,
  TransactionSettings,
} from "kysely/index.js";
import { ReservedSql } from "postgresjs/types/index.d.ts";
import { PostgresJSDialectError } from "./errors.ts";

export class PostgresJSConnection implements DatabaseConnection {
  #reservedConnection: ReservedSql;

  constructor(reservedConnection: ReservedSql) {
    this.#reservedConnection = reservedConnection;
  }

  async beginTransaction(settings: TransactionSettings): Promise<void> {
    const { isolationLevel } = settings;

    const compiledQuery = CompiledQuery.raw(
      isolationLevel
        ? `start transaction isolation level ${isolationLevel}`
        : "begin",
    );

    await this.executeQuery(compiledQuery);
  }

  async commitTransaction(): Promise<void> {
    await this.executeQuery(CompiledQuery.raw("commit"));
  }

  async executeQuery<R>(
    compiledQuery: CompiledQuery<unknown>,
  ): Promise<QueryResult<R>> {
    const result = await this.#reservedConnection.unsafe<R[]>(
      compiledQuery.sql,
      // deno-lint-ignore no-explicit-any
      compiledQuery.parameters.slice() as any,
    );

    const rows = Array.from(result.values());

    if (["INSERT", "UPDATE", "DELETE"].includes(result.command)) {
      const numAffectedRows = BigInt(result.count);

      return { numAffectedRows, rows };
    }

    return { rows };
  }

  releaseConnection(): void {
    this.#reservedConnection.release();

    this.#reservedConnection = null!;
  }

  async rollbackTransaction(): Promise<void> {
    await this.executeQuery(CompiledQuery.raw("rollback"));
  }

  async *streamQuery<R>(
    compiledQuery: CompiledQuery<unknown>,
    chunkSize: number,
  ): AsyncIterableIterator<QueryResult<R>> {
    if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
      throw new PostgresJSDialectError("chunkSize must be a positive integer");
    }

    const cursor = this.#reservedConnection
      // deno-lint-ignore no-explicit-any
      .unsafe<R[]>(compiledQuery.sql, compiledQuery.parameters.slice() as any)
      .cursor(chunkSize);

    for await (const rows of cursor) {
      yield { rows };
    }
  }
}
