import { Transaction as KyselyTransaction } from "kysely/index.js";
import { _internals, Callback, closeDB, getDB } from "../utils.ts";
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

/**
 * Setup a database for testing.
 *
 * @param stub - The stub to use for wrapping the transaction.
 * @returns The `beforeAllFn`, `beforeEachFn`, `afterEachFn` and `afterAllFn` functions to use in your test suite.
 * @example
 * ```ts
 * import { stub } from "https://deno.land/std@0.210.0/testing/mock.ts";
 * const { beforeEachFn, afterEachFn } = setupTesting(stub)
 * ```
 */
export function setupTesting<T>(
  stub: (...args: unknown[]) => Stub,
) {
  let transactionStub: Maybe<Stub>;

  // deno-lint-ignore require-await
  const beforeAllFn = async () => {
    getDB<T>();
  };

  const beforeEachFn = async () => {
    const db = getDB<T>();

    const { trx, rollback } = await begin(db);
    transaction = trx;
    rollbackFn = rollback;

    transactionStub = stub(
      _internals,
      "doWrapTransaction",
      doWrapTransactionStub,
    );
  };

  const afterEachFn = async () => {
    if (transaction) {
      await rollbackFn?.();
      transaction = undefined;
    }

    transactionStub?.restore();
  };

  const afterAllFn = async () => {
    await closeDB();
  };

  return { beforeAllFn, beforeEachFn, afterEachFn, afterAllFn };
}
