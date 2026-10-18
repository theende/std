// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
//
// Ported from commonmark.js 0.31.2 (lib/render/html.js and lib/render/renderer.js).
// Tables, task list items, strikethrough and footnotes render as cmark-gfm
// renders them (src/html.c and the extensions' HTML renderers), which has the
// same copyright and license.
//
// commonmark.js is Copyright (c) 2014, John MacFarlane. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   * Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//
//   * Redistributions in binary form must reproduce the above
//     copyright notice, this list of conditions and the following
//     disclaimer in the documentation and/or other materials provided
//     with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import { escapeXml, normalizeUri } from "./_common.ts";
import { IdSet } from "./_ids.ts";
import type {
  Admonition,
  BlockContent,
  DefinitionContent,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Nodes,
  PhrasingContent,
  RenderOptions,
  Root,
  Table
} from "./types.ts";

/**
 * Renders a syntax tree from `parse()` to HTML. The output matches the CommonMark reference implementation,
 * commonmark.js, and for the GitHub Flavored Markdown nodes, cmark-gfm, with one difference by default:
 * headings have an `id` attribute (their {@linkcode Heading.id}). The `headingIds: false` option turns that off.
 *
 * No id is written twice. Heading ids keep their values, since links and tables of contents use them; if a
 * footnote's id (`fn-label`, `fnref-label`) is already taken by a heading or another footnote, the footnote's id
 * gets a suffix (`fn-label-1`), and its links follow. Ids inside raw HTML aren't checked.
 *
 * An `admonition` renders as GitHub renders an alert, without the icon: a
 * `<div class="markdown-alert markdown-alert-note">` holding a
 * `<p class="markdown-alert-title">Note</p>` and the content. An admonition with
 * a `title` has that title in place of the kind's name.
 *
 * Footnotes render as on GitHub: each `footnoteReference` becomes a numbered
 * `<sup>` link, and the definitions that are referenced move into a
 * `<section class="footnotes">` at the end, numbered in the order of their first
 * reference, with links back to each reference. Definitions that are never
 * referenced aren't rendered, and a reference without a definition renders as
 * its source text.
 *
 * @example Usage
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { render } from "@ende/markdown/render";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(render(parse("# Hello *world*")), "<h1 id=\"hello-world\">Hello <em>world</em></h1>\n");
 * assertEquals(render(parse("# Hello *world*"), { headingIds: false }), "<h1>Hello <em>world</em></h1>\n");
 * ```
 *
 * @example Rendering a tree built by hand
 * ```ts
 * import { render } from "@ende/markdown/render";
 * import { assertEquals } from "@ende/assert";
 *
 * const html = render({
 *   type: "root",
 *   children: [{ type: "code", lang: "ts", meta: null, value: "let x = 1 < 2;" }]
 * });
 * assertEquals(html, "<pre><code class=\"language-ts\">let x = 1 &lt; 2;\n</code></pre>\n");
 * ```
 *
 * @example Footnotes
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { render } from "@ende/markdown/render";
 * import { assertEquals } from "@ende/assert";
 *
 * const html = render(parse("Hi[^1]\n\n[^1]: A note.", { gfm: true }));
 * assertEquals(
 *   html,
 *   `<p>Hi<sup class="footnote-ref"><a href="#fn-1" id="fnref-1" data-footnote-ref>1</a></sup></p>
 * <section class="footnotes" data-footnotes>
 * <ol>
 * <li id="fn-1">
 * <p>A note. <a href="#fnref-1" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="1" aria-label="Back to reference 1">↩</a></p>
 * </li>
 * </ol>
 * </section>
 * `
 * );
 * ```
 *
 * @example Rewriting links
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { render } from "@ende/markdown/render";
 * import { assertEquals } from "@ende/assert";
 *
 * const html = render(parse("See [the guide](guide.md)."), { rewriteLink: url => url.replace(/\.md$/, "/") });
 * assertEquals(html, "<p>See <a href=\"guide/\">the guide</a>.</p>\n");
 * ```
 *
 * @example Highlighting code
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { render } from "@ende/markdown/render";
 * import { assertEquals } from "@ende/assert";
 *
 * // A real highlighter would escape the code and add markup to it.
 * const highlight = (code: string, lang: string | null) => lang === "ts" ? `<span class="ts">${code.replaceAll("<", "&lt;")}</span>` : undefined;
 * assertEquals(
 *   render(parse("~~~ts\nlet a = 1 < 2;\n~~~"), { highlight }),
 *   "<pre><code class=\"language-ts\"><span class=\"ts\">let a = 1 &lt; 2;</span></code></pre>\n"
 * );
 * ```
 *
 * @example Escaping or stripping raw HTML
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { render } from "@ende/markdown/render";
 * import { assertEquals } from "@ende/assert";
 *
 * const ast = parse("<script>alert(1)</script>\n\nHello <b>you</b>");
 * assertEquals(render(ast, { html: "escape" }), "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>\n<p>Hello &lt;b&gt;you&lt;/b&gt;</p>\n");
 * assertEquals(render(ast, { html: "strip" }), "<p>Hello you</p>\n");
 * ```
 *
 * @example GitHub alerts
 * ```ts
 * import { parse } from "@ende/markdown/parse";
 * import { render } from "@ende/markdown/render";
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals(
 *   render(parse("> [!TIP]\n> Use `ende fmt`.", { gfm: true })),
 *   `<div class="markdown-alert markdown-alert-tip">
 * <p class="markdown-alert-title">Tip</p>
 * <p>Use <code>ende fmt</code>.</p>
 * </div>
 * `
 * );
 * ```
 *
 * @param ast The root of the syntax tree.
 * @param options Options for rendering.
 * @returns The HTML.
 */
