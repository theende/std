// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import { parse } from "./parse.ts";

/**
 * Returns true if the string can be parsed as ChronVer.
 *
 * @example Usage
 * ```ts
 * import { canParse } from "@ende/chronver/can-parse";
 * import { assert, assertFalse } from "@ende/assert";
 *
 * assert(canParse("2024.02.29")); // 2024 is a leap year
 * assertFalse(canParse("2023.02.29")); // 2023 is not
 * assertFalse(canParse("2024.04.31")); // April has 30 days
 * assertFalse(canParse("invalid"));
 * ```
 *
 * @param value The version string to check
 * @returns `true` if the string can be parsed as ChronVer, `false` otherwise
 */
export function canParse(value: string): boolean {
  try {
    parse(value);
    return true;
  } catch {
    return false;
  }
}
