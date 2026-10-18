// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { parse } from "./parse.ts";
import { render } from "./render.ts";
import type { BlockContent, Image, Link, ListItem, PhrasingContent, RenderOptions, TableRow } from "./types.ts";

function item(...children: BlockContent[]): ListItem {
  return { type: "listItem", spread: false, checked: null, children };
}

function paragraph(value: string): BlockContent {
  return { type: "paragraph", children: [{ type: "text", value }] };
}

function inline(...children: PhrasingContent[]): string {
  return render({ type: "root", children: [{ type: "paragraph", children }] });
}

Ende.test("render() returns an empty string for an empty root", () => {
  assertEquals(render({ type: "root", children: [] }), "");
});

Ende.test("render() leaves out <p> tags in a tight list", () => {
  const html = render({
    type: "root",
    children: [{ type: "list", ordered: false, start: null, spread: false, children: [item(paragraph("a")), item(paragraph("b"))] }]
  });
  assertEquals(html, "<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n");
});

Ende.test("render() keeps <p> tags in a spread list", () => {
  const html = render({
    type: "root",
    children: [{ type: "list", ordered: false, start: null, spread: true, children: [item(paragraph("a"))] }]
  });
  assertEquals(html, "<ul>\n<li>\n<p>a</p>\n</li>\n</ul>\n");
});

Ende.test("render() writes the start attribute unless the list starts at 1", () => {
  const list = (start: number) => render({ type: "root", children: [{ type: "list", ordered: true, start, spread: false, children: [item(paragraph("a"))] }] });
  assertEquals(list(1), "<ol>\n<li>a</li>\n</ol>\n");
  assertEquals(list(0), "<ol start=\"0\">\n<li>a</li>\n</ol>\n");
});

Ende.test("render() renders html nodes raw, as blocks or inline", () => {
  const html = render({
    type: "root",
    children: [
      { type: "html", value: "<div>" },
      { type: "paragraph", children: [{ type: "html", value: "<b>" }, { type: "text", value: "x" }, { type: "html", value: "</b>" }] }
    ]
  });
  assertEquals(html, "<div>\n<p><b>x</b></p>\n");
});

Ende.test("render() escapes text and attributes", () => {
  assertEquals(inline({ type: "text", value: "<a & \"b\" 'c'>" }), "<p>&lt;a &amp; &quot;b&quot; 'c'&gt;</p>\n");
  assertEquals(
    inline({ type: "link", url: "/a?b&c", title: "\"t\"", children: [{ type: "text", value: "x" }] }),
    "<p><a href=\"/a?b&amp;c\" title=\"&quot;t&quot;\">x</a></p>\n"
  );
});

Ende.test("render() renders images with and without a title", () => {
  assertEquals(inline({ type: "image", url: "/i.png", title: null, alt: "a<b" }), "<p><img src=\"/i.png\" alt=\"a&lt;b\" /></p>\n");
  assertEquals(inline({ type: "image", url: "/i.png", title: "T", alt: "" }), "<p><img src=\"/i.png\" alt=\"\" title=\"T\" /></p>\n");
});

Ende.test("render() renders code blocks with a language class", () => {
  const code = (lang: string | null, value: string) => render({ type: "root", children: [{ type: "code", lang, meta: "ignored", value }] });
  assertEquals(code("js", "a"), "<pre><code class=\"language-js\">a\n</code></pre>\n");
  assertEquals(code("language-js", "a"), "<pre><code class=\"language-js\">a\n</code></pre>\n");
  assertEquals(code(null, ""), "<pre><code></code></pre>\n");
});

Ende.test("render() renders inline nodes", () => {
  assertEquals(
    inline(
      { type: "emphasis", children: [{ type: "text", value: "a" }] },
      { type: "strong", children: [{ type: "text", value: "b" }] },
      { type: "inlineCode", value: "<c>" },
      { type: "break" },
      { type: "text", value: "d" }
    ),
    "<p><em>a</em><strong>b</strong><code>&lt;c&gt;</code><br />\nd</p>\n"
  );
});

Ende.test("render() renders headings, block quotes and thematic breaks", () => {
  const html = render({
    type: "root",
    children: [
      { type: "heading", depth: 2, id: "t", children: [{ type: "text", value: "T" }] },
      { type: "blockquote", children: [paragraph("q")] },
      { type: "thematicBreak" }
    ]
  });
  assertEquals(html, "<h2 id=\"t\">T</h2>\n<blockquote>\n<p>q</p>\n</blockquote>\n<hr />\n");
});

