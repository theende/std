// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import { extractFrontMatter } from "./_shared.ts";
import { parse, type ParseOptions } from "@ende/yaml/parse";
import type { Extract } from "./types.ts";
import { EXTRACT_YAML_REGEXP } from "./_formats.ts";

export type { Extract };

/**
 * Extracts and parses {@link https://yaml.org | YAML} from the metadata of
 * front matter content.
 *
 * @experimental **UNSTABLE**: New API, yet to be vetted.
 *
 * @example Extract YAML front matter
 * ```ts
 * import { extract } from "@ende/front-matter/unstable-yaml";
 * import { assertEquals } from "@ende/assert";
 *
 * const output = `---yaml
 * date: 2022-01-01
 * ---
 * Hello, world!`;
 * const result = extract(output, { schema: "json" });
 *
 * assertEquals(result, {
 *   frontMatter: "date: 2022-01-01",
 *   body: "Hello, world!",
 *   attrs: { date: "2022-01-01" },
 * });
 * ```
 *
 * @typeParam T The type of the parsed front matter.
 * @param text The text to extract YAML front matter from.
 * @param options The options to pass to `@ende/yaml/parse`.
 * @returns The extracted YAML front matter and body content.
 */
export function extract<T>(text: string, options?: ParseOptions): Extract<T> {
  const { frontMatter, body } = extractFrontMatter(text, EXTRACT_YAML_REGEXP);
  const attrs = parse(frontMatter, options) as T;
  return { frontMatter, body, attrs };
}
