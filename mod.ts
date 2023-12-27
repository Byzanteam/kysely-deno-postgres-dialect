import {
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  QueryCompiler,
} from "./deps.ts";

import { PostgresDriver } from "./src/postgres-driver.ts";
import { PostgresDialectConfig } from "./src/postgres-dialect-config.ts";

export { type DatabaseConnection, kysely, Pool, postgres } from "./deps.ts";
export { type PostgresConnection } from "./src/postgres-connection.ts";

export class KyselyDenoPostgresDialect implements Dialect {
  readonly #config: PostgresDialectConfig;

  constructor(config: PostgresDialectConfig) {
    this.#config = config;
  }

  createDriver(): Driver {
    return new PostgresDriver(this.#config);
  }

  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler();
  }

  createAdapter(): DialectAdapter {
    return new PostgresAdapter();
  }

  // deno-lint-ignore no-explicit-any
  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new PostgresIntrospector(db);
  }
}

export { getDB, setup, wrapTransaction } from "./src/utils.ts";
