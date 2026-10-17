// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { parse } from "./parse.ts";

/**
 * Returns the parsed ChronVer, or `undefined` if it's not valid.
 *
 * @example Usage
 * ```ts
 * import { tryParse } from "@ende/chronver/try-parse";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(tryParse("2024.04.03.1"), { year: 2024, month: 4, day: 3, changeset: 1, isBreaking: false });
 * assertEquals(tryParse("2023.02.29"), undefined);
 * assertEquals(tryParse("invalid"), undefined);
 * ```
 *
 * @param value The version string to parse
 * @returns A valid ChronVer or `undefined`
 */
export function tryParse(value: string): ChronVer | undefined {
  try {
    return parse(value);
  } catch {
    return undefined;
  }
}
