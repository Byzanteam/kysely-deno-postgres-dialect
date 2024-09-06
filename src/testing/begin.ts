// deno-lint-ignore-file
// https://github.com/kysely-org/kysely/issues/257#issuecomment-1676079354

import { Kysely, Transaction } from "kysely";

class Deferred<T> {
  readonly #promise: Promise<T>;
  #resolve?: (value: T | PromiseLike<T>) => void;
  #reject?: (reason?: any) => void;

  constructor() {
    this.#promise = new Promise<T>((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }

  get promise(): Promise<T> {
    return this.#promise;
  }

  resolve(value: T | PromiseLike<T>): void {
    this.#resolve?.(value);
  }

  reject(reason?: any): void {
    this.#reject?.(reason);
  }
}

export default async function begin<T>(db: Kysely<T>) {
  const connection = new Deferred<Transaction<T>>();
  const result = new Deferred<any>();

  const execution = db.transaction().execute(async (trx) => {
    connection.resolve(trx);
    await result.promise;
  }).catch((_err) => {
    // Swallow the exception here
  });

  const trx = await connection.promise;

  return {
    trx,
    async rollback() {
      result.reject(new Error("rollback"));
      await execution;
    },
  };
}
