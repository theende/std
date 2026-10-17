// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { parse } from "./parse.ts";
import { render } from "./render.ts";
import type { Link, Nodes, Parent, Root } from "./types.ts";
import { visit } from "./visit.ts";

Ende.test("visit() calls fn for each node of the type, in pre-order", () => {
  const ast = parse("*a **b** c* **d**");
  const seen: string[] = [];
  visit(ast, "strong", node => {
    seen.push(render({ type: "root", children: [{ type: "paragraph", children: node.children }] }).trim());
  });
  assertEquals(seen, ["<p>b</p>", "<p>d</p>"]);
});

Ende.test("visit() visits a parent before its children", () => {
  const ast = parse("> - a\n>   > b");
  const seen: string[] = [];
  visit(ast, "blockquote", (node, index, parent) => {
    seen.push(`${parent?.type}[${index}] has ${node.children.map(child => child.type).join(",")}`);
  });
  assertEquals(seen, ["root[0] has list", "listItem[1] has paragraph"]);
});

Ende.test("visit() passes the index and parent, and null for the root", () => {
  const ast = parse("a\n\nb");
  const calls: [string, number | null, string | null][] = [];
  visit(ast, "root", (node, index, parent) => {
    calls.push([node.type, index, parent?.type ?? null]);
  });
  visit(ast, "paragraph", (node, index, parent) => {
    calls.push([node.type, index, parent?.type ?? null]);
  });
  assertEquals(calls, [["root", null, null], ["paragraph", 0, "root"], ["paragraph", 1, "root"]]);
});

Ende.test("visit() narrows the node type", () => {
  const values: string[] = [];
  visit(parse("`x` and `y`"), "inlineCode", node => {
    // `value` exists on inlineCode nodes, so this type checks.
    values.push(node.value);
  });
  assertEquals(values, ["x", "y"]);
});

Ende.test("visit() visits children fn sets on the node", () => {
  const ast = parse("*a*");
  const texts: string[] = [];
  visit(ast, "emphasis", node => {
    node.children = [{ type: "text", value: "b" }];
  });
  visit(ast, "text", node => {
    texts.push(node.value);
  });
  assertEquals(texts, ["b"]);
});

Ende.test("visit() skips a replacement node and its children, and goes on with the next sibling", () => {
  const ast: Root = parse("`a` `b`");
  const seen: string[] = [];
  visit(ast, "inlineCode", (node, index, parent) => {
    seen.push(node.value);
    if (node.value === "a" && parent && index !== null) {
      // The replacement holds the node itself: visiting it would loop forever.
      const link: Link = { type: "link", url: "/a", title: null, children: [node] };
      (parent as Extract<Parent, { type: "paragraph"; }>).children[index] = link;
    }
  });
  assertEquals(seen, ["a", "b"]);
  assertEquals(render(ast), "<p><a href=\"/a\"><code>a</code></a> <code>b</code></p>\n");
});

Ende.test("visit() can turn inline code that names an API into links to its reference page", () => {
  const api = new Map([["parse()", "/api/parse"], ["render()", "/api/render"]]);
  const ast = parse("# Using `render()`\n\nCall `parse()`, then `render()`. `x` is not an API.\n\n[`parse()`](/elsewhere) is linked already.");

  visit(ast, "inlineCode", (node, index, parent) => {
    const url = api.get(node.value);
    // Leave code that's already a link, and headings, alone.
    if (url === undefined || parent === null || index === null || parent.type === "link" || parent.type === "heading") {
      return;
    }
    (parent.children as Nodes[])[index] = { type: "link", url, title: null, children: [node] };
  });

  assertEquals(
    render(ast, { headingIds: false }),
    `<h1>Using <code>render()</code></h1>
<p>Call <a href="/api/parse"><code>parse()</code></a>, then <a href="/api/render"><code>render()</code></a>. <code>x</code> is not an API.</p>
<p><a href="/elsewhere"><code>parse()</code></a> is linked already.</p>
`
  );
});

Ende.test("visit() does nothing when no node has the type", () => {
  let calls = 0;
  visit(parse("text"), "table", () => {
    calls++;
  });
  assertEquals(calls, 0);
});

Ende.test("visit() can start from any node", () => {
  const ast = parse("*a* b *c*");
  const paragraph = ast.children[0]!;
  let count = 0;
  visit(paragraph, "emphasis", () => {
    count++;
  });
  assertEquals(count, 2);
});