export function render(ast: Root, options: RenderOptions = {}): string {
  const renderer = new HtmlRenderer(options, ast);
  renderer.blocks(ast.children, false);
  renderer.footnotes();
  return renderer.buffer;
}

/**
 * A referenced footnote definition: its number, its id, and the id of each
 * reference to it, in order.
 */
interface FootnoteNumber {
  index: number;
  id: string;
  referenceIds: string[];
}

function childrenOf(node: Nodes): readonly Nodes[] {
  return "children" in node ? node.children : [];
}

// Escapes an id for an attribute or a URL fragment, as cmark-gfm escapes
// footnote labels (which, unlike link destinations, also escapes `'`).
function escapeId(id: string): string {
  return escapeXml(id).replaceAll("'", "&#x27;");
}

const ADMONITION_TITLES: Record<Admonition["kind"], string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution"
};

// Whether a paragraph has nothing but raw HTML and whitespace, so that it's
// empty once the HTML is stripped.
function onlyHtml(children: readonly PhrasingContent[]): boolean {
  return children.every(node => node.type === "html" || (node.type === "text" && node.value.trim() === ""));
}

class HtmlRenderer {
  readonly options: RenderOptions;
  buffer = "";
  lastOut = "\n";
  /** The ids written so far, so that none is written twice. */
  readonly #ids = new IdSet();
  /** The id of each heading, unless heading ids are off. */
  readonly #headingIds = new Map<Heading, string>();
  /** The definition and the id of each resolved footnote reference. */
  readonly #references = new Map<FootnoteReference, { definition: FootnoteDefinition; id: string; }>();
  /** The referenced footnote definitions, in the order they're numbered. */
  readonly #numbers = new Map<FootnoteDefinition, FootnoteNumber>();

  constructor(options: RenderOptions, ast: Root) {
    this.options = options;
    if (options.headingIds !== false) {
      this.#claimHeadingIds(ast);
    }
    this.#numberFootnotes(ast);
  }

  // Heading ids come first: they're the ones that links and tables of
  // contents use. `parse()` makes them unique; a hand-built tree can repeat
  // one, and the repeat gets a suffix here.
  #claimHeadingIds(node: Nodes) {
    if (node.type === "heading") {
      if (node.id) {
        this.#headingIds.set(node, this.#ids.unique(node.id));
      }
      return;
    }
    childrenOf(node).forEach(child => this.#claimHeadingIds(child));
  }

  // Numbers footnotes as cmark-gfm does: the first definition of each
  // identifier counts (in the order definitions end), and definitions are
  // numbered in the order of their first reference in the document, including
  // references inside definitions.
  //
  // The ids are cmark-gfm's (`fn-label`, and `fnref-label`, `fnref-label-2`
  // and so on for the references) unless a heading or another footnote
  // already has that id; then the footnote's id gets a suffix, as a repeated
  // heading id does.
  #numberFootnotes(ast: Root) {
    const definitions = new Map<string, FootnoteDefinition>();
    const collect = (node: Nodes) => {
      childrenOf(node).forEach(collect);
      if (node.type === "footnoteDefinition" && !definitions.has(node.identifier)) {
        definitions.set(node.identifier, node);
      }
    };
    collect(ast);
    if (definitions.size === 0) {
      return;
    }
    const resolve = (node: Nodes) => {
      const definition = node.type === "footnoteReference" ? definitions.get(node.identifier) : undefined;
      if (node.type === "footnoteReference" && definition) {
        const label = normalizeUri(definition.label);
        let number = this.#numbers.get(definition);
        if (number === undefined) {
          number = { index: this.#numbers.size + 1, id: this.#ids.unique(`fn-${label}`), referenceIds: [] };
          this.#numbers.set(definition, number);
        }
        const count = number.referenceIds.length + 1;
        const id = this.#ids.unique(count > 1 ? `fnref-${label}-${count}` : `fnref-${label}`);
        number.referenceIds.push(id);
        this.#references.set(node, { definition, id });
      }
      childrenOf(node).forEach(resolve);
    };
    resolve(ast);
  }

