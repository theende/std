// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { parse } from "./parse.ts";
import type { Link, List, Nodes, ParseOptions, TableCell } from "./types.ts";

function firstList(markdown: string): List {
  const node = parse(markdown).children[0];
  if (node?.type !== "list") {
    throw new Error(`Expected a list, got ${node?.type}`);
  }
  return node;
}

Ende.test("parse() returns an empty root for empty input", () => {
  assertEquals(parse(""), { type: "root", children: [] });
});

Ende.test("parse() makes a tight bullet list", () => {
  assertEquals(firstList("- a\n- b\n"), {
    type: "list",
    ordered: false,
    start: null,
    spread: false,
    children: [
      { type: "listItem", spread: false, checked: null, children: [{ type: "paragraph", children: [{ type: "text", value: "a" }] }] },
      { type: "listItem", spread: false, checked: null, children: [{ type: "paragraph", children: [{ type: "text", value: "b" }] }] }
    ]
  });
});

Ende.test("parse() keeps the start number of an ordered list", () => {
  const list = firstList("3. a\n4. b\n");
  assertEquals(list.ordered, true);
  assertEquals(list.start, 3);
});

Ende.test("parse() sets start 1 for an ordered list starting at 1", () => {
  assertEquals(firstList("1) a\n").start, 1);
});

Ende.test("parse() lets a list starting at 01 interrupt a paragraph", () => {
  const root = parse("text\n01. item\n");
  assertEquals(root.children.map(node => node.type), ["paragraph", "list"]);
});

Ende.test("parse() marks a list spread when blank lines separate items", () => {
  const list = firstList("- a\n\n- b\n");
  assertEquals(list.spread, true);
  assertEquals(list.children.map(item => item.spread), [false, false]);
});

Ende.test("parse() marks an item and its list spread when blank lines separate the item's children", () => {
  const list = firstList("- a\n\n  b\n- c\n");
  assertEquals(list.spread, true);
  assertEquals(list.children.map(item => item.spread), [true, false]);
});

Ende.test("parse() keeps a list tight when the blank line is inside a nested list", () => {
  const list = firstList("- a\n  - b\n\n    c\n- d\n");
  assertEquals(list.spread, false);
  const nested = list.children[0]!.children[1] as List;
  assertEquals(nested.spread, true);
});

Ende.test("parse() splits a fenced code info string into lang and meta", () => {
  assertEquals(parse("```ts title=\"main.ts\" twoslash\nconst x = 1;\n```\n").children, [
    { type: "code", lang: "ts", meta: "title=\"main.ts\" twoslash", value: "const x = 1;" }
  ]);
});

Ende.test("parse() decodes escapes and entities in the info string", () => {
  assertEquals(parse("``` f&ouml;\\*o\nx\n```\n").children, [
    { type: "code", lang: "fö*o", meta: null, value: "x" }
  ]);
});

Ende.test("parse() sets lang and meta to null without an info string", () => {
  assertEquals(parse("```\nx\n```\n").children, [{ type: "code", lang: null, meta: null, value: "x" }]);
  assertEquals(parse("    x\n    y\n").children, [{ type: "code", lang: null, meta: null, value: "x\ny" }]);
});

Ende.test("parse() keeps inner blank lines of a code block", () => {
  assertEquals(parse("~~~\na\n\nb\n\n~~~\n").children, [{ type: "code", lang: null, meta: null, value: "a\n\nb\n" }]);
});

Ende.test("parse() resolves full, collapsed and shortcut reference links", () => {
  const root = parse("[one][ref] [Ref][] [ref]\n\n[REF]: /url \"Title\"\n");
  const link = { type: "link", url: "/url", title: "Title" } as const;
  assertEquals(root.children, [{
    type: "paragraph",
    children: [
      { ...link, children: [{ type: "text", value: "one" }] },
      { type: "text", value: " " },
      { ...link, children: [{ type: "text", value: "Ref" }] },
      { type: "text", value: " " },
      { ...link, children: [{ type: "text", value: "ref" }] }
    ]
  }]);
});

Ende.test("parse() resolves reference images with plain-text alt", () => {
  assertEquals(parse("![a *b* `c`][img]\n\n[img]: </my image.png>\n").children, [{
    type: "paragraph",
    children: [{ type: "image", url: "/my%20image.png", title: null, alt: "a b c" }]
  }]);
});

Ende.test("parse() uses the first of duplicate definitions", () => {
  assertEquals(parse("[x]\n\n[x]: /first\n[x]: /second\n").children, [{
    type: "paragraph",
    children: [{ type: "link", url: "/first", title: null, children: [{ type: "text", value: "x" }] }]
  }]);
});

