// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

/**
 * A ChronVer object parsed into its constituent parts.
 *
 * A ChronVer string has the format `YYYY.MM.DD[.CHANGESET][-FEATURE|-break]`.
 *
 * @example Usage
 * ```ts
 * import type { ChronVer } from "@ende/chronver/types";
 * import { format } from "@ende/chronver/format";
 * import { assertEquals } from "@ende/assert";
 *
 * const version: ChronVer = {
 *   year: 2024,
 *   month: 4,
 *   day: 3,
 *   changeset: 1,
 *   isBreaking: false
 * };
 *
 * assertEquals(format(version), "2024.04.03.1");
 * ```
 */
export interface ChronVer {
  /** The year */
  year: number;
  /** The month, from 1 to 12 */
  month: number;
  /** The day of the month, from 1 to 31 */
  day: number;
  /** The changeset number, `0` if not specified */
  changeset: number;
  /** The feature name, if specified */
  feature?: string;
  /** Whether this is a breaking change (`-break`) */
  isBreaking: boolean;
}
