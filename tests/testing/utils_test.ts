import { stub } from "../deps.ts";
import { assertObjectMatch } from "../deps.ts";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "../deps.ts";

import { db } from "../support/database.ts";
import type { Database } from "../support/types.ts";
import { setup, wrapTransaction } from "../../src/utils.ts";
import { setupTesting } from "../../src/testing/utils.ts";
import { CompiledQuery } from "kysely";

setup(() => {
  return db;
});

setupTesting({ stub, beforeEach, afterEach, beforeAll, afterAll });

describe("testing_utils", () => {
  it("works", async () => {
    const result = await wrapTransaction<Database, { age: number }>(
      async (trx) => {
        const result = await trx.executeQuery<{ age: number }>(
          CompiledQuery.raw("SELECT 1 as age"),
        );

        return result.rows[0];
      },
    );

    assertObjectMatch(result, { age: 1 });
  });

  it("works for multiple cases", async () => {
    const result = await wrapTransaction<Database, { flag: boolean }>(
      async (trx) => {
        const result = await trx.executeQuery<{ flag: boolean }>(
          CompiledQuery.raw("SELECT true as flag"),
        );

        return result.rows[0];
      },
    );

    assertObjectMatch(result, { flag: true });
  });
});
