// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";

function compareNumber(a: number, b: number): 1 | 0 | -1 {
  if (a > b)
    return 1;
  if (a < b)
    return -1;
  return 0;
}

/**
 * Compare two ChronVers.
 *
 * Versions are ordered by year, month, day and changeset. When those match, a
 * `-break` version sorts after one without it.
 *
 * The feature is ignored, like build metadata in SemVer: `2024.04.03-a`,
 * `2024.04.03-b` and `2024.04.03` all compare equal.
 *
 * Returns `0` if `version1` equals `version2`, or `1` if `version1` is greater, or `-1` if `version2` is
 * greater.
 *
 * Sorts in ascending order if passed to {@linkcode Array.sort}.
 *
 * @example Usage
 * ```ts
 * import { parse, compare } from "@ende/chronver";
 * import { assertEquals } from "@ende/assert";
 *
 * const version1 = parse("2024.04.03");
 * const version2 = parse("2024.04.04");
 *
 * assertEquals(compare(version1, version2), -1);
 * assertEquals(compare(version2, version1), 1);
 * assertEquals(compare(version1, version1), 0);
 * assertEquals(compare(parse("2024.04.03.1-break"), parse("2024.04.03.1")), 1);
 * ```
 *
 * @param version1 The first ChronVer to compare
 * @param version2 The second ChronVer to compare
 * @returns `1` if `version1` is greater, `0` if equal, or `-1` if `version2` is greater
 */
export function compare(version1: ChronVer, version2: ChronVer): 1 | 0 | -1 {
  return (
    compareNumber(version1.year, version2.year) ||
    compareNumber(version1.month, version2.month) ||
    compareNumber(version1.day, version2.day) ||
    compareNumber(version1.changeset, version2.changeset) ||
    compareNumber(Number(version1.isBreaking), Number(version2.isBreaking))
  );
}
