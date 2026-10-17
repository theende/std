// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertThrows } from "@ende/assert";
import type { ChronVer } from "./types.ts";
import { parse } from "./parse.ts";

Ende.test("parse() handles valid versions", async t => {
  const cases: [string, ChronVer][] = [
    ["2024.04.03", { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false }],
    ["2024.04.03.1", { year: 2024, month: 4, day: 3, changeset: 1, isBreaking: false }],
    ["2024.04.03.15", { year: 2024, month: 4, day: 3, changeset: 15, isBreaking: false }],
    ["2024.12.31.999", { year: 2024, month: 12, day: 31, changeset: 999, isBreaking: false }],
    ["2024.04.03.999999", { year: 2024, month: 4, day: 3, changeset: 999999, isBreaking: false }],
    ["2024.04.03-feature", { year: 2024, month: 4, day: 3, changeset: 0, feature: "feature", isBreaking: false }],
    ["2024.04.03.1-feature", { year: 2024, month: 4, day: 3, changeset: 1, feature: "feature", isBreaking: false }],
    ["2024.04.03-feature-name", { year: 2024, month: 4, day: 3, changeset: 0, feature: "feature-name", isBreaking: false }],
    ["2024.04.03-feature-name-123", { year: 2024, month: 4, day: 3, changeset: 0, feature: "feature-name-123", isBreaking: false }],
    ["2024.04.03-new-ui", { year: 2024, month: 4, day: 3, changeset: 0, feature: "new-ui", isBreaking: false }],
    ["2024.04.03-break", { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: true }],
    ["2024.04.03.1-break", { year: 2024, month: 4, day: 3, changeset: 1, isBreaking: true }],
    ["0001.01.01", { year: 1, month: 1, day: 1, changeset: 0, isBreaking: false }]
  ];

  for (const [value, expected] of cases) {
    await t.step(value, () => {
      assertEquals(parse(value), expected);
    });
  }
});

Ende.test("parse() rejects a changeset after the label", async t => {
  for (const value of ["2024.04.03-feature.5", "2024.04.03.1-feature.5", "2024.04.03.0-feature.5", "2024.04.03-break.5", "2024.04.03.1-break.2"]) {
    await t.step(value, () => {
      assertThrows(() => parse(value), TypeError, `Cannot parse version: ${value}`);
    });
  }
});

Ende.test("parse() treats a feature containing break as a feature", () => {
  assertEquals(parse("2024.04.03-feature-break"), {
    year: 2024,
    month: 4,
    day: 3,
    changeset: 0,
    feature: "feature-break",
    isBreaking: false
  });
});

Ende.test("parse() validates real calendar days", async t => {
  const valid = ["2024.02.29", "2000.02.29", "2024.01.31", "2024.04.30", "2023.02.28"];
  const invalid = ["2023.02.29", "1900.02.29", "2024.02.30", "2024.04.31", "2024.06.31", "2024.09.31", "2024.11.31"];

  for (const value of valid) {
    await t.step(`${value} is valid`, () => {
      assertEquals(parse(value).day, Number(value.slice(-2)));
    });
  }

  for (const value of invalid) {
    await t.step(`${value} is invalid`, () => {
      assertThrows(() => parse(value), TypeError);
    });
  }
});

Ende.test("parse() throws on invalid versions", async t => {
  const versions = [
    "",
    "invalid",
    "2024",
    "2024.4.3",
    "2024.04.32",
    "2024.13.15",
    "2024.00.15",
    "2024.04.00",
    "2024.04.03.-1",
    "2024.04.03.1.2",
    "24.04.03",
    "2024.4.03",
    "2024.04.3",
    "0000.01.01",
    " 2024.04.03",
    "2024.04.03-",
    "2024.04.03-feature_name"
  ];

  for (const value of versions) {
    await t.step(JSON.stringify(value), () => {
      assertThrows(() => parse(value), TypeError);
    });
  }
});

Ende.test("parse() throws on non-string input", async t => {
  for (const value of [null, undefined, 20240403, {}, []]) {
    await t.step(JSON.stringify(value) ?? "undefined", () => {
      assertThrows(() => parse(value as unknown as string), TypeError, "Cannot parse version as version must be a string");
    });
  }
});

Ende.test("parse() throws descriptive errors", () => {
  assertThrows(() => parse("invalid"), TypeError, "Cannot parse version: invalid");
  assertThrows(() => parse("0000.01.01"), TypeError, "Cannot parse version 0000.01.01: year must be positive");
  assertThrows(() => parse("2023.02.29"), TypeError, "Cannot parse version 2023.02.29: day must be between 1 and 28 for 2023-02");
});

Ende.test("parse() rejects a feature made only of hyphens", async t => {
  for (const value of ["2024.04.03--", "2024.04.03---"]) {
    await t.step(value, () => {
      assertThrows(() => parse(value), TypeError);
    });
  }
});

Ende.test("parse() rejects leading zeros and an explicit 0 in the changeset", async t => {
  for (const value of ["2024.04.03.01", "2024.04.03.0", "2024.04.03.00", "2024.04.03.0-break"]) {
    await t.step(value, () => {
      assertThrows(() => parse(value), TypeError);
    });
  }
});

Ende.test("parse() rejects a changeset above Number.MAX_SAFE_INTEGER", () => {
  assertEquals(parse(`2024.04.03.${Number.MAX_SAFE_INTEGER}`).changeset, Number.MAX_SAFE_INTEGER);
  assertThrows(
    () => parse("2024.04.03.9007199254740992"),
    TypeError,
    "Cannot parse version 2024.04.03.9007199254740992: changeset must be at most 9007199254740991"
  );
});

Ende.test("parse() accepts the year bounds 0001 and 9999", () => {
  assertEquals(parse("0001.01.01").year, 1);
  assertEquals(parse("9999.12.31").year, 9999);
});
