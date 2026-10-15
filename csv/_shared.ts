// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Gives the length of a string in Unicode code points
 *
 * ```
 * codePointLength("🐱"); // 1
 * "🐱".length; // 2
 * ```
 */
export function codePointLength(s: string) {
  return Array.from(s).length;
}
