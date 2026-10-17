// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import { plainText } from "./_text.ts";
import type { Nodes, Root, TocEntry, TocOptions } from "./types.ts";

/**
 * Lists the headings of a document for a table of contents: each heading's
 * level, plain text and id, in document order. The list is flat; use
 * `depth` to indent or nest it. Headings inside block quotes, lists and
 * admonitions count too.
 *
 * The `slug` is the heading's `id`, so it matches the `id` attribute
 * `render()` writes on the heading (unless the tree has duplicate ids, which
 * `parse()` never makes).
 *
 * @example Usage
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { toc } from "@ende/markdown/toc";
 * import { assertEquals } from "@ende/assert";
 *
 * const ast = parse("# Guide\n\n## Install\n\n### From *source*\n\n## Install");
 * assertEquals(toc(ast, { maxDepth: 2 }), [
 *   { depth: 1, text: "Guide", slug: "guide" },
 *   { depth: 2, text: "Install", slug: "install" },
 *   { depth: 2, text: "Install", slug: "install-1" }
 * ]);
 * assertEquals(toc(ast, { minDepth: 3 }), [{ depth: 3, text: "From source", slug: "from-source" }]);
 * ```
 *
 * @param ast The root of the syntax tree, from `parse()`.
 * @param options Which heading levels to include.
 * @returns The headings, in document order.
 */
export function toc(ast: Root, options: TocOptions = {}): TocEntry[] {
  const { minDepth = 1, maxDepth = 6 } = options;
  const entries: TocEntry[] = [];
  const walk = (node: Nodes) => {
    if (node.type === "heading") {
      if (node.depth >= minDepth && node.depth <= maxDepth) {
        entries.push({ depth: node.depth, text: plainText(node.children), slug: node.id });
      }
    } else if ("children" in node) {
      node.children.forEach(walk);
    }
  };
  walk(ast);
  return entries;
}
