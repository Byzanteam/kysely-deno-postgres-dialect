# kysely-deno-postgres-dialect

[![ci](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml/badge.svg)](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml)
[![Latest version](https://deno.land/badge/kysely_deno_postgres_dialect/version)](https://deno.land/x/kysely_deno_postgres_dialect)

[Kysely](https://github.com/kysely-org/kysely) dialect for PostgreSQL using the
[postgresjs](https://github.com/porsager/postgres) client.

## 🚀 Getting started

```typescript
import {
  PostgresJSDialect,
  setup,
} from "https://deno.land/x/kysely_postgrs_js_dialect/mod.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

setup(() => {
  const dialect = new PostgresJSDialect({
    postgres: postgres(
      {
        database: "postgres",
        hostname: "localhost",
        password: "postgres",
        port: 5432,
        user: "postgres",
        max: 10,
      },
    ),
  });

  return new Kysely<Database>({
    dialect,
  });
});

// run queries
```

## 🩺 Testing

See detail at `./tests/testing/utils_test.ts`.

> [!IMPORTANT]\
> To fix `leaking resources` error, you should end all connections between
> cases.

```typescript
import {
  PostgresJSDialect,
  setup,
  wrapTransaction,
} from "https://deno.land/x/kysely_deno_postgres_dialect/mod.ts";
import { setupTesting } from "https://deno.land/x/kysely_deno_postgres_dialect/testing.ts";

setup(() => {
  const dialect = new PostgresJSDialect({
    postgres: postgres(
      {
        database: "postgres",
        hostname: "localhost",
        password: "postgres",
        port: 5432,
        user: "postgres",
        max: 10,
      },
    ),
  });

  return new Kysely<Database>({
    dialect,
  });
});

// test files

const {
  beforeAllFn,
  beforeEachFn,
  afterEachFn,
  afterAllFn,
} = setupTesting(stub);

describe("tests", () => {
  beforeAll(async () => {
    await beforeAllFn();
  });
  afterAll(async () => {
    await afterAllFn();
  });
  beforeEach(async () => {
    await beforeEachFn();
  });
  afterEach(async () => {
    // note: fix Leaking resources error
    await afterEachFn();
  });

  it("works", async () => {
    // snip
  });
});
```
