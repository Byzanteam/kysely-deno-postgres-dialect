# kysely-deno-postgres-dialect

[![ci](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml/badge.svg)](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml)
[![Latest version](https://deno.land/badge/kysely_deno_postgres_dialect/version)](https://deno.land/x/kysely_deno_postgres_dialect)

[Kysely](https://github.com/kysely-org/kysely) dialect for PostgreSQL using the
[postgresjs](https://github.com/porsager/postgres) client.

## 🚀 Getting started

Import using `imports` in `deno.json`

```json
{
  "imports": {
    "kysely-deno-postgres-dialect/": "https://deno.land/x/kysely_postgrs_js_dialect/",
    "postgresjs/": "https://deno.land/x/postgresjs@v3.4.4/",
    "kysely/": "https://cdn.jsdelivr.net/npm/kysely@0.27.3/dist/esm/"
  }
}
```

use kysely-deno-postgres-dialect

```typescript
import {
  PostgresJSDialect,
  setup,
  wrapTransaction as wrapTransactionFn,
} from "kysely-deno-postgres-dialect/mod.ts";
import postgres from "postgresjs/mod.js";

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

  return new Kysely<Database>({ // Database is defined by Kysely orm
    dialect,
  });
});

async function wrapTransaction<T>(
  callback: Parameters<typeof wrapTransactionFn<Database, T>>[0],
): Promise<T> {
  return await wrapTransactionFn<Database, T>(callback);
}

const data = await wrapTransaction(async (trx) => {
  return trx.selectFrom("hello").selectAll().execute();
});
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
