// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { formatDate } from "./_shared.ts";
import { fromDate } from "./from_date.ts";

function dayNumber(year: number, month: number, day: number): number {
  return year * 10000 + month * 100 + day;
}

/**
 * Returns the next version on the given date, in local time.
 *
 * If the version is from the same day, its changeset goes up by one.
 * If it's from an earlier day, the result is that date's version with
 * changeset `0`. Either way the result has no feature and isn't breaking, so
 * `2024.04.03.1-break` becomes `2024.04.03.2` on the same day.
 *
 * @example Usage
 * ```ts
 * import { format, increment, parse } from "@ende/chronver";
 * import { assertEquals } from "@ende/assert";
 *
 * const version = parse("2024.04.03.1");
 *
 * assertEquals(format(increment(version, new Date(2024, 3, 3))), "2024.04.03.2");
 * assertEquals(format(increment(version, new Date(2024, 3, 4))), "2024.04.04");
 * ```
 *
 * @throws {TypeError} If the version's date is later than `date`, or `date` is invalid or outside the years 1 to 9999.
 * @param version The version to increment
 * @param date The date of the new version
 * @returns The next ChronVer
 */
export function increment(version: ChronVer, date: Date = new Date()): ChronVer {
  const next = fromDate(date);
  const versionDay = dayNumber(version.year, version.month, version.day);
  const nextDay = dayNumber(next.year, next.month, next.day);

  if (versionDay > nextDay) {
    throw new TypeError(
      `Cannot increment version ${formatDate(version.year, version.month, version.day)}: its date is later than ${formatDate(next.year, next.month, next.day)}`
    );
  }

  return versionDay === nextDay ? fromDate(date, version.changeset + 1) : next;
}
