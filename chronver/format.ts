// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
import type { ChronVer } from "./types.ts";
import { formatDate, validate } from "./_shared.ts";

/**
 * Formats a ChronVer object into a string.
 *
 * The year is padded to 4 digits and a changeset of `0` is omitted, so
 * `format(parse(s)) === s` for every string {@linkcode parse} accepts. The
 * version is validated first, so whatever this returns parses back to the
 * same version.
 *
 * @example Usage
 * ```ts
 * import { format } from "@ende/chronver/format";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(format({ year: 2024, month: 4, day: 3, changeset: 0, isBreaking: false }), "2024.04.03");
 * assertEquals(format({ year: 2024, month: 4, day: 3, changeset: 1, feature: "new-ui", isBreaking: false }), "2024.04.03.1-new-ui");
 * assertEquals(format({ year: 2024, month: 4, day: 3, changeset: 1, isBreaking: true }), "2024.04.03.1-break");
 * ```
 *
 * @throws {TypeError} If the version is invalid: see {@linkcode isChronVer} for the rules.
 * @param version The ChronVer to format
 * @returns The string representation of the ChronVer
 */
export function format(version: ChronVer): string {
  const reason = validate(version);

  if (reason !== undefined)
    throw new TypeError(`Cannot format version: ${reason}`);

  let result = formatDate(version.year, version.month, version.day);

  if (version.changeset > 0)
    result += `.${version.changeset}`;

  if (version.feature)
    result += `-${version.feature}`;

  if (version.isBreaking)
    result += "-break";

  return result;
}
