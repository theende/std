// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

/**
 * The Chronological Version parser.
 *
 * Adapted from {@link https://github.com/ChronVer/chronver | ChronVer}. See
 * {@link https://chronver.org} for the spec.
 *
 * ```ts
 * import { format, greaterThan, increment, parse } from "@ende/chronver";
 * import { assert, assertEquals } from "@ende/assert";
 *
 * const version = parse("2024.04.03.1");
 * assertEquals(version, {
 *   year: 2024,
 *   month: 4,
 *   day: 3,
 *   changeset: 1,
 *   isBreaking: false
 * });
 *
 * assertEquals(format(version), "2024.04.03.1");
 * assert(greaterThan(parse("2024.04.04"), version));
 *
 * // Same day: bump the changeset. Another day: that date's version.
 * assertEquals(format(increment(version, new Date(2024, 3, 3))), "2024.04.03.2");
 * assertEquals(format(increment(version, new Date(2024, 3, 4))), "2024.04.04");
 * ```
 *
 * ## Format
 *
 * ```
 * YYYY.MM.DD[.CHANGESET][-FEATURE|-break]
 * ```
 *
 * | Version                | Description                   |
 * | ---------------------- | ----------------------------- |
 * | `2025.07.21`           | Released July 21st, 2025      |
 * | `2025.07.21.1`         | First hotfix that day         |
 * | `2025.07.21.3`         | Third change that day         |
 * | `2025.07.21-feature`   | Feature branch for that date  |
 * | `2025.07.21.1-feature` | Feature branch with changeset |
 * | `2025.07.21.1-break`   | Breaking change               |
 *
 * The date must be a real calendar date: `2024.02.29` is valid, `2023.02.29`
 * and `2024.04.31` are not. Dates are read and written in local time.
 *
 * @module
 */
export * from "./can_parse.ts";
export * from "./compare.ts";
export * from "./equals.ts";
export * from "./format.ts";
export * from "./from_date.ts";
export * from "./greater_or_equal.ts";
export * from "./greater_than.ts";
export * from "./increment.ts";
export * from "./is_chronver.ts";
export * from "./less_or_equal.ts";
export * from "./less_than.ts";
export * from "./parse.ts";
export * from "./sort.ts";
export * from "./try_parse.ts";
export * from "./types.ts";
