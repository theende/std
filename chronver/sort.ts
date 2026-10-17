// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import { compare } from "./compare.ts";
import { parse } from "./parse.ts";

/**
 * Sorts ChronVer strings, returning a new array.
 *
 * Versions that compare equal keep their input order.
 *
 * @example Usage
 * ```ts
 * import { sort } from "@ende/chronver/sort";
 * import { assertEquals } from "@ende/assert";
 *
 * const versions = ["2024.04.05", "2024.04.03", "2024.04.04"];
 *
 * assertEquals(sort(versions), ["2024.04.03", "2024.04.04", "2024.04.05"]);
 * assertEquals(sort(versions, true), ["2024.04.05", "2024.04.04", "2024.04.03"]);
 * ```
 *
 * @throws {TypeError} If any string is not a valid ChronVer.
 * @param versions The version strings to sort
 * @param descending Whether to sort newest first
 * @returns The sorted version strings
 */
export function sort(versions: readonly string[], descending = false): string[] {
  const parsed = versions.map(value => ({ value, version: parse(value) }));
  parsed.sort((a, b) => descending ? compare(b.version, a.version) : compare(a.version, b.version));
  return parsed.map(({ value }) => value);
}
