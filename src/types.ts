import type { Sql } from "postgresjs/types/index.d.ts";

export interface PostgresJSDialectConfig {
  readonly postgres: Sql;
}