  // Concatenate a literal string to the buffer.
  lit(s: string) {
    this.buffer += s;
    this.lastOut = s;
  }

  // Output a newline to the buffer, unless it already ends with one.
  cr() {
    if (this.lastOut !== "\n") {
      this.lit("\n");
    }
  }

  // Concatenate a string to the buffer, escaped.
  out(s: string) {
    this.lit(escapeXml(s));
  }

  tag(name: string, attrs: [string, string][] = [], selfClosing = false) {
    let s = `<${name}`;
    for (const [key, value] of attrs) {
      s += ` ${key}="${value}"`;
    }
    this.lit(`${s}${selfClosing ? " /" : ""}>`);
  }

  // `tight` is true for the children of an item in a tight list, whose
  // paragraphs render without `<p>` tags.
  blocks(children: (BlockContent | DefinitionContent)[], tight: boolean) {
    for (const node of children) {
      this.block(node, tight);
    }
  }

  block(node: BlockContent | DefinitionContent, tight: boolean) {
    switch (node.type) {
      case "paragraph":
        if (this.options.html === "strip" && onlyHtml(node.children)) {
          break;
        }
        if (tight) {
          this.inlines(node.children);
        } else {
          this.cr();
          this.tag("p");
          this.inlines(node.children);
          this.tag("/p");
          this.cr();
        }
        break;
      case "heading": {
        const id = this.#headingIds.get(node);
        this.cr();
        this.tag(`h${node.depth}`, id === undefined ? [] : [["id", escapeId(id)]]);
        this.inlines(node.children);
        this.tag(`/h${node.depth}`);
        this.cr();
        break;
      }
      case "thematicBreak":
        this.cr();
        this.tag("hr", [], true);
        this.cr();
        break;
      case "blockquote":
        this.cr();
        this.tag("blockquote");
        this.cr();
        this.blocks(node.children, false);
        this.cr();
        this.tag("/blockquote");
        this.cr();
        break;
      case "admonition":
        this.cr();
        this.tag("div", [["class", `markdown-alert markdown-alert-${node.kind}`]]);
        this.cr();
        if (node.title) {
          this.lit(`<p class="markdown-alert-title">`);
          this.inlines(node.title);
          this.lit("</p>");
        } else {
          this.lit(`<p class="markdown-alert-title">${ADMONITION_TITLES[node.kind]}</p>`);
        }
        this.cr();
        this.blocks(node.children, false);
        this.cr();
        this.tag("/div");
        this.cr();
        break;
      case "list": {
        const tagName = node.ordered ? "ol" : "ul";
        const attrs: [string, string][] = [];
        if (node.start !== null && node.start !== 1) {
          attrs.push(["start", node.start.toString()]);
        }
        this.cr();
        this.tag(tagName, attrs);
        this.cr();
        for (const item of node.children) {
          this.tag("li");
          if (item.checked !== null) {
            this.lit(`<input type="checkbox"${item.checked ? " checked=\"\"" : ""} disabled="" /> `);
          }
          this.blocks(item.children, !node.spread);
          this.tag("/li");
          this.cr();
        }
        this.cr();
        this.tag(`/${tagName}`);
        this.cr();
        break;
      }
      case "code": {
        const attrs: [string, string][] = [];
        if (node.lang !== null) {
          const cls = escapeXml(node.lang);
          attrs.push(["class", cls.startsWith("language-") ? cls : `language-${cls}`]);
        }
        const highlighted = this.options.highlight?.(node.value, node.lang);
        this.cr();
        this.tag("pre");
        this.tag("code", attrs);
        if (highlighted === undefined) {
          this.out(node.value === "" ? "" : `${node.value}\n`);
        } else {
          this.lit(highlighted);
        }
        this.tag("/code");
        this.tag("/pre");
        this.cr();
        break;
      }
      case "html":
        this.htmlBlock(node, tight);
        break;
      case "table":
        this.table(node);
        break;
      case "footnoteDefinition":
        // Rendered in the footnotes section, if it's referenced.
        break;
    }
  }

  htmlBlock(node: Html, tight: boolean) {
    switch (this.options.html ?? "allow") {
      case "allow":
        this.cr();
        this.lit(node.value);
        this.cr();
        break;
      case "escape":
        // Shown as a paragraph of text.
        if (tight) {
          this.out(node.value);
        } else {
          this.cr();
          this.tag("p");
          this.out(node.value);
          this.tag("/p");
          this.cr();
        }
        break;
      case "strip":
        break;
    }
  }

