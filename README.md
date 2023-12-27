# kysely-deno-postgres-dialect

[![ci](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml/badge.svg)](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml)
[![Latest version](https://deno.land/badge/kysely_deno_postgres_dialect/version)](https://deno.land/x/kysely_deno_postgres_dialect)

[Kysely](https://github.com/kysely-org/kysely) dialect for PostgreSQL using the
[deno-postgres](https://github.com/denodrivers/postgres) client.

## 🚀 Getting started

```typescript
import {
  KyselyDenoPostgresDialect,
  setup,
} from "https://deno.land/x/kysely_deno_postgres_dialect/mod.ts";

setup(() => {
  const dialect = new KyselyDenoPostgresDialect({
    pool: new Pool(
      {
        database: "postgres",
        hostname: "localhost",
        password: "postgres",
        port: 5432,
        user: "postgres",
      },
      10,
      true,
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
  KyselyDenoPostgresDialect,
  PostgresConnection,
  setup,
  wrapTransaction,
} from "https://deno.land/x/kysely_deno_postgres_dialect/mod.ts";
import { setupTesting } from "https://deno.land/x/kysely_deno_postgres_dialect/testing.ts";

const connections: PostgresConnection[] = [];

setup(() => {
  const dialect = new KyselyDenoPostgresDialect({
    pool: new Pool(
      {
        database: "postgres",
        hostname: "localhost",
        password: "postgres",
        port: 5432,
        user: "postgres",
      },
      10,
      true,
    ),
    onCreateConnection: (connection: DatabaseConnection) => {
      connections.push(connection as PostgresConnection);
    },
  });

  return new Kysely<Database>({
    dialect,
  });
});

async function endConnections() {
  for (const connection of connections) {
    await connection.end();
  }
}

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
    await endConnections();
    await afterEachFn();
  });

  it("works", async () => {
    // snip
  });
});
```
