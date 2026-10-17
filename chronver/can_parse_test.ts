// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assert, assertFalse } from "@ende/assert";
import { canParse } from "./can_parse.ts";

Ende.test("canParse() returns true for valid versions", async t => {
  const versions = [
    "2024.04.03",
    "2024.04.03.1",
    "2024.04.03.15",
    "2024.12.31.999",
    "2024.04.03-feature",
    "2024.04.03.1-feature",
    "2024.04.03-break",
    "2024.04.03.1-break",
    "2024.04.03-feature-name",
    "2024.02.29"
  ];

  for (const value of versions) {
    await t.step(value, () => assert(canParse(value)));
  }
});

Ende.test("canParse() returns false for invalid versions", async t => {
  const versions = [
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
    "2023.02.29",
    "2024.04.31",
    "2024.04.03-feature.5",
    "2024.04.03-break.1",
    "2024.04.03.0",
    "2024.04.03--"
  ];

  for (const value of versions) {
    await t.step(value, () => assertFalse(canParse(value)));
  }
});