Ende.test("parse() leaves an undefined reference as text", () => {
  assertEquals(parse("[nope][]\n").children, [{ type: "paragraph", children: [{ type: "text", value: "[nope][]" }] }]);
});

Ende.test("parse() resolves a definition that appears after its use, inside a block quote", () => {
  assertEquals(parse("[x]\n\n> [x]: /url\n").children, [
    { type: "paragraph", children: [{ type: "link", url: "/url", title: null, children: [{ type: "text", value: "x" }] }] },
    { type: "blockquote", children: [] }
  ]);
});

Ende.test("parse() merges adjacent text and turns soft breaks into newlines", () => {
  assertEquals(parse("a*b [c\nd").children, [{ type: "paragraph", children: [{ type: "text", value: "a*b [c\nd" }] }]);
});

Ende.test("parse() makes hard breaks", () => {
  assertEquals(parse("a  \nb\\\nc").children, [{
    type: "paragraph",
    children: [
      { type: "text", value: "a" },
      { type: "break" },
      { type: "text", value: "b" },
      { type: "break" },
      { type: "text", value: "c" }
    ]
  }]);
});

Ende.test("parse() makes html nodes for HTML blocks and inline HTML", () => {
  assertEquals(parse("<div>\nhi\n</div>\n\na <b>c</b>\n").children, [
    { type: "html", value: "<div>\nhi\n</div>" },
    {
      type: "paragraph",
      children: [
        { type: "text", value: "a " },
        { type: "html", value: "<b>" },
        { type: "text", value: "c" },
        { type: "html", value: "</b>" }
      ]
    }
  ]);
});

Ende.test("parse() makes headings with depth", () => {
  assertEquals(parse("### Three ###\n\nOne\n===\n\nTwo\n---\n").children, [
    { type: "heading", depth: 3, id: "three", children: [{ type: "text", value: "Three" }] },
    { type: "heading", depth: 1, id: "one", children: [{ type: "text", value: "One" }] },
    { type: "heading", depth: 2, id: "two", children: [{ type: "text", value: "Two" }] }
  ]);
});

Ende.test("parse() makes emphasis, strong, inline code and autolinks", () => {
  assertEquals(parse("***a*** `b` <https://ende.sh> <me@ende.sh>").children, [{
    type: "paragraph",
    children: [
      { type: "emphasis", children: [{ type: "strong", children: [{ type: "text", value: "a" }] }] },
      { type: "text", value: " " },
      { type: "inlineCode", value: "b" },
      { type: "text", value: " " },
      { type: "link", url: "https://ende.sh", title: null, children: [{ type: "text", value: "https://ende.sh" }] },
      { type: "text", value: " " },
      { type: "link", url: "mailto:me@ende.sh", title: null, children: [{ type: "text", value: "me@ende.sh" }] }
    ]
  }]);
});

Ende.test("parse() treats an empty link title as no title", () => {
  assertEquals(parse("[a](/u \"\")").children, [{
    type: "paragraph",
    children: [{ type: "link", url: "/u", title: null, children: [{ type: "text", value: "a" }] }]
  }]);
});

Ende.test("parse() without gfm leaves GFM syntax as CommonMark", () => {
  const markdown = "| a |\n| - |\n\n- [x] ~~b~~ www.ende.sh me@ende.sh[^1]\n\n[^1]: /note\n";
  assertEquals(parse(markdown).children, [
    { type: "paragraph", children: [{ type: "text", value: "| a |\n| - |" }] },
    {
      type: "list",
      ordered: false,
      start: null,
      spread: false,
      children: [{
        type: "listItem",
        spread: false,
        checked: null,
        children: [{
          type: "paragraph",
          children: [
            { type: "text", value: "[x] ~~b~~ www.ende.sh me@ende.sh" },
            // Without gfm, `[^1]: /note` is a link reference definition.
            { type: "link", url: "/note", title: null, children: [{ type: "text", value: "^1" }] }
          ]
        }]
      }]
    }
  ]);
  assertEquals(parse(markdown, { gfm: false }), parse(markdown));
});

Ende.test("parse() treats astral symbols such as emoji as punctuation around delimiters", () => {
  // The closing `**` follows a symbol and precedes a letter, so it isn't right-flanking.
  assertEquals(parse("**😀**a").children, [{ type: "paragraph", children: [{ type: "text", value: "**😀**a" }] }]);
});

const gfm: ParseOptions = { gfm: true };

