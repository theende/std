// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertThrows } from "@ende/assert";
import { increment } from "./increment.ts";
import { parse } from "./parse.ts";

Ende.test("increment() bumps the changeset on the same day", () => {
  assertEquals(increment(parse("2024.04.03.5"), new Date(2024, 3, 3, 15, 30)), parse("2024.04.03.6"));
});

Ende.test("increment() bumps changeset 0 to 1 on the same day", () => {
  assertEquals(increment(parse("2024.04.03"), new Date(2024, 3, 3)), parse("2024.04.03.1"));
});

Ende.test("increment() drops the feature and -break on the same day", () => {
  assertEquals(increment(parse("2024.04.03.1-feature"), new Date(2024, 3, 3)), parse("2024.04.03.2"));
  assertEquals(increment(parse("2024.04.03.1-break"), new Date(2024, 3, 3)), parse("2024.04.03.2"));
});

Ende.test("increment() returns the date's version on another day", () => {
  assertEquals(increment(parse("2023.01.01.5"), new Date(2024, 3, 3)), parse("2024.04.03"));
  assertEquals(increment(parse("2024.04.02.3-break"), new Date(2024, 3, 3)), parse("2024.04.03"));
});

Ende.test("increment() throws when the version is after the date", async t => {
  for (const value of ["2025.01.01.5", "2024.05.01", "2024.04.04-break"]) {
    await t.step(value, () => {
      assertThrows(
        () => increment(parse(value), new Date(2024, 3, 3)),
        TypeError,
        `Cannot increment version ${value.slice(0, 10)}: its date is later than 2024.04.03`
      );
    });
  }
});

Ende.test("increment() defaults to today", () => {
  const today = new Date();
  const version = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate(), changeset: 5, isBreaking: false };
  const incremented = increment(version);
  // Guard against the day rolling over between the two `new Date()` calls.
  if (incremented.day === version.day)
    assertEquals(incremented.changeset, 6);
});
