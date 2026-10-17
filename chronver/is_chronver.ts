// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { validate } from "./_shared.ts";

/**
 * Checks to see if value is a valid ChronVer object: one that
 * {@linkcode format} accepts and that {@linkcode parse} reads back unchanged.
 * The year must be from 1 to 9999, the date a real calendar date and the
 * changeset a non-negative safe integer. The feature, if present, may only
 * contain letters, digits and hyphens (not only hyphens), can't be `break`,
 * and can't be combined with `isBreaking`.
 *
 * Objects which are valid ChronVer objects but have _extra_ fields are still
 * considered ChronVer objects and this will return true.
 *
 * A type assertion is added to the value.
 *
 * @example Usage
 * ```ts
 * import { isChronVer } from "@ende/chronver/is-chronver";
 * import { assert, assertFalse } from "@ende/assert";
 *
 * assert(isChronVer({ year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false }));
 * assertFalse(isChronVer({ year: 2024, month: 4, day: 31, changeset: 0, isBreaking: false }));
 * ```
 *
 * @param value The value to check to see if it's a valid ChronVer object
 * @returns `true` if value is a valid ChronVer, `false` otherwise
 */
export function isChronVer(value: unknown): value is ChronVer {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return false;

  const { changeset, day, feature, isBreaking, month, year } = value as Record<string, unknown>;

  if (typeof year !== "number" || typeof month !== "number" || typeof day !== "number" || typeof changeset !== "number")
    return false;

  if ((feature !== undefined && typeof feature !== "string") || typeof isBreaking !== "boolean")
    return false;

  return validate(value as ChronVer) === undefined;
}
