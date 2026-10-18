// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

/**
 * A CommonMark parser and HTML renderer, with optional GitHub Flavored
 * Markdown, and the features a documentation site needs:
 *
 * - {@linkcode parse} turns Markdown into a syntax tree shaped like
 *   {@link https://github.com/syntax-tree/mdast | mdast}, and gives every
 *   heading a unique, GitHub-compatible `id` ({@linkcode slug} is the default
 *   algorithm; the `slugger` option replaces it).
 * - {@linkcode render} turns that tree into HTML, with options to rewrite
 *   link and image URLs (`rewriteLink`), highlight code blocks (`highlight`),
 *   allow, escape or strip raw HTML (`html`), and leave out heading ids
 *   (`headingIds`).
 * - {@linkcode toc} lists the headings for a table of contents.
 * - {@linkcode visit} walks the tree, for changes between parsing and
 *   rendering.
 * - With the `gfm` option: tables, task lists, strikethrough, extended
 *   autolinks, footnotes, and GitHub's alerts (`> [!NOTE]`) as `admonition`
 *   nodes.
 *
 * The parser is a port of {@link https://github.com/commonmark/commonmark.js | commonmark.js},
 * the CommonMark reference implementation, and passes every example in the
 * {@link https://spec.commonmark.org/0.31.2/ | CommonMark Spec 0.31.2}.
 *
 * ```ts
 * import { parse, render } from "@ende/markdown";
 * import { assertEquals } from "@ende/assert";
 *
 * const ast = parse("Hello, *Ende*!");
 * assertEquals(render(ast), "<p>Hello, <em>Ende</em>!</p>\n");
 * ```
 *
 * ## Building a documentation page
 *
 * With {@link https://jsr.io/@ende/front-matter | @ende/front-matter} for the
 * front matter:
 *
 * ```ts
 * import { extract } from "@ende/front-matter/yaml";
 * import { parse, render, toc } from "@ende/markdown";
 * import { assertEquals } from "@ende/assert";
 *
 * const source = "---\ntitle: Guide\n---\n# Guide\n\n> [!NOTE]\n> See [setup](setup.md).\n\n## Install\n\n~~~sh\nende install\n~~~\n";
 * // A real highlighter would add markup to the escaped code.
 * const highlight = (code: string, lang: string | null) => lang === "sh" ? `<span class="sh">${code}</span>` : undefined;
 *
 * const { attrs, body } = extract<{ title: string }>(source);
 * const ast = parse(body, { gfm: true });
 * const html = render(ast, { highlight, rewriteLink: href => href.replace(/\.md$/, "/") });
 * const outline = toc(ast, { maxDepth: 3 });
 *
 * assertEquals(attrs.title, "Guide");
 * assertEquals(outline, [
 *   { depth: 1, text: "Guide", slug: "guide" },
 *   { depth: 2, text: "Install", slug: "install" }
 * ]);
 * assertEquals(
 *   html,
 *   `<h1 id="guide">Guide</h1>
 * <div class="markdown-alert markdown-alert-note">
 * <p class="markdown-alert-title">Note</p>
 * <p>See <a href="setup/">setup</a>.</p>
 * </div>
 * <h2 id="install">Install</h2>
 * <pre><code class="language-sh"><span class="sh">ende install</span></code></pre>
 * `
 * );
 * ```
 *
 * ## Heading ids
 *
 * Heading ids are the one way the default output differs from the HTML of the
 * CommonMark and GFM specs: `render()` writes `<h2 id="install">` where the
 * specs have `<h2>`. Pass `headingIds: false` for spec output. The default
 * {@linkcode slug} follows GitHub (github-slugger), so `#install` links work
 * both on GitHub and on a site built with this package, and repeated headings
 * get `-1`, `-2` and so on. `render()` never writes an id twice: when a
 * footnote's id (`fn-1`, `fnref-1`) is already a heading's, the footnote's id
 * gets a suffix instead.
 *
 * ## Differences from mdast
 *
 * - Link reference definitions are resolved at parse time. A reference link
 *   such as `[text][label]` becomes a `link` node with the definition's `url`
 *   and `title`, and an image reference becomes an `image` node. The tree has
 *   no `definition`, `linkReference` or `imageReference` nodes.
 * - Nodes have no `position` information.
 * - Headings have an `id`, and GitHub alerts are `admonition` nodes.
 * - A `code` node's `value` has no final line ending, so a fenced code block
 *   whose only content is one blank line has an empty `value`, like an empty
 *   block.
 *
 * Raw HTML is a `html` node both as a block and inline; it's an HTML block
 * when its parent is a block container (`root`, `blockquote`, `listItem` or
 * `footnoteDefinition`) and inline HTML when its parent holds phrasing content.
 *
 * ```ts
 * import { parse } from "@ende/markdown";
 * import { assertEquals } from "@ende/assert";
 *
 * const ast = parse("See [the docs].\n\n[the docs]: https://docs.ende.sh");
 * assertEquals(ast.children.length, 1);
 * assertEquals(ast.children[0], {
 *   type: "paragraph",
 *   children: [
 *     { type: "text", value: "See " },
 *     { type: "link", url: "https://docs.ende.sh", title: null, children: [{ type: "text", value: "the docs" }] },
 *     { type: "text", value: "." }
 *   ]
 * });
 * ```
 *
 * ## GitHub Flavored Markdown
 *
 * The `gfm` option enables the extensions of the
 * {@link https://github.github.com/gfm/ | GitHub Flavored Markdown Spec}, and
 * footnotes:
 *
 * - Tables become `table`, `tableRow` and `tableCell` nodes, with the column
 *   alignments in `table.align`.
 * - Task list items set `listItem.checked` to `true` or `false` (it's `null`
 *   for other items).
 * - Strikethrough with one or two tildes (`~a~`, `~~a~~`) becomes `delete`.
 * - Extended autolinks: `www.` addresses, `http://`, `https://` and `ftp://`
 *   URLs, and email addresses become `link` nodes without the `<` and `>`.
 * - Footnotes: `[^label]: text` becomes a `footnoteDefinition`, which stays
 *   where it was written, and `[^label]` becomes a `footnoteReference`.
 *
 * Parsing and rendering match {@link https://github.com/github/cmark-gfm | cmark-gfm},
 * the implementation behind GitHub, and the extension examples of the GFM Spec
 * and cmark-gfm's extension tests pass. `render()` writes footnotes the way
 * GitHub does, with numbered references and a footnotes section at the end.
 * Without `gfm`, parsing is pure CommonMark.
 *
 * ```ts
 * import { parse, render } from "@ende/markdown";
 * import { assertEquals } from "@ende/assert";
 *
 * const markdown = "| Feature | Done |\n| :-- | :-: |\n| Tables | ~~no~~ yes |\n";
 * assertEquals(
 *   render(parse(markdown, { gfm: true })),
 *   `<table>
 * <thead>
 * <tr>
 * <th align="left">Feature</th>
 * <th align="center">Done</th>
 * </tr>
 * </thead>
 * <tbody>
 * <tr>
 * <td align="left">Tables</td>
 * <td align="center"><del>no</del> yes</td>
 * </tr>
 * </tbody>
 * </table>
 * `
 * );
 * ```
 *
 * GitHub's alerts are recognized as GitHub recognizes them: a block quote at
 * the top level of the document (not inside a list, another block quote or a
 * footnote) whose first line is just `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`,
 * `[!WARNING]` or `[!CAUTION]`, in any case, with content after it. One
 * extension: text after the marker on its line, such as
 * `> [!TIP] Want to type-check only?`, is the alert's title, rendered in place
 * of "Tip". GitHub shows such a block quote as a plain block quote.
 *
 * The GFM Disallowed Raw HTML extension (tagfilter), which escapes tags such
 * as `<script>` and `<iframe>`, isn't included: by default raw HTML renders as
 * written, with or without `gfm`. `render()`'s `html` option escapes or
 * strips all raw HTML instead. It doesn't sanitize URLs (such as
 * `javascript:` links), so sanitize the HTML of untrusted Markdown.
 *
 * @module
 */

export * from "./parse.ts";
export * from "./render.ts";
export * from "./slug.ts";
export * from "./toc.ts";
export * from "./types.ts";
export * from "./visit.ts";
