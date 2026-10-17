// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { compare } from "./compare.ts";
import { parse } from "./parse.ts";

Ende.test("compare() orders versions", async t => {
  const cases: [string, string, number][] = [
    ["2024.04.03", "2024.04.04", -1],
    ["2024.04.04", "2024.04.03", 1],
    ["2024.04.03", "2024.05.03", -1],
    ["2024.04.03", "2025.04.03", -1],
    ["2024.12.31", "2025.01.01", -1],
    ["2024.04.03", "2024.04.03", 0],
    ["2024.04.03.1", "2024.04.03.2", -1],
    ["2024.04.03.2", "2024.04.03.1", 1],
    ["2024.04.03", "2024.04.03.1", -1],
    ["2024.04.03.10", "2024.04.03.9", 1],
    ["2024.04.03.1-break", "2024.04.03.1", 1],
    ["2024.04.03.1", "2024.04.03.1-break", -1],
    ["2024.04.03-break", "2024.04.03.1", -1],
    ["2024.04.03.1-break", "2024.04.03.1-break", 0],
    ["2024.04.04", "2024.04.03.5-break", 1]
  ];

  for (const [v0, v1, expected] of cases) {
    await t.step(`${v0} and ${v1}`, () => {
      assertEquals(compare(parse(v0), parse(v1)), expected);
    });
  }
});

Ende.test("compare() ignores the feature", () => {
  assertEquals(compare(parse("2024.04.03-feature1"), parse("2024.04.03-feature2")), 0);
  assertEquals(compare(parse("2024.04.03-feature"), parse("2024.04.03")), 0);
});

Ende.test("compare() sorts in ascending order when passed to Array.sort", () => {
  const versions = ["2024.04.05", "2024.04.03.1", "2024.04.03", "2024.04.04"].map(parse);
  assertEquals(versions.sort(compare).map(v => [v.day, v.changeset]), [[3, 0], [3, 1], [4, 0], [5, 0]]);
});
