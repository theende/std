// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { compare } from "./compare.ts";

/**
 * Returns `true` if both ChronVers are equivalent.
 *
 * This is equal to `compare(version1, version2) === 0`.
 *
 * The feature is ignored, like build metadata in SemVer: `2024.04.03-a` equals
 * `2024.04.03-b` and `2024.04.03`.
 *
 * @example Usage
 * ```ts
 * import { parse, equals } from "@ende/chronver";
 * import { assert, assertFalse } from "@ende/assert";
 *
 * assert(equals(parse("2024.04.03.1"), parse("2024.04.03.1")));
 * assertFalse(equals(parse("2024.04.03.1"), parse("2024.04.03.2")));
 * assert(equals(parse("2024.04.03-a"), parse("2024.04.03-b")));
 * ```
 *
 * @param version1 The first ChronVer to compare
 * @param version2 The second ChronVer to compare
 * @returns `true` if `version1` is equal to `version2`, `false` otherwise
 */
export function equals(version1: ChronVer, version2: ChronVer): boolean {
  return compare(version1, version2) === 0;
}
