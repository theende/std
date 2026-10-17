// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { tryParse } from "./try_parse.ts";

Ende.test("tryParse() returns the parsed version", () => {
  assertEquals(tryParse("2024.04.03.5-feature"), {
    year: 2024,
    month: 4,
    day: 3,
    changeset: 5,
    feature: "feature",
    isBreaking: false
  });
});

Ende.test("tryParse() returns undefined on invalid versions", async t => {
  for (const value of ["invalid", "2023.02.29", "2024.13.01", "", null, undefined, 1]) {
    await t.step(JSON.stringify(value) ?? "undefined", () => {
      assertEquals(tryParse(value as string), undefined);
    });
  }
});
