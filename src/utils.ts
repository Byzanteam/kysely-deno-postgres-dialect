import type { Kysely, Transaction } from "kysely";

type Maybe<T> = T | undefined;

type DB<T> = Kysely<T>;
// deno-lint-ignore no-explicit-any
let db: Maybe<DB<any>>;

type SetupFn<T> = () => DB<T>;
// deno-lint-ignore no-explicit-any
let setupFn: Maybe<SetupFn<any>>;

/**
 * Sets up the database instance using the provided setup function.
 * This function must be called before any database operations are performed.
 * @param setup - A function that returns a configured Kysely database instance.
 */
export function setup<T>(setup: SetupFn<T>): void {
  setupFn = setup;
}

function newDB<T>(): DB<T> {
  if (setupFn) {
    db = setupFn();
    return db;
  }

  throw new Error("Please call setup() before using the database");
}

/**
 * Get the database instance. Ensure you call `setup` before calling this function.
 * @returns The database instance.
 * @throws Will throw an error if `setup` has not been called.
 */
export function getDB<T>(): Kysely<T> {
  return db || newDB<T>();
}

/**
 * Closes the database connection.
 */
export async function closeDB() {
  if (db) {
    await db.destroy();
    db = undefined;
  }
}

export type Callback<T, U> = (trx: Transaction<T>) => Promise<U>;

async function doWrapTransaction<T, U>(callback: Callback<T, U>): Promise<U> {
  return await getDB<T>().transaction().execute(callback);
}

/**
 * Wraps a callback in a transaction.
 * @param callback - The callback to wrap.
 * @returns The result of the callback.
 *
 * @example
 * ```ts
 * const users = await wrapTransaction(async (trx) => {
 *   return await trx.selectFrom("user").selectAll().execute();
 * });
 *  ```
 */
export async function wrapTransaction<T, U>(
  callback: Callback<T, U>,
): Promise<U> {
  return await _internals.doWrapTransaction<T, U>(callback);
}

export const _internals = { doWrapTransaction };
