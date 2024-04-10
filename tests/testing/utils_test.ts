import { stub } from "https://deno.land/std@0.210.0/testing/mock.ts";
import { assertObjectMatch } from "https://deno.land/std@0.210.0/assert/mod.ts";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";

import { db } from "../support/database.ts";
import { Database } from "../support/types.ts";
import { setup, wrapTransaction } from "../../src/utils.ts";
import { setupTesting } from "../../src/testing/utils.ts";
import { CompiledQuery } from "../../deps.ts";

setup(() => {
  return db;
});

const {
  beforeAllFn,
  beforeEachFn,
  afterEachFn,
  afterAllFn,
} = setupTesting(stub);

describe("testing_utils", () => {
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
    await afterEachFn();
  });

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