  table(node: Table) {
    this.cr();
    this.tag("table");
    node.children.forEach((row, rowIndex) => {
      this.cr();
      if (rowIndex === 0) {
        this.tag("thead");
        this.cr();
      } else if (rowIndex === 1) {
        this.tag("tbody");
        this.cr();
      }
      this.tag("tr");
      const cellTag = rowIndex === 0 ? "th" : "td";
      row.children.forEach((cell, cellIndex) => {
        const align = node.align[cellIndex];
        this.cr();
        this.tag(cellTag, align ? [["align", align]] : []);
        this.inlines(cell.children);
        this.tag(`/${cellTag}`);
      });
      this.cr();
      this.tag("/tr");
      if (rowIndex === 0) {
        this.cr();
        this.tag("/thead");
      }
    });
    if (node.children.length > 1) {
      this.cr();
      this.tag("/tbody");
      this.cr();
    }
    this.cr();
    this.tag("/table");
    this.cr();
  }

  // Writes the section of referenced footnote definitions.
  footnotes() {
    if (this.#numbers.size === 0) {
      return;
    }
    this.cr();
    this.lit("<section class=\"footnotes\" data-footnotes>\n<ol>\n");
    for (const [definition, number] of this.#numbers) {
      const backrefs = this.#backrefs(number);
      this.lit(`<li id="${escapeId(number.id)}">`);
      this.cr();
      const last = definition.children.at(-1);
      this.blocks(definition.children.slice(0, -1), false);
      if (last?.type === "paragraph") {
        // The links back go at the end of a final paragraph.
        this.cr();
        this.tag("p");
        this.inlines(last.children);
        this.lit(` ${backrefs}`);
        this.tag("/p");
        this.cr();
      } else {
        if (last) {
          this.block(last, false);
        }
        this.lit(`${backrefs}\n`);
      }
      this.lit("</li>\n");
    }
    this.lit("</ol>\n</section>\n");
  }

  #backrefs({ index, referenceIds }: FootnoteNumber): string {
    return referenceIds
      .map((id, i) => {
        const href = `#${escapeId(id)}`;
        return i === 0 ?
          `<a href="${href}" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="${index}" aria-label="Back to reference ${index}">↩</a>` :
          `<a href="${href}" class="footnote-backref" data-footnote-backref data-footnote-backref-idx="${index}-${i + 1}" ` +
          `aria-label="Back to reference ${index}-${i + 1}">↩<sup class="footnote-ref">${i + 1}</sup></a>`;
      })
      .join(" ");
  }

  inlines(children: PhrasingContent[]) {
    for (const node of children) {
      this.inline(node);
    }
  }

  inline(node: PhrasingContent) {
    switch (node.type) {
      case "text":
        this.out(node.value);
        break;
      case "break":
        this.tag("br", [], true);
        this.cr();
        break;
      case "emphasis":
        this.tag("em");
        this.inlines(node.children);
        this.tag("/em");
        break;
      case "strong":
        this.tag("strong");
        this.inlines(node.children);
        this.tag("/strong");
        break;
      case "delete":
        this.tag("del");
        this.inlines(node.children);
        this.tag("/del");
        break;
      case "footnoteReference": {
        const reference = this.#references.get(node);
        if (reference === undefined) {
          this.out(`[^${node.label}]`);
          break;
        }
        const number = this.#numbers.get(reference.definition)!;
        this.lit(
          `<sup class="footnote-ref"><a href="#${escapeId(number.id)}" id="${escapeId(reference.id)}" data-footnote-ref>${number.index}</a></sup>`
        );
        break;
      }
      case "inlineCode":
        this.tag("code");
        this.out(node.value);
        this.tag("/code");
        break;
      case "html":
        if (this.options.html === "escape") {
          this.out(node.value);
        } else if (this.options.html !== "strip") {
          this.lit(node.value);
        }
        break;
      case "link": {
        const url = this.options.rewriteLink?.(node.url, node) ?? node.url;
        const attrs: [string, string][] = [["href", escapeXml(url)]];
        if (node.title) {
          attrs.push(["title", escapeXml(node.title)]);
        }
        this.tag("a", attrs);
        this.inlines(node.children);
        this.tag("/a");
        break;
      }
      case "image": {
        const url = this.options.rewriteLink?.(node.url, node) ?? node.url;
        const title = node.title ? `" title="${escapeXml(node.title)}` : "";
        this.lit(`<img src="${escapeXml(url)}" alt="${escapeXml(node.alt)}${title}" />`);
        break;
      }
    }
  }
}
