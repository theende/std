// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { extract } from "@ende/front-matter/yaml";
import { parse, render, toc } from "./mod.ts";

// The way a static site generator uses the package: front matter, GFM,
// highlighting, `.md` links rewritten to pages, and a table of contents.
Ende.test("parse(), render() and toc() build a docs page from Markdown with front matter", () => {
  const source = `---
title: Getting started
---
# Getting started

> [!TIP]
> Read the [installation guide](install.md) first.

## Install

\`\`\`sh
ende install
\`\`\`

## Configure

### Options

| Option | Default |
| --- | --- |
| \`gfm\` | \`false\` |

#### Deep details

## Install

Again[^1].

[^1]: See [the FAQ](faq.md).
`;
  const highlight = (code: string, lang: string | null) => lang === "sh" ? `<span class="sh">${code}</span>` : undefined;

  const { attrs, body } = extract<{ title: string; }>(source);
  const ast = parse(body, { gfm: true });
  const html = render(ast, { highlight, rewriteLink: href => href.replace(/\.md$/, "/") });
  const outline = toc(ast, { maxDepth: 3 });

  assertEquals(attrs, { title: "Getting started" });
  assertEquals(outline, [
    { depth: 1, text: "Getting started", slug: "getting-started" },
    { depth: 2, text: "Install", slug: "install" },
    { depth: 2, text: "Configure", slug: "configure" },
    { depth: 3, text: "Options", slug: "options" },
    { depth: 2, text: "Install", slug: "install-1" }
  ]);
  assertEquals(
    html,
    `<h1 id="getting-started">Getting started</h1>
<div class="markdown-alert markdown-alert-tip">
<p class="markdown-alert-title">Tip</p>
<p>Read the <a href="install/">installation guide</a> first.</p>
</div>
<h2 id="install">Install</h2>
<pre><code class="language-sh"><span class="sh">ende install</span></code></pre>
<h2 id="configure">Configure</h2>
<h3 id="options">Options</h3>
<table>
<thead>
<tr>
<th>Option</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>gfm</code></td>
<td><code>false</code></td>
</tr>
</tbody>
</table>
<h4 id="deep-details">Deep details</h4>
<h2 id="install-1">Install</h2>
<p>Again<sup class="footnote-ref"><a href="#fn-1" id="fnref-1" data-footnote-ref>1</a></sup>.</p>
<section class="footnotes" data-footnotes>
<ol>
<li id="fn-1">
<p>See <a href="faq/">the FAQ</a>. <a href="#fnref-1" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="1" aria-label="Back to reference 1">↩</a></p>
</li>
</ol>
</section>
`
  );
});
