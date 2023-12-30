import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  it,
} from "https://deno.land/std@0.210.0/testing/bdd.ts";
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.210.0/assert/mod.ts";

import { kysely } from "../deps.ts";
import { db } from "./support/database.ts";
import * as PersonRepository from "./support/person-repository.ts";

const sql = kysely.sql;

describe("PersonRepository", () => {
  beforeAll(async () => {
    await db.schema.createTable("person")
      .addColumn("id", "serial", (cb) => cb.primaryKey())
      .addColumn("first_name", "varchar", (cb) => cb.notNull())
      .addColumn("last_name", "varchar")
      .addColumn("gender", "varchar(50)", (cb) => cb.notNull())
      .addColumn(
        "created_at",
        "timestamp",
        (cb) => cb.notNull().defaultTo(sql`now()`),
      )
      .execute();
  });

  afterEach(async () => {
    await sql`truncate table ${sql.table("person")}`.execute(db);
  });

  afterAll(async () => {
    await db.schema.dropTable("person").execute();
    await db.destroy();
  });

  it("should find a person with a given id", async () => {
    await PersonRepository.findPersonById(123);
  });

  it("should find all people named Arnold", async () => {
    await PersonRepository.findPeople({ first_name: "Arnold" });
  });

  it("should update gender of a person with a given id", async () => {
    await PersonRepository.updatePerson(123, { gender: "woman" });
  });

  it("should create a person", async () => {
    await PersonRepository.createPerson({
      first_name: "Jennifer",
      last_name: "Aniston",
      gender: "woman",
    });
  });

  it("should delete a person with a given id", async () => {
    await PersonRepository.deletePerson(123);
  });

  it("should return numAffectedRows", async () => {
    const insertResult = await db.insertInto("person")
      .values({
        first_name: "Jennifer",
        last_name: "Aniston",
        gender: "woman",
      })
      .executeTakeFirst();

    assertEquals(insertResult.numInsertedOrUpdatedRows, BigInt(1));

    const [person] = await PersonRepository.findPeople({});
    assertExists(person);

    const updateResult = await db
      .updateTable("person")
      .set({ gender: "woman" })
      .where("id", "=", person.id)
      .executeTakeFirst();

    assertEquals(updateResult.numUpdatedRows, BigInt(1));

    const deleteResult = await db
      .deleteFrom("person")
      .where("id", "=", person.id)
      .executeTakeFirst();

    assertEquals(deleteResult.numDeletedRows, BigInt(1));
  });
});
