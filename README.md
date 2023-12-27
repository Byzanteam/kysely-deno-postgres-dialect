# kysely-deno-postgres-dialect

[![ci](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml/badge.svg)](https://github.com/Byzanteam/kysely_deno_postgres_dialect/actions/workflows/ci.yml)

[Kysely](https://github.com/kysely-org/kysely) dialect for PostgreSQL using the
[deno-postgres](https://github.com/denodrivers/postgres) client.

## 🚀 Getting started

```typescript
import { PostgresDialect } from "https://deno.land/x/kysely_deno_postgres_dialect/mod.ts";

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

export const db = new Kysely<Database>({
  dialect,
});
```