Ende.test("render() renders tables with alignment, and a tbody only when there are body rows", () => {
  const row = (...values: string[]): TableRow => ({
    type: "tableRow",
    children: values.map(value => ({ type: "tableCell", children: [{ type: "text", value }] }))
  });
  assertEquals(
    render({ type: "root", children: [{ type: "table", align: ["left", null], children: [row("a", "b"), row("c", "d")] }] }),
    "<table>\n<thead>\n<tr>\n<th align=\"left\">a</th>\n<th>b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td align=\"left\">c</td>\n<td>d</td>\n</tr>\n</tbody>\n</table>\n"
  );
  assertEquals(
    render({ type: "root", children: [{ type: "table", align: ["center"], children: [row("a")] }] }),
    "<table>\n<thead>\n<tr>\n<th align=\"center\">a</th>\n</tr>\n</thead>\n</table>\n"
  );
});

Ende.test("render() renders delete nodes", () => {
  assertEquals(inline({ type: "delete", children: [{ type: "text", value: "gone" }] }), "<p><del>gone</del></p>\n");
});

Ende.test("render() renders a checkbox for task list items", () => {
  const task = (checked: boolean | null): ListItem => ({ type: "listItem", spread: false, checked, children: [paragraph("x")] });
  const html = render({
    type: "root",
    children: [{ type: "list", ordered: false, start: null, spread: false, children: [task(true), task(false), task(null)] }]
  });
  assertEquals(
    html,
    "<ul>\n<li><input type=\"checkbox\" checked=\"\" disabled=\"\" /> x</li>\n<li><input type=\"checkbox\" disabled=\"\" /> x</li>\n<li>x</li>\n</ul>\n"
  );
});

Ende.test("render() moves referenced footnote definitions into a section at the end, in reference order", () => {
  const html = render({
    type: "root",
    children: [
      { type: "footnoteDefinition", identifier: "b", label: "B", children: [paragraph("Bee.")] },
      {
        type: "paragraph",
        children: [
          { type: "footnoteReference", identifier: "b", label: "b" },
          { type: "footnoteReference", identifier: "a", label: "a" },
          { type: "footnoteReference", identifier: "b", label: "b" }
        ]
      },
      { type: "footnoteDefinition", identifier: "a", label: "a", children: [{ type: "code", lang: null, meta: null, value: "x" }] },
      { type: "footnoteDefinition", identifier: "unused", label: "unused", children: [paragraph("Never shown.")] }
    ]
  });
  assertEquals(
    html,
    "<p>" +
      "<sup class=\"footnote-ref\"><a href=\"#fn-B\" id=\"fnref-B\" data-footnote-ref>1</a></sup>" +
      "<sup class=\"footnote-ref\"><a href=\"#fn-a\" id=\"fnref-a\" data-footnote-ref>2</a></sup>" +
      "<sup class=\"footnote-ref\"><a href=\"#fn-B\" id=\"fnref-B-2\" data-footnote-ref>1</a></sup>" +
      "</p>\n" +
      "<section class=\"footnotes\" data-footnotes>\n<ol>\n" +
      "<li id=\"fn-B\">\n<p>Bee. " +
      "<a href=\"#fnref-B\" class=\"footnote-backref\" data-footnote-backref data-footnote-backref-idx=\"1\" aria-label=\"Back to reference 1\">↩</a> " +
      "<a href=\"#fnref-B-2\" class=\"footnote-backref\" data-footnote-backref data-footnote-backref-idx=\"1-2\" aria-label=\"Back to reference 1-2\">↩<sup class=\"footnote-ref\">2</sup></a>" +
      "</p>\n</li>\n" +
      "<li id=\"fn-a\">\n<pre><code>x\n</code></pre>\n" +
      "<a href=\"#fnref-a\" class=\"footnote-backref\" data-footnote-backref data-footnote-backref-idx=\"2\" aria-label=\"Back to reference 2\">↩</a>\n" +
      "</li>\n</ol>\n</section>\n"
  );
});

Ende.test("render() renders a footnote reference without a definition as text", () => {
  assertEquals(inline({ type: "footnoteReference", identifier: "x", label: "X" }), "<p>[^X]</p>\n");
});

Ende.test("render() renders nothing extra when no footnote is referenced", () => {
  assertEquals(render({ type: "root", children: [{ type: "footnoteDefinition", identifier: "a", label: "a", children: [paragraph("x")] }] }), "");
});

