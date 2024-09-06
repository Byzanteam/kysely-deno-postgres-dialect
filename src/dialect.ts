import {
  type DatabaseIntrospector,
  type Dialect,
  type DialectAdapter,
  type Driver,
  type Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type QueryCompiler,
} from "kysely";
import { PostgresJSDriver } from "./driver.ts";
import type { PostgresJSDialectConfig } from "./types.ts";
import { freeze } from "./postgres-utils.ts";

export class PostgresJSDialect implements Dialect {
  readonly #config: PostgresJSDialectConfig;

  constructor(config: PostgresJSDialectConfig) {
    this.#config = freeze({ ...config });
  }

  createAdapter(): DialectAdapter {
    return new PostgresAdapter();
  }

  createDriver(): Driver {
    return new PostgresJSDriver(this.#config);
  }

  // deno-lint-ignore no-explicit-any
  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new PostgresIntrospector(db);
  }

  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler();
  }
}
