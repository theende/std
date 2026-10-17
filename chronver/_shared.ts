// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";

/**
 * Matches a ChronVer string. The month and day ranges are coarse here; the
 * real calendar check happens in {@linkcode daysInMonth}. The changeset has no
 * leading zeros and is never `0`, and a feature has at least one letter or
 * digit, so every match formats back to the same string.
 */
export const FULL_REGEXP =
  /^(?<year>\d{4})\.(?<month>0[1-9]|1[0-2])\.(?<day>0[1-9]|[12]\d|3[01])(?:\.(?<changeset>[1-9]\d*))?(?:-(?<label>break|-*[a-zA-Z0-9][a-zA-Z0-9-]*))?$/;

/** Matches a feature name: letters, digits and hyphens, not only hyphens. */
export const FEATURE_REGEXP = /^-*[a-zA-Z0-9][a-zA-Z0-9-]*$/;

/** The smallest year a ChronVer can have. */
export const MIN_YEAR = 1;

/** The largest year a ChronVer can have, since the year has 4 digits. */
export const MAX_YEAR = 9999;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Returns the number of days in a month (1 to 12) of the given year. */
export function daysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year))
    return 29;

  return DAYS_IN_MONTH[month - 1]!;
}

/** Pads a month or day to two digits. */
export function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** Formats a date as `YYYY.MM.DD`. */
export function formatDate(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, "0")}.${pad(month)}.${pad(day)}`;
}

/**
 * Returns why a version is invalid, or `undefined` if it's valid. A valid
 * version is one that formats to a string {@linkcode FULL_REGEXP} matches and
 * that parses back to the same version.
 */
export function validate(version: ChronVer): string | undefined {
  const { year, month, day, changeset, feature, isBreaking } = version;

  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR)
    return `year must be between ${MIN_YEAR} and ${MAX_YEAR}, received ${year}`;

  if (!Number.isInteger(month) || month < 1 || month > 12)
    return `month must be between 1 and 12, received ${month}`;

  const maxDays = daysInMonth(year, month);

  if (!Number.isInteger(day) || day < 1 || day > maxDays)
    return `day must be between 1 and ${maxDays} for ${year}-${pad(month)}, received ${day}`;

  if (!Number.isSafeInteger(changeset) || changeset < 0)
    return `changeset must be a non-negative integer of at most ${Number.MAX_SAFE_INTEGER}, received ${changeset}`;

  if (feature !== undefined) {
    if (!FEATURE_REGEXP.test(feature) || feature === "break")
      return `feature must be letters, digits and hyphens (not only hyphens) and not "break", received "${feature}"`;

    if (isBreaking)
      return "a version cannot have both a feature and -break";
  }

  return undefined;
}
