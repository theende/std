// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { parse } from "./parse.ts";
import { toc } from "./toc.ts";

const doc = `# Title

## Install

### From source

#### Details

## Install

> ## Quoted
`;

Ende.test("toc() lists every heading in document order by default", () => {
  assertEquals(toc(parse(doc)), [
    { depth: 1, text: "Title", slug: "title" },
    { depth: 2, text: "Install", slug: "install" },
    { depth: 3, text: "From source", slug: "from-source" },
    { depth: 4, text: "Details", slug: "details" },
    { depth: 2, text: "Install", slug: "install-1" },
    { depth: 2, text: "Quoted", slug: "quoted" }
  ]);
});

Ende.test("toc() leaves out headings deeper than maxDepth", () => {
  assertEquals(toc(parse(doc), { maxDepth: 2 }).map(entry => entry.slug), ["title", "install", "install-1", "quoted"]);
});

Ende.test("toc() leaves out headings shallower than minDepth", () => {
  assertEquals(toc(parse(doc), { minDepth: 3 }).map(entry => entry.slug), ["from-source", "details"]);
});

Ende.test("toc() combines minDepth and maxDepth", () => {
  assertEquals(toc(parse(doc), { minDepth: 2, maxDepth: 3 }).map(entry => entry.slug), ["install", "from-source", "install-1", "quoted"]);
});

Ende.test("toc() returns an empty list for a document without headings", () => {
  assertEquals(toc(parse("Just text.")), []);
});

Ende.test("toc() uses the plain text of a heading", () => {
  const ast = parse("# Use `parse()` with *care* ![logo](logo.png)[^1]\n\n[^1]: A note.", { gfm: true });
  assertEquals(toc(ast), [{ depth: 1, text: "Use parse() with care logo", slug: "use-parse-with-care-logo" }]);
});

Ende.test("toc() includes headings inside admonitions", () => {
  const ast = parse("> [!NOTE]\n> ## Inside", { gfm: true });
  assertEquals(toc(ast), [{ depth: 2, text: "Inside", slug: "inside" }]);
});

Ende.test("toc() uses the ids a custom slugger made", () => {
  const ast = parse("# A\n# A", { slugger: text => `s-${text}` });
  assertEquals(toc(ast).map(entry => entry.slug), ["s-A", "s-A-1"]);
});
