# kysely-deno-postgres-dialect

[![ci](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml/badge.svg)](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml)
[![JSR](https://jsr.io/badges/@byzanteam/kysely-deno-postgres-dialect)](https://jsr.io/@byzanteam/kysely-deno-postgres-dialect)

[Kysely](https://github.com/kysely-org/kysely) dialect for PostgreSQL using the
[postgresjs](https://github.com/porsager/postgres) client.

## 🚀 Getting started

### Install dependencies

```
deno add @byzanteam/kysely-deno-postgres-dialect
```

Optional: Import using `imports` in `deno.json`, if you dont want to use `npm`
registry.

```json
{
  "imports": {
    "kysely-deno-postgres-dialect": "jsr:@byzanteam/kysely-deno-postgres-dialect",
    "postgresjs": "https://deno.land/x/postgresjs@v3.4.4/mod.js",
    "kysely": "https://esm.sh/kysely@0.27.3"
  }
}
```

### Use kysely-deno-postgres-dialect

1. Define your database schema

```typescript
import postgres from "postgresjs/mod.js";
import * as kysely from "kysely";
import {
  PostgresJSDialect,
  setup,
  wrapTransaction as wrapTransactionFn,
} from "kysely-deno-postgres-dialect";

interface UserTable {
  id: kysely.Generated<number>;
  name: string;
}

interface Database {
  users: UserTable;
}
```

2. Setup the kysely instance before using it

```typescript
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

  return new kysely.Kysely<Database>({
    dialect,
  });
});
```

3. Make your own `wrapTransaction` function that incorporates a database context

```typescript
async function wrapTransaction<T>(
  callback: Parameters<typeof wrapTransactionFn<Database, T>>[0],
): Promise<T> {
  return await wrapTransactionFn<Database, T>(callback);
}
```

4. Use the `wrapTransaction` function to execute queries

```typescript
const users = await wrapTransaction(async (trx) => {
  return await trx.selectFrom("users").selectAll().execute();
});
```

## 🩺 Testing

> [!TIP]\
> See examples at `./tests/testing/utils_test.ts`.

`setupTesting` function is provided to set up the testing environment. It stubs
transaction functions, and each test runs in a transaction that is rolled back
after the test. Theoretically, tests are isolated from each other, and can be
run in parallel.

1. Add a helper function to setup the testing database

```typescript
// test_helper.ts

import { PostgresJSDialect, setup } from "kysely-deno-postgres-dialect";
import { Kysely } from "kysely";
import postgres from "postgresjs";

export function setupTestingDB() {
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
}
```

2. Setup the testing environment in the test files, and write tests

```typescript
// test files

import { setupTesting } from "kysely-deno-postgres-dialect/testing";
import { stub } from "jsr:@std/testing/mock";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "jsr:@std/testing/bdd";

setupTesting({ stub, beforeEach, afterEach, beforeAll, afterAll });

describe("this is a description", () => {
  it("works", async () => {
    // snip
  });
});
```