Ende.test("parse() with gfm makes tables with alignment, filling short rows and truncating long ones", () => {
  const cell = (value: string): TableCell => ({ type: "tableCell", children: value === "" ? [] : [{ type: "text", value }] });
  assertEquals(parse("| a | *b* | c | d |\n| :- | -: | :-: | --- |\n| 1 |\n| 1 | 2 | 3 | 4 | 5 |\n", gfm).children, [{
    type: "table",
    align: ["left", "right", "center", null],
    children: [
      {
        type: "tableRow",
        children: [cell("a"), { type: "tableCell", children: [{ type: "emphasis", children: [{ type: "text", value: "b" }] }] }, cell("c"), cell("d")]
      },
      { type: "tableRow", children: [cell("1"), cell(""), cell(""), cell("")] },
      { type: "tableRow", children: [cell("1"), cell("2"), cell("3"), cell("4")] }
    ]
  }]);
});

Ende.test("parse() with gfm splits the lines before a table header into a paragraph", () => {
  assertEquals(parse("intro\na | b\n--|--\n", gfm).children, [
    { type: "paragraph", children: [{ type: "text", value: "intro" }] },
    {
      type: "table",
      align: [null, null],
      children: [{
        type: "tableRow",
        children: [{ type: "tableCell", children: [{ type: "text", value: "a" }] }, { type: "tableCell", children: [{ type: "text", value: "b" }] }]
      }]
    }
  ]);
});

Ende.test("parse() with gfm unescapes pipes in table cells, even in code spans", () => {
  assertEquals(parse("| a |\n| - |\n| `\\|` \\| |\n", gfm).children, [{
    type: "table",
    align: [null],
    children: [
      { type: "tableRow", children: [{ type: "tableCell", children: [{ type: "text", value: "a" }] }] },
      { type: "tableRow", children: [{ type: "tableCell", children: [{ type: "inlineCode", value: "|" }, { type: "text", value: " |" }] }] }
    ]
  }]);
});

Ende.test("parse() with gfm doesn't make a table when the header and delimiter row differ in length", () => {
  assertEquals(parse("| a | b |\n| - |\n", gfm).children, [{ type: "paragraph", children: [{ type: "text", value: "| a | b |\n| - |" }] }]);
});

Ende.test("parse() with gfm sets checked on task list items and removes the marker", () => {
  const list = parse("- [ ] todo\n- [x] done\n- [X] DONE\n- [y] not a task\n- [ ]\n", gfm).children[0] as List;
  assertEquals(list.children.map(item => item.checked), [false, true, true, null, null]);
  assertEquals(list.children[0]!.children, [{ type: "paragraph", children: [{ type: "text", value: "todo" }] }]);
  assertEquals(list.children[3]!.children, [{ type: "paragraph", children: [{ type: "text", value: "[y] not a task" }] }]);
});

Ende.test("parse() with gfm makes a task list item whose only content is the marker", () => {
  const list = parse("- [x] \n", gfm).children[0] as List;
  assertEquals(list.children, [{ type: "listItem", spread: false, checked: true, children: [] }]);
});

Ende.test("parse() with gfm makes delete nodes from one or two tildes", () => {
  assertEquals(parse("~a~ ~~*b*~~ ~~~c~~~ ~d~~", gfm).children, [{
    type: "paragraph",
    children: [
      { type: "delete", children: [{ type: "text", value: "a" }] },
      { type: "text", value: " " },
      { type: "delete", children: [{ type: "emphasis", children: [{ type: "text", value: "b" }] }] },
      { type: "text", value: " ~~~c~~~ ~d~~" }
    ]
  }]);
});

Ende.test("parse() with gfm makes links from bare www, http(s) and email addresses", () => {
  const link = (url: string, value: string): Link => ({ type: "link", url, title: null, children: [{ type: "text", value }] });
  assertEquals(parse("(www.ende.sh/a_b) https://ende.sh/docs. me+x@ende.sh, mailto:a@ende.sh", gfm).children, [{
    type: "paragraph",
    children: [
      { type: "text", value: "(" },
      link("http://www.ende.sh/a_b", "www.ende.sh/a_b"),
      { type: "text", value: ") " },
      link("https://ende.sh/docs", "https://ende.sh/docs"),
      { type: "text", value: ". " },
      link("mailto:me+x@ende.sh", "me+x@ende.sh"),
      { type: "text", value: ", " },
      link("mailto:a@ende.sh", "mailto:a@ende.sh")
    ]
  }]);
});

