// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

// The characters github-slugger strips: other numbers, punctuation except
// connector punctuation (such as `_`), symbols, controls, private use,
// format and unassigned characters, and separators, but never an alphabetic
// character, a space or a hyphen.
const reStrip = /[[\p{No}\p{P}\p{S}\p{Cc}\p{Co}\p{Cf}\p{Cn}\p{Z}]--[\p{Pc}\p{Alphabetic} \-]]/gv;

/**
 * Turns text into a heading id the way GitHub does (with the algorithm of
 * {@link https://github.com/Flet/github-slugger | github-slugger}): it
 * lowercases the text, removes everything except letters, marks, numbers,
 * connector punctuation such as `_`, hyphens and spaces, and turns each space
 * into a hyphen. Runs of spaces and hyphens aren't collapsed, and the result
 * isn't trimmed, so ids match GitHub's anchors.
 *
 * This is the default `slugger` of `parse()`, which also makes the ids
 * unique; `slug()` alone doesn't. Character categories come from the
 * runtime's Unicode version, which can be newer than github-slugger's
 * (Unicode 13).
 *
 * @example Usage
 * ```ts
 * import { slug } from "@ende/markdown/slug";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(slug("Hello, World!"), "hello-world");
 * assertEquals(slug("What's new in 2.0?"), "whats-new-in-20");
 * assertEquals(slug("snake_case & kebab-case"), "snake_case--kebab-case");
 * assertEquals(slug("Déjà vu"), "déjà-vu");
 * ```
 *
 * @param text The text to slug, such as a heading's plain text.
 * @returns The slug, which can be empty.
 */
export function slug(text: string): string {
  return text.toLowerCase().replace(reStrip, "").replaceAll(" ", "-");
}