Ende.test("render() escapes footnote labels in ids and links as cmark-gfm does", () => {
  const html = render({
    type: "root",
    children: [
      { type: "paragraph", children: [{ type: "footnoteReference", identifier: "a'b<", label: "a'b<" }] },
      { type: "footnoteDefinition", identifier: "a'b<", label: "a'b<", children: [] }
    ]
  });
  assertEquals(
    html,
    "<p><sup class=\"footnote-ref\"><a href=\"#fn-a&#x27;b%3C\" id=\"fnref-a&#x27;b%3C\" data-footnote-ref>1</a></sup></p>\n" +
      "<section class=\"footnotes\" data-footnotes>\n<ol>\n<li id=\"fn-a&#x27;b%3C\">\n" +
      "<a href=\"#fnref-a&#x27;b%3C\" class=\"footnote-backref\" data-footnote-backref data-footnote-backref-idx=\"1\" aria-label=\"Back to reference 1\">↩</a>\n" +
      "</li>\n</ol>\n</section>\n"
  );
});

function heading(id: string, value: string): BlockContent {
  return { type: "heading", depth: 2, id, children: [{ type: "text", value }] };
}

function gfm(markdown: string, options: RenderOptions = {}): string {
  return render(parse(markdown, { gfm: true }), options);
}

Ende.test("render() writes heading ids", () => {
  assertEquals(render(parse("# Install\n\n## Install")), "<h1 id=\"install\">Install</h1>\n<h2 id=\"install-1\">Install</h2>\n");
});

Ende.test("render() leaves heading ids out with headingIds: false", () => {
  assertEquals(render(parse("# Install"), { headingIds: false }), "<h1>Install</h1>\n");
});

Ende.test("render() escapes heading ids", () => {
  assertEquals(render({ type: "root", children: [heading("a\"b&c", "x")] }), "<h2 id=\"a&quot;b&amp;c\">x</h2>\n");
});

Ende.test("render() leaves out an empty heading id", () => {
  assertEquals(render({ type: "root", children: [heading("", "!")] }), "<h2>!</h2>\n");
});

Ende.test("render() makes duplicate heading ids of a hand-built tree unique", () => {
  assertEquals(render({ type: "root", children: [heading("x", "a"), heading("x", "b")] }), "<h2 id=\"x\">a</h2>\n<h2 id=\"x-1\">b</h2>\n");
});

Ende.test("render() renames footnote ids that a heading id already uses", () => {
  const html = gfm("# fn 1\n\n## fnref 1\n\nText[^1]\n\n[^1]: Note.");
  assertEquals(
    html,
    `<h1 id="fn-1">fn 1</h1>
<h2 id="fnref-1">fnref 1</h2>
<p>Text<sup class="footnote-ref"><a href="#fn-1-1" id="fnref-1-1" data-footnote-ref>1</a></sup></p>
<section class="footnotes" data-footnotes>
<ol>
<li id="fn-1-1">
<p>Note. <a href="#fnref-1-1" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="1" aria-label="Back to reference 1">↩</a></p>
</li>
</ol>
</section>
`
  );
});

Ende.test("render() keeps footnote ids as they are when heading ids are off", () => {
  const html = gfm("# fn 1\n\nText[^1]\n\n[^1]: Note.", { headingIds: false });
  assertEquals(html.includes("<li id=\"fn-1\">"), true);
});

Ende.test("render() never writes the same id twice, even for footnote labels that collide", () => {
  // The second reference to `1` would be `fnref-1-2`, the id of the reference to `1-2`.
  const html = gfm("# fnref 1 2\n\na[^1] b[^1-2] c[^1]\n\n[^1]: One.\n\n[^1-2]: Two.");
  const ids = [...html.matchAll(/ id="([^"]*)"/g)].map(match => match[1]);
  assertEquals(ids.length, new Set(ids).size);
  // Every link to an id points at an id that exists.
  for (const [, href] of html.matchAll(/ href="#([^"]*)"/g)) {
    assertEquals(ids.includes(href), true, `#${href} has no target`);
  }
});

Ende.test("render() rewrites link and image urls with rewriteLink", () => {
  const seen: string[] = [];
  const rewriteLink = (url: string, node: Link | Image) => {
    seen.push(`${node.type} ${url}`);
    return url.replace(/\.md$/, "/");
  };
  assertEquals(
    gfm("[Guide](guide.md) ![Logo](logo.md) <https://ende.sh/a.md> www.ende.sh/b.md", { rewriteLink }),
    "<p><a href=\"guide/\">Guide</a> <img src=\"logo/\" alt=\"Logo\" /> <a href=\"https://ende.sh/a/\">https://ende.sh/a.md</a> " +
      "<a href=\"http://www.ende.sh/b/\">www.ende.sh/b.md</a></p>\n"
  );
  assertEquals(seen, ["link guide.md", "image logo.md", "link https://ende.sh/a.md", "link http://www.ende.sh/b.md"]);
});

