// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { daysInMonth, FULL_REGEXP, MIN_YEAR, pad } from "./_shared.ts";

/**
 * Parses a string as a ChronVer, returning a ChronVer object.
 *
 * The format is `YYYY.MM.DD[.CHANGESET][-FEATURE|-break]`. The date must be
 * a real calendar date, so `2024.02.29` is valid but `2023.02.29` is not.
 * The changeset is optional, but when present it's a positive integer with no
 * leading zeros. A version is either a feature or `-break`, not both: in
 * `2024.04.03-ui-break` the feature is `ui-break`.
 *
 * Every string this accepts formats back to itself with {@linkcode format}.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@ende/chronver/parse";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(parse("2024.04.03.1"), {
 *   year: 2024,
 *   month: 4,
 *   day: 3,
 *   changeset: 1,
 *   isBreaking: false
 * });
 *
 * assertEquals(parse("2024.04.03-new-ui").feature, "new-ui");
 * assertEquals(parse("2024.04.03.1-break").isBreaking, true);
 * ```
 *
 * @throws {TypeError} If the input string is invalid.
 * @param value The version string to parse
 * @returns A valid ChronVer
 */
export function parse(value: string): ChronVer {
  if (typeof value !== "string") {
    throw new TypeError(
      `Cannot parse version as version must be a string: received ${typeof value}`
    );
  }

  const groups = value.match(FULL_REGEXP)?.groups;
  if (!groups)
    throw new TypeError(`Cannot parse version: ${value}`);

  const year = parseInt(groups.year!, 10);
  const month = parseInt(groups.month!, 10);
  const day = parseInt(groups.day!, 10);

  if (year < MIN_YEAR)
    throw new TypeError(`Cannot parse version ${value}: year must be positive`);

  const maxDays = daysInMonth(year, month);
  if (day > maxDays) {
    throw new TypeError(
      `Cannot parse version ${value}: day must be between 1 and ${maxDays} for ${year}-${pad(month)}`
    );
  }

  const changeset = groups.changeset ? parseInt(groups.changeset, 10) : 0;
  if (!Number.isSafeInteger(changeset)) {
    throw new TypeError(
      `Cannot parse version ${value}: changeset must be at most ${Number.MAX_SAFE_INTEGER}`
    );
  }

  const { label } = groups;
  const isBreaking = label === "break";

  if (label === undefined || isBreaking)
    return { year, month, day, changeset, isBreaking };

  return { year, month, day, changeset, feature: label, isBreaking };
}
