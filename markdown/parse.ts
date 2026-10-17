// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import { BlockParser } from "./_block_parser.ts";
import { IdSet } from "./_ids.ts";
import { plainText } from "./_text.ts";
import { toMdast } from "./_to_mdast.ts";
import { slug } from "./slug.ts";
import type { Nodes, ParseOptions, Root } from "./types.ts";

/**
 * Parses CommonMark into an mdast-shaped syntax tree. With the `gfm` option,
 * it also parses the GitHub Flavored Markdown extensions: tables, task list
 * items, strikethrough, extended autolinks, and footnotes, and GitHub's
 * alerts (`> [!NOTE]`), which become `admonition` nodes.
 *
 * Every heading gets an `id` made from its plain text, by default as GitHub
 * makes it (see {@linkcode slug}), and unique within the document: a second
 * `Install` heading gets `install-1`.
 *
 * Link reference definitions are resolved while parsing: reference links and
 * images become ordinary `link` and `image` nodes carrying
 * the definition's URL and title, and the definitions themselves don't appear
 * in the tree. Footnote definitions do stay in the tree.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(parse("# Hello *world*"), {
 *   type: "root",
 *   children: [{
 *     type: "heading",
 *     depth: 1,
 *     id: "hello-world",
 *     children: [
 *       { type: "text", value: "Hello " },
 *       { type: "emphasis", children: [{ type: "text", value: "world" }] }
 *     ]
 *   }]
 * });
 * ```
 *
 * @example Reference links are resolved
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { assertEquals } from "@ende/assert";
 *
 * const root = parse("[Ende][home]\n\n[home]: https://ende.sh \"Home\"");
 * assertEquals(root.children, [{
 *   type: "paragraph",
 *   children: [{
 *     type: "link",
 *     url: "https://ende.sh",
 *     title: "Home",
 *     children: [{ type: "text", value: "Ende" }]
 *   }]
 * }]);
 * ```
 *
 * @example GitHub Flavored Markdown
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { assertEquals } from "@ende/assert";
 *
 * const root = parse("- [x] ~~Write~~ docs at www.ende.sh", { gfm: true });
 * assertEquals(root.children, [{
 *   type: "list",
 *   ordered: false,
 *   start: null,
 *   spread: false,
 *   children: [{
 *     type: "listItem",
 *     spread: false,
 *     checked: true,
 *     children: [{
 *       type: "paragraph",
 *       children: [
 *         { type: "delete", children: [{ type: "text", value: "Write" }] },
 *         { type: "text", value: " docs at " },
 *         { type: "link", url: "http://www.ende.sh", title: null, children: [{ type: "text", value: "www.ende.sh" }] }
 *       ]
 *     }]
 *   }]
 * }]);
 * ```
 *
 * @example Heading ids
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import type { Heading } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const ids = (root: ReturnType<typeof parse>) => root.children.map(node => (node as Heading).id);
 *
 * assertEquals(ids(parse("# Install\n## Install `ende`\n## Install")), ["install", "install-ende", "install-1"]);
 * // A custom slugger replaces the algorithm; ids are still made unique.
 * assertEquals(ids(parse("# A B\n# A B", { slugger: text => text.replaceAll(" ", "_") })), ["A_B", "A_B-1"]);
 * ```
 *
 * @example GitHub alerts
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(parse("> [!WARNING]\n> Back up first.", { gfm: true }).children, [{
 *   type: "admonition",
 *   kind: "warning",
 *   children: [{ type: "paragraph", children: [{ type: "text", value: "Back up first." }] }]
 * }]);
 * ```
 *
 * @param markdown The Markdown source.
 * @param options Options for parsing.
 * @returns The root of the syntax tree.
 */
export function parse(markdown: string, options: ParseOptions = {}): Root {
  const root = toMdast(new BlockParser(options).parse(markdown), options.gfm === true);
  addHeadingIds(root, options.slugger ?? slug);
  return root;
}

// Gives every heading a unique id, in document order.
function addHeadingIds(root: Root, slugger: (text: string) => string) {
  const ids = new IdSet();
  const walk = (node: Nodes) => {
    if (node.type === "heading") {
      node.id = ids.unique(slugger(plainText(node.children)));
    } else if ("children" in node) {
      node.children.forEach(walk);
    }
  };
  walk(root);
}
