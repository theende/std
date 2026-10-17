// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertThrows } from "@ende/assert";
import { fromDate } from "./from_date.ts";

Ende.test("fromDate() creates a version from a local date", () => {
  assertEquals(fromDate(new Date(2024, 3, 3)), { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false });
});

Ende.test("fromDate() uses local time, not UTC", () => {
  assertEquals(fromDate(new Date(2024, 0, 1, 0, 0, 1)).day, 1);
  assertEquals(fromDate(new Date(2024, 0, 1, 23, 59, 59)).day, 1);
});

Ende.test("fromDate() sets the changeset", () => {
  assertEquals(fromDate(new Date(2024, 3, 3), 5), { year: 2024, month: 4, day: 3, changeset: 5, isBreaking: false });
});

Ende.test("fromDate() throws on a negative or non-integer changeset", async t => {
  for (const changeset of [-1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    await t.step(String(changeset), () => {
      assertThrows(
        () => fromDate(new Date(2024, 3, 3), changeset),
        TypeError,
        `Cannot create version from date: changeset must be a non-negative integer, received ${changeset}`
      );
    });
  }
});

Ende.test("fromDate() supports years 1 to 9999", () => {
  const date = new Date(2024, 0, 1);
  date.setFullYear(999);
  assertEquals(fromDate(date).year, 999);
  date.setFullYear(9999);
  assertEquals(fromDate(date).year, 9999);
});

Ende.test("fromDate() throws on a year outside 1 to 9999", async t => {
  for (const year of [0, 10000]) {
    await t.step(String(year), () => {
      const date = new Date(2024, 0, 1);
      date.setFullYear(year);
      assertThrows(() => fromDate(date), TypeError, `Cannot create version from date: year must be between 1 and 9999, received ${year}`);
    });
  }
});

Ende.test("fromDate() throws on an invalid date", () => {
  assertThrows(() => fromDate(new Date(NaN)), TypeError, "Cannot create version from date: date is invalid");
});
