import type postgres from "postgresjs";

export interface PostgresJSDialectConfig {
  readonly postgres: postgres.Sql;
}