Ende.test("render() escapes the url rewriteLink returns", () => {
  assertEquals(render(parse("[a](b)"), { rewriteLink: () => "/x?y&z=\"1\"" }), "<p><a href=\"/x?y&amp;z=&quot;1&quot;\">a</a></p>\n");
});

Ende.test("render() doesn't pass footnote links to rewriteLink", () => {
  const seen: string[] = [];
  gfm("Text[^1]\n\n[^1]: Note.", {
    rewriteLink: url => {
      seen.push(url);
      return url;
    }
  });
  assertEquals(seen, []);
});

Ende.test("render() inserts the HTML highlight returns into the code element", () => {
  const calls: [string, string | null][] = [];
  const highlight = (code: string, lang: string | null) => {
    calls.push([code, lang]);
    return `<span class="hl">${code.toUpperCase()}</span>`;
  };
  assertEquals(
    render(parse("```ts title=\"x\"\nlet a;\nlet b;\n```\n\n    indented\n"), { highlight }),
    "<pre><code class=\"language-ts\"><span class=\"hl\">LET A;\nLET B;</span></code></pre>\n" +
      "<pre><code><span class=\"hl\">INDENTED</span></code></pre>\n"
  );
  assertEquals(calls, [["let a;\nlet b;", "ts"], ["indented", null]]);
});

Ende.test("render() escapes the code when highlight returns undefined", () => {
  const html = render(parse("```js\n1 < 2\n```\n\n```ts\nx\n```"), { highlight: (_code, lang) => lang === "ts" ? "<b>x</b>" : undefined });
  assertEquals(html, "<pre><code class=\"language-js\">1 &lt; 2\n</code></pre>\n<pre><code class=\"language-ts\"><b>x</b></code></pre>\n");
});

const rawHtml = "<div>\n*hi*\n</div>\n\na <b>c</b> d\n";

Ende.test("render() renders raw HTML as written by default", () => {
  assertEquals(render(parse(rawHtml)), "<div>\n*hi*\n</div>\n<p>a <b>c</b> d</p>\n");
  assertEquals(render(parse(rawHtml), { html: "allow" }), "<div>\n*hi*\n</div>\n<p>a <b>c</b> d</p>\n");
});

Ende.test("render() with html: \"escape\" shows raw HTML as text, an HTML block as a paragraph", () => {
  assertEquals(render(parse(rawHtml), { html: "escape" }), "<p>&lt;div&gt;\n*hi*\n&lt;/div&gt;</p>\n<p>a &lt;b&gt;c&lt;/b&gt; d</p>\n");
});

Ende.test("render() with html: \"escape\" leaves out the paragraph tags of an HTML block in a tight list", () => {
  assertEquals(render(parse("- <div>\n- b\n"), { html: "escape" }), "<ul>\n<li>&lt;div&gt;</li>\n<li>b</li>\n</ul>\n");
});

Ende.test("render() with html: \"strip\" removes raw HTML", () => {
  assertEquals(render(parse(rawHtml), { html: "strip" }), "<p>a c d</p>\n");
});

Ende.test("render() with html: \"strip\" drops a paragraph left with no content", () => {
  assertEquals(render(parse("<b>\n</b>\n\n<i>x</i>\n\nafter"), { html: "strip" }), "<p>x</p>\n<p>after</p>\n");
  assertEquals(render(parse("text\n\n<span> </span>"), { html: "strip" }), "<p>text</p>\n");
});

Ende.test("render() with html: \"strip\" keeps the containers around stripped HTML", () => {
  assertEquals(render(parse("> <div>\n\n- <!-- x -->"), { html: "strip" }), "<blockquote>\n</blockquote>\n<ul>\n<li></li>\n</ul>\n");
});

Ende.test("render() renders an admonition like GitHub, without the icon", () => {
  assertEquals(
    gfm("> [!NOTE]\n> Useful *information*.\n>\n> More."),
    "<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Note</p>\n<p>Useful <em>information</em>.</p>\n<p>More.</p>\n</div>\n"
  );
});

Ende.test("render() renders an admonition's own title in place of the kind's", () => {
  assertEquals(
    gfm("> [!NOTE] `text` imports\n> Need a flag."),
    "<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\"><code>text</code> imports</p>\n<p>Need a flag.</p>\n</div>\n"
  );
});

Ende.test("render() titles each kind of admonition", () => {
  const titles = ["note", "tip", "important", "warning", "caution"].map(kind => {
    const html = gfm(`> [!${kind}]\n> x`);
    return [html.match(/markdown-alert-(\w+)"/)?.[1], html.match(/markdown-alert-title">(\w+)</)?.[1]];
  });
  assertEquals(titles, [["note", "Note"], ["tip", "Tip"], ["important", "Important"], ["warning", "Warning"], ["caution", "Caution"]]);
});
