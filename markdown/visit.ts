// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import type { Nodes, Parent } from "./types.ts";

/**
 * Calls `fn` for every node of the given type in a tree, in pre-order (a
 * parent before its children, children in document order), with the node's
 * index in its parent's `children` and the parent. For the node `visit()`
 * starts from, the index and parent are `null`.
 *
 * `fn` may change the tree in two ways:
 *
 * - Change the node itself, including replacing or editing its `children`:
 *   `visit()` reads `node.children` after `fn` returns, so it visits the new
 *   children.
 * - Replace the node, by assigning another node to `parent.children[index]`.
 *   The replacement isn't visited, nor are its children, so it can safely
 *   contain the original node (for example a link around inline code);
 *   `visit()` goes on with the next sibling.
 *
 * Inserting or removing siblings (anything that changes the length of
 * `parent.children`) isn't supported: nodes can then be skipped or visited
 * twice.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { visit } from "@ende/markdown/visit";
 * import { assertEquals } from "@ende/assert";
 *
 * const urls: string[] = [];
 * visit(parse("[Ende](https://ende.sh) and [docs](/docs)"), "link", node => {
 *   urls.push(node.url);
 * });
 * assertEquals(urls, ["https://ende.sh", "/docs"]);
 * ```
 *
 * @example Linking inline code that names an API
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { render } from "@ende/markdown/render";
 * import type { PhrasingContent } from "@ende/markdown/types";
 * import { visit } from "@ende/markdown/visit";
 * import { assertEquals } from "@ende/assert";
 *
 * const api: Record<string, string> = { "parse()": "/api/parse" };
 * const ast = parse("Call `parse()` first.");
 * visit(ast, "inlineCode", (node, index, parent) => {
 *   const url = api[node.value];
 *   if (url !== undefined && parent !== null && index !== null && parent.type !== "link") {
 *     (parent.children as PhrasingContent[])[index] = { type: "link", url, title: null, children: [node] };
 *   }
 * });
 * assertEquals(render(ast), "<p>Call <a href=\"/api/parse\"><code>parse()</code></a> first.</p>\n");
 * ```
 *
 * @typeParam T The type of node to visit.
 * @param tree The node to start from, usually the root.
 * @param type The `type` of the nodes to call `fn` for.
 * @param fn Called with each matching node, its index in its parent's
 * `children`, and its parent.
 */
export function visit<T extends Nodes["type"]>(
  tree: Nodes,
  type: T,
  fn: (node: Extract<Nodes, { type: T; }>, index: number | null, parent: Parent | null) => void
): void {
  const walk = (node: Nodes, index: number | null, parent: Parent | null) => {
    if (node.type === type) {
      fn(node as Extract<Nodes, { type: T; }>, index, parent);
      if (parent !== null && parent.children[index!] !== node) {
        return;
      }
    }
    if ("children" in node) {
      const children: readonly Nodes[] = node.children;
      for (let i = 0; i < children.length; i++) {
        walk(children[i]!, i, node);
      }
    }
  };
  walk(tree, null, null);
}
