import { Kysely, Transaction } from "kysely/index.js";

type Maybe<T> = T | undefined;

type DB<T> = Kysely<T>;
// deno-lint-ignore no-explicit-any
let db: Maybe<DB<any>>;

type SetupFn<T> = () => DB<T>;
// deno-lint-ignore no-explicit-any
let setupFn: Maybe<SetupFn<any>>;

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

export function getDB<T>(): Kysely<T> {
  return db || newDB<T>();
}

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

export async function wrapTransaction<T, U>(
  callback: Callback<T, U>,
): Promise<U> {
  return await _internals.doWrapTransaction<T, U>(callback);
}

export const _internals = { doWrapTransaction };
