// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { MAX_YEAR, MIN_YEAR } from "./_shared.ts";

/**
 * Creates a ChronVer from a date, using the date's local time.
 *
 * A changeset of `0` is omitted when formatted.
 *
 * @example Usage
 * ```ts
 * import { fromDate } from "@ende/chronver/from-date";
 * import { format } from "@ende/chronver/format";
 * import { assertEquals } from "@ende/assert";
 *
 * const date = new Date(2024, 3, 3); // April 3, 2024
 *
 * assertEquals(format(fromDate(date)), "2024.04.03");
 * assertEquals(format(fromDate(date, 5)), "2024.04.03.5");
 * ```
 *
 * @throws {TypeError} If the date is invalid, its year is outside 1 to 9999, or the changeset isn't a non-negative integer.
 * @param date The date of the version
 * @param changeset The changeset of the version
 * @returns The ChronVer for that date
 */
export function fromDate(date: Date, changeset = 0): ChronVer {
  if (Number.isNaN(date.getTime()))
    throw new TypeError("Cannot create version from date: date is invalid");

  const year = date.getFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) {
    throw new TypeError(
      `Cannot create version from date: year must be between ${MIN_YEAR} and ${MAX_YEAR}, received ${year}`
    );
  }

  if (!Number.isSafeInteger(changeset) || changeset < 0) {
    throw new TypeError(
      `Cannot create version from date: changeset must be a non-negative integer, received ${changeset}`
    );
  }

  return { year, month: date.getMonth() + 1, day: date.getDate(), changeset, isBreaking: false };
}
