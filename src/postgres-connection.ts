import {
  CompiledQuery,
  DatabaseConnection,
  PoolClient,
  QueryResult,
} from "../deps.ts";

export const PRIVATE_RELEASE_METHOD = Symbol("release");

export class PostgresConnection implements DatabaseConnection {
  #client: PoolClient;

  constructor(client: PoolClient) {
    this.#client = client;
  }

  async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
    const result = await this.#client.queryObject<O>(compiledQuery.sql, [
      ...compiledQuery.parameters,
    ]);

    if (
      result.command === "INSERT" ||
      result.command === "UPDATE" ||
      result.command === "DELETE"
    ) {
      const numAffectedRows = BigInt(result.rows.length);

      return {
        numUpdatedOrDeletedRows: numAffectedRows,
        numAffectedRows,
        rows: result.rows ?? [],
      };
    }

    return {
      rows: result.rows ?? [],
    };
  }

  // deno-lint-ignore require-yield
  async *streamQuery<O>(
    _compiledQuery: CompiledQuery,
    _chunkSize: number,
  ): AsyncIterableIterator<QueryResult<O>> {
    throw new Error("Deno Postgres Driver does not support streaming");
  }

  [PRIVATE_RELEASE_METHOD](): void {
    this.#client.release();
  }
}