Ende.test("parse() with gfm doesn't autolink inside links or after a letter", () => {
  assertEquals(parse("[www.ende.sh](/x) awww.ende.sh", gfm).children, [{
    type: "paragraph",
    children: [
      { type: "link", url: "/x", title: null, children: [{ type: "text", value: "www.ende.sh" }] },
      { type: "text", value: " awww.ende.sh" }
    ]
  }]);
});

Ende.test("parse() with gfm keeps footnote definitions in place and resolves references", () => {
  assertEquals(parse("a[^Note] b[^none]\n\n[^note]: *x*\n\n    y\n", gfm).children, [
    {
      type: "paragraph",
      children: [
        { type: "text", value: "a" },
        { type: "footnoteReference", identifier: "note", label: "Note" },
        { type: "text", value: " b[^none]" }
      ]
    },
    {
      type: "footnoteDefinition",
      identifier: "note",
      label: "note",
      children: [
        { type: "paragraph", children: [{ type: "emphasis", children: [{ type: "text", value: "x" }] }] },
        { type: "paragraph", children: [{ type: "text", value: "y" }] }
      ]
    }
  ]);
});

Ende.test("parse() with gfm doesn't read ![^ as the start of an image", () => {
  assertEquals(parse("a![^1]\n\n[^1]: n\n", gfm).children[0], {
    type: "paragraph",
    children: [{ type: "text", value: "a!" }, { type: "footnoteReference", identifier: "1", label: "1" }]
  });
});

Ende.test("parse() with gfm looks past tildes next to emphasis delimiters, as cmark-gfm does", () => {
  assertEquals(parse("*~~a~~* *~ b*", gfm).children, [{
    type: "paragraph",
    children: [
      { type: "emphasis", children: [{ type: "delete", children: [{ type: "text", value: "a" }] }] },
      // `*~ b*`: the first `*` is followed by a space once the tilde is skipped.
      { type: "text", value: " *~ b*" }
    ]
  }]);
});

Ende.test("parse() with gfm parses the rest of a task list item's first line as a new paragraph", () => {
  // As in cmark-gfm, the marker ends the item's first line of block starts, so
  // a link reference definition can follow it, and an item with only the
  // marker has no paragraph for a lazy line to continue.
  assertEquals(parse("- [x] [a]: /u\n- [ ] \nlazy [a]\n", gfm).children, [
    {
      type: "list",
      ordered: false,
      start: null,
      spread: false,
      children: [
        { type: "listItem", spread: false, checked: true, children: [] },
        { type: "listItem", spread: false, checked: false, children: [] }
      ]
    },
    {
      type: "paragraph",
      children: [{ type: "text", value: "lazy " }, { type: "link", url: "/u", title: null, children: [{ type: "text", value: "a" }] }]
    }
  ]);
});

function headingIds(markdown: string, options: ParseOptions = {}): string[] {
  const ids: string[] = [];
  const walk = (node: Nodes) => {
    if (node.type === "heading") {
      ids.push(node.id);
    }
    if ("children" in node) {
      node.children.forEach(walk);
    }
  };
  walk(parse(markdown, options));
  return ids;
}

Ende.test("parse() gives each heading a GitHub-style id", () => {
  assertEquals(headingIds("# Hello World\n\n## What's new in 2.0?"), ["hello-world", "whats-new-in-20"]);
});

Ende.test("parse() makes heading ids unique by adding -1, -2 and so on", () => {
  assertEquals(headingIds("# Install\n## Install\n### Install"), ["install", "install-1", "install-2"]);
});

Ende.test("parse() deduplicates heading ids the way github-slugger counts", () => {
  assertEquals(headingIds("# a\n# a\n# a-1"), ["a", "a-1", "a-1-1"]);
  assertEquals(headingIds("# a-1\n# a\n# a"), ["a-1", "a", "a-2"]);
});

Ende.test("parse() slugs the plain text of a heading, using image alt text", () => {
  assertEquals(headingIds("# Hello *world* `code` ![Alt Text](x.png) [link](/u) <span>html</span>"), ["hello-world-code-alt-text-link-html"]);
});

Ende.test("parse() leaves footnote references out of heading ids", () => {
  assertEquals(headingIds("# Title[^1]\n\n[^1]: A note.", gfm), ["title"]);
});

Ende.test("parse() numbers heading ids in document order, inside containers too", () => {
  assertEquals(headingIds("# A\n\n> # A\n\n- # A\n\n# A"), ["a", "a-1", "a-2", "a-3"]);
});

Ende.test("parse() gives an empty id to a heading without sluggable text", () => {
  assertEquals(headingIds("#\n\n# !!!"), ["", "-1"]);
});

