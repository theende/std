// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertFalse } from "@ende/assert";
import { isChronVer } from "./is_chronver.ts";

Ende.test("isChronVer() returns true for valid ChronVer objects", async t => {
  const values = [
    { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 5, feature: "new-ui", isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 1, isBreaking: true },
    { year: 2024, month: 2, day: 29, changeset: 0, isBreaking: false },
    { year: 1, month: 1, day: 1, changeset: 0, isBreaking: false },
    { year: 9999, month: 12, day: 31, changeset: Number.MAX_SAFE_INTEGER, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false, extra: true }
  ];

  for (const value of values) {
    await t.step(JSON.stringify(value), () => assert(isChronVer(value)));
  }
});

Ende.test("isChronVer() returns false for invalid values", async t => {
  const values: unknown[] = [
    null,
    undefined,
    "2024.04.03",
    2024,
    [],
    {},
    { year: 2024, month: 4, day: 3 },
    { year: 0, month: 4, day: 3, changeset: 0, isBreaking: false },
    { year: 2024, month: 13, day: 3, changeset: 0, isBreaking: false },
    { year: 2024, month: 0, day: 3, changeset: 0, isBreaking: false },
    { year: 2024, month: 4, day: 31, changeset: 0, isBreaking: false },
    { year: 2023, month: 2, day: 29, changeset: 0, isBreaking: false },
    { year: 2024, month: 4, day: 0, changeset: 0, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: -1, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 1.5, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: NaN, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: "bad_name", isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: 1, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: "no" },
    { year: 10000, month: 1, day: 1, changeset: 0, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: Number.MAX_SAFE_INTEGER + 1, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: "ui", isBreaking: true },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: "", isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: "---", isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: "break", isBreaking: false }
  ];

  for (const value of values) {
    await t.step(JSON.stringify(value) ?? "undefined", () => assertFalse(isChronVer(value)));
  }
});
