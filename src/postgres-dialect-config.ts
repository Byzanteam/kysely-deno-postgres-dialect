import { DatabaseConnection, Pool } from "../deps.ts";

/**
 * Config for the PostgreSQL dialect.
 */
export interface PostgresDialectConfig {
  /**
   * A postgres Pool instance or a function that returns one.
   *
   * If a function is provided, it's called once when the first query is executed.
   *
   * https://deno-postgres.com/#/?id=connection-pools
   */
  pool: Pool | (() => Promise<Pool> | Pool);

  /**
   * Called once for each created connection.
   */
  onCreateConnection?: (connection: DatabaseConnection) => Promise<void> | void;
}
