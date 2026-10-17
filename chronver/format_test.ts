// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertThrows } from "@ende/assert";
import { format } from "./format.ts";
import { parse } from "./parse.ts";
import type { ChronVer } from "./types.ts";

Ende.test("format() round-trips canonical versions", async t => {
  const versions = [
    "2024.04.03",
    "2024.04.03.1",
    "2024.01.05",
    "2024.12.25",
    "2024.04.03-feature",
    "2024.04.03.1-feature",
    "2024.04.03-new-ui",
    "2024.04.03-break",
    "2024.04.03.1-break"
  ];

  for (const value of versions) {
    await t.step(value, () => assertEquals(format(parse(value)), value));
  }
});

Ende.test("format() omits changeset 0", () => {
  assertEquals(format({ year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false }), "2024.04.03");
});

Ende.test("format(parse(s)) returns s for every valid string", async t => {
  const versions = [
    "2024.04.03",
    "2024.04.03.1",
    "2024.04.03.15",
    "2024.12.31.999",
    `2024.04.03.${Number.MAX_SAFE_INTEGER}`,
    "2024.02.29",
    "2000.02.29",
    "0001.01.01",
    "0999.12.31",
    "9999.12.31",
    "2024.04.03-feature",
    "2024.04.03.1-feature",
    "2024.04.03-feature-name-123",
    "2024.04.03-Feature",
    "2024.04.03-feature-break",
    "2024.04.03-breaking",
    "2024.04.03--ui",
    "2024.04.03-ui-",
    "2024.04.03-0",
    "2024.04.03-break",
    "2024.04.03.1-break"
  ];

  for (const value of versions) {
    await t.step(value, () => assertEquals(format(parse(value)), value));
  }
});

Ende.test("format() pads months and days", () => {
  assertEquals(format({ year: 2024, month: 1, day: 5, changeset: 0, isBreaking: false }), "2024.01.05");
});

Ende.test("format() pads the year to 4 digits", () => {
  assertEquals(format({ year: 1, month: 1, day: 1, changeset: 0, isBreaking: false }), "0001.01.01");
  assertEquals(format({ year: 999, month: 12, day: 31, changeset: 0, isBreaking: false }), "0999.12.31");
});

Ende.test("format() throws on a year outside 1 to 9999", async t => {
  for (const year of [0, -1, 10000]) {
    await t.step(String(year), () => {
      assertThrows(
        () => format({ year, month: 1, day: 1, changeset: 0, isBreaking: false }),
        TypeError,
        `Cannot format version: year must be between 1 and 9999, received ${year}`
      );
    });
  }
});

Ende.test("format() throws when both feature and isBreaking are set", () => {
  assertThrows(
    () => format({ year: 2024, month: 4, day: 3, changeset: 0, feature: "ui", isBreaking: true }),
    TypeError,
    "Cannot format version: a version cannot have both a feature and -break"
  );
});

Ende.test("format() throws on an invalid feature name", async t => {
  for (const feature of ["", "-", "---", "bad_name", "a b", "ui.1", "break"]) {
    await t.step(JSON.stringify(feature), () => {
      assertThrows(
        () => format({ year: 2024, month: 4, day: 3, changeset: 0, feature, isBreaking: false }),
        TypeError,
        `Cannot format version: feature must be letters, digits and hyphens (not only hyphens) and not "break", received "${feature}"`
      );
    });
  }
});

Ende.test("format() throws on an invalid date or changeset", async t => {
  const cases: [Partial<ChronVer>, string][] = [
    [{ year: 2024.5 }, "year must be between 1 and 9999, received 2024.5"],
    [{ month: 0 }, "month must be between 1 and 12, received 0"],
    [{ month: 13 }, "month must be between 1 and 12, received 13"],
    [{ month: 4, day: 31 }, "day must be between 1 and 30 for 2024-04, received 31"],
    [{ month: 2, day: 30 }, "day must be between 1 and 29 for 2024-02, received 30"],
    [{ day: 0 }, "day must be between 1 and 30 for 2024-04, received 0"],
    [{ changeset: -1 }, "changeset must be a non-negative integer of at most 9007199254740991, received -1"],
    [{ changeset: 1.5 }, "changeset must be a non-negative integer of at most 9007199254740991, received 1.5"],
    [{ changeset: Number.MAX_SAFE_INTEGER + 1 }, "changeset must be a non-negative integer of at most 9007199254740991, received 9007199254740992"]
  ];

  for (const [fields, message] of cases) {
    await t.step(JSON.stringify(fields), () => {
      const version: ChronVer = { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false, ...fields };
      assertThrows(() => format(version), TypeError, `Cannot format version: ${message}`);
    });
  }
});

Ende.test("parse(format(v)) returns v for every version format accepts", async t => {
  const versions: ChronVer[] = [
    { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 7, isBreaking: false },
    { year: 1, month: 1, day: 1, changeset: 0, isBreaking: false },
    { year: 9999, month: 12, day: 31, changeset: Number.MAX_SAFE_INTEGER, isBreaking: false },
    { year: 2024, month: 2, day: 29, changeset: 0, isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: "new-ui", isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 2, feature: "-ui-", isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, feature: "breaking", isBreaking: false },
    { year: 2024, month: 4, day: 3, changeset: 0, isBreaking: true },
    { year: 2024, month: 4, day: 3, changeset: 3, isBreaking: true }
  ];

  for (const version of versions) {
    await t.step(JSON.stringify(version), () => assertEquals(parse(format(version)), version));
  }
});
