import type { Sql } from "../deps.ts";

export interface PostgresJSDialectConfig {
  readonly postgres: Sql;
}
