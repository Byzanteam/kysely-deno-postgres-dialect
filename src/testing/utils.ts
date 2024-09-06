import type { Transaction as KyselyTransaction } from "kysely";
import { _internals, type Callback, closeDB, getDB } from "../utils.ts";
import begin from "./begin.ts";

type Maybe<T> = T | undefined;

// deno-lint-ignore no-explicit-any
type Transaction = KyselyTransaction<any>;
let transaction: Maybe<Transaction>;

let rollbackFn: Maybe<() => Promise<void>>;

async function doWrapTransactionStub<T, U>(
  callback: Callback<T, U>,
): Promise<U> {
  if (!transaction) {
    throw new Error("Transaction not initialized");
  }

  return await callback(transaction);
}

type Stub = { restore: () => unknown };
type beforeAll<T> = (fn: (this: T) => void | Promise<void>) => void;
type afterAll<T> = (fn: (this: T) => void | Promise<void>) => void;
type beforeEach<T> = (fn: (this: T) => void | Promise<void>) => void;
type afterEach<T> = (fn: (this: T) => void | Promise<void>) => void;

interface setupTestingOptions {
  stub: (...args: unknown[]) => Stub;
  beforeAll: beforeAll<unknown>;
  beforeEach: beforeEach<unknown>;
  afterEach: afterEach<unknown>;
  afterAll: afterAll<unknown>;
}

/**
 * Setup the database for testing.
 * It will create a transaction for each test case and rollback the transaction after each test case.
 *
 * @param stub - The stub to use for wrapping the transaction.
 * @param beforeAll - The `beforeAll` function from the test suite.
 * @param beforeEach - The `beforeEach` function from the test suite.
 * @param afterEach - The `afterEach` function from the test suite.
 * @param afterAll - The `afterAll` function from the test suite.
 * @returns void
 *
 * @example
 * ```ts
 * import { stub } from "jsr:@std/testing/mock";
 * import bdd from "jsr:@std/testing/bdd";
 * setupTesting({stub, ...bdd})
 * ```
 */
export function setupTesting<T>(
  { stub, beforeAll, beforeEach, afterEach, afterAll }: setupTestingOptions,
): void {
  let transactionStub: Maybe<Stub>;

  beforeAll(() => {
    getDB<T>();
  });

  beforeEach(async () => {
    const db = getDB<T>();

    const { trx, rollback } = await begin(db);
    transaction = trx;
    rollbackFn = rollback;

    transactionStub = stub(
      _internals,
      "doWrapTransaction",
      doWrapTransactionStub,
    );
  });

  afterEach(async () => {
    if (transaction) {
      await rollbackFn?.();
      transaction = undefined;
    }

    transactionStub?.restore();
  });

  afterAll(async () => {
    // To fix `leaking resources` error, close the database connection
    await closeDB();
  });
}
