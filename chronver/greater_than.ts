// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { compare } from "./compare.ts";

/**
 * Greater than comparison for two ChronVers.
 *
 * This is equal to `compare(version1, version2) > 0`.
 *
 * @example Usage
 * ```ts
 * import { parse, greaterThan } from "@ende/chronver";
 * import { assert, assertFalse } from "@ende/assert";
 *
 * assert(greaterThan(parse("2024.04.04"), parse("2024.04.03")));
 * assertFalse(greaterThan(parse("2024.04.03"), parse("2024.04.04")));
 * ```
 *
 * @param version1 The first ChronVer to compare
 * @param version2 The second ChronVer to compare
 * @returns `true` if `version1` is greater than `version2`, `false` otherwise
 */
export function greaterThan(version1: ChronVer, version2: ChronVer): boolean {
  return compare(version1, version2) > 0;
}