Ende.test("parse() uses a custom slugger, and deduplicates its ids", () => {
  const slugger = (text: string) => text.toUpperCase().replaceAll(" ", "_");
  assertEquals(headingIds("# Get started\n# Get started", { slugger }), ["GET_STARTED", "GET_STARTED-1"]);
});

Ende.test("parse() passes the plain text of a heading to a custom slugger", () => {
  const texts: string[] = [];
  parse("# A *b* `c`\nSetext\n---", {
    slugger: text => {
      texts.push(text);
      return "x";
    }
  });
  assertEquals(texts, ["A b c", "Setext"]);
});

Ende.test("parse() with gfm makes an admonition from a GitHub alert", () => {
  assertEquals(parse("> [!NOTE]\n> Useful information.", gfm).children, [{
    type: "admonition",
    kind: "note",
    children: [{ type: "paragraph", children: [{ type: "text", value: "Useful information." }] }]
  }]);
});

Ende.test("parse() with gfm recognizes all five alert kinds, in any case", () => {
  const kinds = ["[!NOTE]", "[!tip]", "[!Important]", "[!wArNiNg]", "[!CAUTION]"].map(marker => {
    const node = parse(`> ${marker}\n> text`, gfm).children[0]!;
    return node.type === "admonition" ? node.kind : node.type;
  });
  assertEquals(kinds, ["note", "tip", "important", "warning", "caution"]);
});

Ende.test("parse() with gfm allows spaces after the alert marker", () => {
  assertEquals(parse("> [!TIP]   \n> text", gfm).children[0]?.type, "admonition");
});

Ende.test("parse() with gfm keeps the blocks after the alert marker", () => {
  assertEquals(parse("> [!WARNING]\n>\n> ## Careful\n>\n> - a", gfm).children, [{
    type: "admonition",
    kind: "warning",
    children: [
      { type: "heading", depth: 2, id: "careful", children: [{ type: "text", value: "Careful" }] },
      {
        type: "list",
        ordered: false,
        start: null,
        spread: false,
        children: [{ type: "listItem", spread: false, checked: null, children: [{ type: "paragraph", children: [{ type: "text", value: "a" }] }] }]
      }
    ]
  }]);
});

Ende.test("parse() with gfm leaves a blockquote alone when it isn't an alert", () => {
  const types = (markdown: string) => parse(markdown, gfm).children.map(node => node.type);
  // Text after the marker on the same line.
  assertEquals(types("> [!NOTE] Text\n> more"), ["blockquote"]);
  // An unknown kind.
  assertEquals(types("> [!INFO]\n> text"), ["blockquote"]);
  // A marker with nothing after it.
  assertEquals(types("> [!NOTE]"), ["blockquote"]);
  assertEquals(types("> [!NOTE]\n>"), ["blockquote"]);
  // An escaped marker.
  assertEquals(types("> \\[!NOTE]\n> text"), ["blockquote"]);
  // The marker isn't on the first line.
  assertEquals(types("> text\n> [!NOTE]\n> more"), ["blockquote"]);
  // The marker isn't the first block.
  assertEquals(types("> # Title\n> [!NOTE]\n> more"), ["blockquote"]);
});

Ende.test("parse() with gfm keeps the text of a marker-only blockquote", () => {
  assertEquals(parse("> [!NOTE]", gfm).children, [{
    type: "blockquote",
    children: [{ type: "paragraph", children: [{ type: "text", value: "[!NOTE]" }] }]
  }]);
});

Ende.test("parse() with gfm only makes admonitions at the top level, as GitHub does", () => {
  const ast = parse("- > [!NOTE]\n  > in a list\n\n> > [!TIP]\n> > nested\n\nText[^1]\n\n[^1]: > [!NOTE]\n    > in a footnote\n", gfm);
  const types: string[] = [];
  const walk = (node: Nodes) => {
    types.push(node.type);
    if ("children" in node) {
      node.children.forEach(walk);
    }
  };
  walk(ast);
  assertEquals(types.includes("admonition"), false);
});

Ende.test("parse() with gfm leaves an alert-like blockquote inside an admonition as a blockquote", () => {
  const node = parse("> [!NOTE]\n> > [!TIP]\n> > inner", gfm).children[0]!;
  assertEquals(node.type, "admonition");
  assertEquals(node.type === "admonition" && node.children.map(child => child.type), ["blockquote"]);
});

Ende.test("parse() without gfm leaves an alert as a blockquote", () => {
  assertEquals(parse("> [!NOTE]\n> text").children, [{
    type: "blockquote",
    children: [{ type: "paragraph", children: [{ type: "text", value: "[!NOTE]\ntext" }] }]
  }]);
});
