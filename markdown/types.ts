// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

/**
 * Types for the Markdown syntax tree. The node names and fields follow
 * {@link https://github.com/syntax-tree/mdast | mdast}, including its GitHub
 * Flavored Markdown nodes (tables, `delete` and footnotes), with these
 * differences: link reference definitions are resolved into the {@linkcode Link}
 * and {@linkcode Image} nodes that use them (so there are no `definition`,
 * `linkReference` or `imageReference` nodes), nodes have no `position`, a
 * {@linkcode Heading} has an `id`, and GitHub alerts are {@linkcode Admonition}
 * nodes.
 *
 * ```ts
 * import type { Heading, Root } from "@ende/markdown/types";
 * import { parse } from "@ende/markdown/parse";
 * import { assertEquals } from "@ende/assert";
 *
 * const root: Root = parse("# Hi");
 * const heading = root.children[0] as Heading;
 * assertEquals(heading.depth, 1);
 * ```
 *
 * @module
 */

/**
 * Plain text.
 *
 * @example Usage
 * ```ts
 * import type { Text } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Text = { type: "text", value: "Hello" };
 * assertEquals(node.value, "Hello");
 * ```
 */
export interface Text {
  /** Node type. */
  type: "text";
  /** The text, with entities and backslash escapes decoded. */
  value: string;
}

/**
 * Emphasis, such as `*this*`.
 *
 * @example Usage
 * ```ts
 * import type { Emphasis } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Emphasis = { type: "emphasis", children: [{ type: "text", value: "this" }] };
 * assertEquals(node.children.length, 1);
 * ```
 */
export interface Emphasis {
  /** Node type. */
  type: "emphasis";
  /** The emphasized content. */
  children: PhrasingContent[];
}

/**
 * Strong emphasis, such as `**this**`.
 *
 * @example Usage
 * ```ts
 * import type { Strong } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Strong = { type: "strong", children: [{ type: "text", value: "this" }] };
 * assertEquals(node.children.length, 1);
 * ```
 */
export interface Strong {
  /** Node type. */
  type: "strong";
  /** The strongly emphasized content. */
  children: PhrasingContent[];
}

/**
 * A code span, such as `` `code` ``.
 *
 * @example Usage
 * ```ts
 * import type { InlineCode } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: InlineCode = { type: "inlineCode", value: "x = 1" };
 * assertEquals(node.value, "x = 1");
 * ```
 */
export interface InlineCode {
  /** Node type. */
  type: "inlineCode";
  /** The code, without the backticks. */
  value: string;
}

/**
 * A hard line break: two or more spaces, or a backslash, before a newline.
 *
 * @example Usage
 * ```ts
 * import type { Break } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Break = { type: "break" };
 * assertEquals(node.type, "break");
 * ```
 */
export interface Break {
  /** Node type. */
  type: "break";
}

/**
 * A link. Inline links, autolinks, and reference links all become this node;
 * a reference link carries the URL and title of its definition.
 *
 * @example Usage
 * ```ts
 * import type { Link } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Link = {
 *   type: "link",
 *   url: "https://ende.sh",
 *   title: null,
 *   children: [{ type: "text", value: "Ende" }]
 * };
 * assertEquals(node.url, "https://ende.sh");
 * ```
 */
export interface Link {
  /** Node type. */
  type: "link";
  /** The destination, percent-encoded where needed. */
  url: string;
  /** The title, or `null` if there is none. */
  title: string | null;
  /** The link text. */
  children: PhrasingContent[];
}

/**
 * An image. Like {@linkcode Link}, reference images are resolved.
 *
 * @example Usage
 * ```ts
 * import type { Image } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Image = { type: "image", url: "logo.png", title: null, alt: "Logo" };
 * assertEquals(node.alt, "Logo");
 * ```
 */
export interface Image {
  /** Node type. */
  type: "image";
  /** The image source, percent-encoded where needed. */
  url: string;
  /** The title, or `null` if there is none. */
  title: string | null;
  /** The image description as plain text. */
  alt: string;
}

/**
 * Raw HTML. As a child of a block container it's an HTML block; inside a
 * paragraph or other phrasing content it's inline HTML.
 *
 * @example Usage
 * ```ts
 * import type { Html } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Html = { type: "html", value: "<br>" };
 * assertEquals(node.value, "<br>");
 * ```
 */
export interface Html {
  /** Node type. */
  type: "html";
  /** The HTML source, unchanged. */
  value: string;
}

/**
 * Strikethrough text, such as `~~this~~`. Only parsed with the `gfm` option.
 *
 * @example Usage
 * ```ts
 * import type { Delete } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Delete = { type: "delete", children: [{ type: "text", value: "this" }] };
 * assertEquals(node.children.length, 1);
 * ```
 */
export interface Delete {
  /** Node type. */
  type: "delete";
  /** The struck-through content. */
  children: PhrasingContent[];
}

/**
 * A reference to a footnote, such as `[^1]`. Only parsed with the `gfm`
 * option, and only when a {@linkcode FootnoteDefinition} with the same
 * identifier exists; otherwise the text stays as it is.
 *
 * @example Usage
 * ```ts
 * import type { FootnoteReference } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: FootnoteReference = { type: "footnoteReference", identifier: "note", label: "Note" };
 * assertEquals(node.identifier, "note");
 * ```
 */
export interface FootnoteReference {
  /** Node type. */
  type: "footnoteReference";
  /**
   * The normalized label (case-folded, with whitespace collapsed), which
   * matches the `identifier` of its {@linkcode FootnoteDefinition}.
   */
  identifier: string;
  /** The label as written in the source, without `[^` and `]`. */
  label: string;
}

/**
 * A paragraph.
 *
 * @example Usage
 * ```ts
 * import type { Paragraph } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Paragraph = { type: "paragraph", children: [{ type: "text", value: "Hi" }] };
 * assertEquals(node.children.length, 1);
 * ```
 */
export interface Paragraph {
  /** Node type. */
  type: "paragraph";
  /** The paragraph content. */
  children: PhrasingContent[];
}

/**
 * An ATX (`# Title`) or setext (`Title` underlined with `=` or `-`) heading.
 *
 * @example Usage
 * ```ts
 * import type { Heading } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Heading = { type: "heading", depth: 2, id: "usage", children: [{ type: "text", value: "Usage" }] };
 * assertEquals(node.depth, 2);
 * ```
 */
export interface Heading {
  /** Node type. */
  type: "heading";
  /** The heading level, from 1 to 6. */
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * The heading's id, for links such as `#install`. `parse()` makes it from
   * the heading's plain text with {@linkcode ParseOptions.slugger} (GitHub's
   * algorithm by default), unique within the document: the second `Install`
   * heading gets `install-1`, the third `install-2`. It can be empty when the
   * text has no characters the slugger keeps.
   */
  id: string;
  /** The heading content. */
  children: PhrasingContent[];
}

/**
 * A thematic break, such as `***` or `---`.
 *
 * @example Usage
 * ```ts
 * import type { ThematicBreak } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: ThematicBreak = { type: "thematicBreak" };
 * assertEquals(node.type, "thematicBreak");
 * ```
 */
export interface ThematicBreak {
  /** Node type. */
  type: "thematicBreak";
}

/**
 * A block quote.
 *
 * @example Usage
 * ```ts
 * import type { Blockquote } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Blockquote = { type: "blockquote", children: [] };
 * assertEquals(node.children, []);
 * ```
 */
export interface Blockquote {
  /** Node type. */
  type: "blockquote";
  /** The quoted blocks. */
  children: (BlockContent | DefinitionContent)[];
}

/**
 * A GitHub alert, such as `> [!NOTE]`. Only parsed with the `gfm` option,
 * from a block quote at the top level of the document whose first line is
 * just the marker (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or
 * `[!CAUTION]`, in any case) and that has content after it. The marker line
 * isn't part of the children.
 *
 * @example Usage
 * ```ts
 * import type { Admonition } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * // > [!WARNING]
 * // > Back up first.
 * const node: Admonition = {
 *   type: "admonition",
 *   kind: "warning",
 *   children: [{ type: "paragraph", children: [{ type: "text", value: "Back up first." }] }]
 * };
 * assertEquals(node.kind, "warning");
 * ```
 */
export interface Admonition {
  /** Node type. */
  type: "admonition";
  /** The kind of alert, from the marker, lowercased. */
  kind: "note" | "tip" | "important" | "warning" | "caution";
  /** The blocks after the marker line. */
  children: (BlockContent | DefinitionContent)[];
}

/**
 * A bullet or ordered list.
 *
 * @example Usage
 * ```ts
 * import type { List } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: List = { type: "list", ordered: true, start: 3, spread: false, children: [] };
 * assertEquals(node.start, 3);
 * ```
 */
export interface List {
  /** Node type. */
  type: "list";
  /** Whether the list is ordered (`1.`) rather than bulleted (`-`). */
  ordered: boolean;
  /** The number of the first item of an ordered list, or `null` for a bullet list. */
  start: number | null;
  /**
   * Whether the list is loose: blank lines separate its items, or the blocks
   * inside any item. The items of a loose list render inside `<p>` tags.
   */
  spread: boolean;
  /** The list items. */
  children: ListItem[];
}

/**
 * A list item.
 *
 * @example Usage
 * ```ts
 * import type { ListItem } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: ListItem = { type: "listItem", spread: false, checked: null, children: [] };
 * assertEquals(node.checked, null);
 * ```
 *
 * @example A task list item
 * ```ts
 * import type { ListItem } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * // `- [x] Done` with the `gfm` option:
 * const node: ListItem = {
 *   type: "listItem",
 *   spread: false,
 *   checked: true,
 *   children: [{ type: "paragraph", children: [{ type: "text", value: "Done" }] }]
 * };
 * assertEquals(node.checked, true);
 * ```
 */
export interface ListItem {
  /** Node type. */
  type: "listItem";
  /** Whether a blank line separates any of the item's direct children. */
  spread: boolean;
  /**
   * Whether a task list item is checked (`[x]`) or not (`[ ]`), or `null` if
   * the item isn't a task. Only the `gfm` option parses task list items; the
   * marker is removed from the item's first paragraph.
   */
  checked: boolean | null;
  /** The blocks in the item. */
  children: (BlockContent | DefinitionContent)[];
}

/**
 * The alignment of a table column: `:--` is `"left"`, `--:` is `"right"`,
 * `:-:` is `"center"`, and `---` is `null`.
 *
 * @example Usage
 * ```ts
 * import type { AlignType } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const align: AlignType[] = ["left", null, "right"];
 * assertEquals(align.length, 3);
 * ```
 */
export type AlignType = "left" | "right" | "center" | null;

/**
 * A table. Only parsed with the `gfm` option. The first row is the header
 * row, and every row has one cell per column.
 *
 * @example Usage
 * ```ts
 * import type { Table } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * // | a |
 * // | -: |
 * const node: Table = {
 *   type: "table",
 *   align: ["right"],
 *   children: [{ type: "tableRow", children: [{ type: "tableCell", children: [{ type: "text", value: "a" }] }] }]
 * };
 * assertEquals(node.align, ["right"]);
 * ```
 */
export interface Table {
  /** Node type. */
  type: "table";
  /** The alignment of each column, from the delimiter row. */
  align: AlignType[];
  /** The rows, starting with the header row. */
  children: TableRow[];
}

/**
 * A row of a {@linkcode Table}.
 *
 * @example Usage
 * ```ts
 * import type { TableRow } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: TableRow = { type: "tableRow", children: [{ type: "tableCell", children: [] }] };
 * assertEquals(node.children.length, 1);
 * ```
 */
export interface TableRow {
  /** Node type. */
  type: "tableRow";
  /** The cells. */
  children: TableCell[];
}

/**
 * A cell of a {@linkcode TableRow}.
 *
 * @example Usage
 * ```ts
 * import type { TableCell } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: TableCell = { type: "tableCell", children: [{ type: "text", value: "a" }] };
 * assertEquals(node.children.length, 1);
 * ```
 */
export interface TableCell {
  /** Node type. */
  type: "tableCell";
  /** The cell content. */
  children: PhrasingContent[];
}

/**
 * A footnote definition, such as `[^1]: The note.`. Only parsed with the `gfm`
 * option. The definition stays where it was written; `render()` moves the
 * definitions that are referenced into a footnotes section at the end.
 *
 * @example Usage
 * ```ts
 * import type { FootnoteDefinition } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: FootnoteDefinition = {
 *   type: "footnoteDefinition",
 *   identifier: "1",
 *   label: "1",
 *   children: [{ type: "paragraph", children: [{ type: "text", value: "The note." }] }]
 * };
 * assertEquals(node.label, "1");
 * ```
 */
export interface FootnoteDefinition {
  /** Node type. */
  type: "footnoteDefinition";
  /** The normalized label (case-folded, with whitespace collapsed). */
  identifier: string;
  /** The label as written in the source, without `[^` and `]:`. */
  label: string;
  /** The blocks in the definition. */
  children: (BlockContent | DefinitionContent)[];
}

/**
 * A fenced or indented code block.
 *
 * @example Usage
 * ```ts
 * import type { Code } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Code = { type: "code", lang: "ts", meta: null, value: "const x = 1;" };
 * assertEquals(node.lang, "ts");
 * ```
 */
export interface Code {
  /** Node type. */
  type: "code";
  /** The first word of the info string, or `null` if there is none. */
  lang: string | null;
  /** The rest of the info string after the first word, or `null` if there is none. */
  meta: string | null;
  /** The code, without the final line ending. */
  value: string;
}

/**
 * The root of a document.
 *
 * @example Usage
 * ```ts
 * import type { Root } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const root: Root = { type: "root", children: [{ type: "thematicBreak" }] };
 * assertEquals(root.children.length, 1);
 * ```
 */
export interface Root {
  /** Node type. */
  type: "root";
  /** The top-level blocks. */
  children: (BlockContent | DefinitionContent)[];
}

/**
 * Nodes that can appear in a block container ({@linkcode Root},
 * {@linkcode Blockquote}, {@linkcode ListItem} or {@linkcode FootnoteDefinition}).
 *
 * @example Usage
 * ```ts
 * import type { BlockContent } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: BlockContent = { type: "html", value: "<div>" };
 * assertEquals(node.type, "html");
 * ```
 */
export type BlockContent =
  | Paragraph
  | Heading
  | ThematicBreak
  | Blockquote
  | List
  | Code
  | Html
  | Table
  | Admonition;

/**
 * Definitions, which can appear in a block container next to
 * {@linkcode BlockContent}. Link reference definitions are resolved while
 * parsing, so the only definition in the tree is {@linkcode FootnoteDefinition}.
 *
 * @example Usage
 * ```ts
 * import type { DefinitionContent } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: DefinitionContent = { type: "footnoteDefinition", identifier: "a", label: "a", children: [] };
 * assertEquals(node.type, "footnoteDefinition");
 * ```
 */
export type DefinitionContent = FootnoteDefinition;

/**
 * Nodes that can appear in paragraphs, headings and other inline content.
 *
 * @example Usage
 * ```ts
 * import type { PhrasingContent } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: PhrasingContent = { type: "text", value: "Hi" };
 * assertEquals(node.type, "text");
 * ```
 */
export type PhrasingContent =
  | Text
  | Emphasis
  | Strong
  | InlineCode
  | Break
  | Link
  | Image
  | Html
  | Delete
  | FootnoteReference;

/**
 * Any node, as a union discriminated by `type`.
 *
 * @example Usage
 * ```ts
 * import type { Nodes } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * function textOf(node: Nodes): string {
 *   if ("value" in node) return node.value;
 *   if ("children" in node) return node.children.map(textOf).join("");
 *   return "";
 * }
 *
 * assertEquals(textOf({ type: "strong", children: [{ type: "text", value: "Hi" }] }), "Hi");
 * ```
 */
export type Nodes = Root | BlockContent | DefinitionContent | ListItem | TableRow | TableCell | PhrasingContent;

/**
 * Nodes that have children.
 *
 * @example Usage
 * ```ts
 * import type { Parent } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Parent = { type: "paragraph", children: [] };
 * assertEquals(node.children.length, 0);
 * ```
 */
export type Parent = Extract<Nodes, { children: unknown; }>;

/**
 * Nodes that have a string `value`.
 *
 * @example Usage
 * ```ts
 * import type { Literal } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const node: Literal = { type: "inlineCode", value: "x" };
 * assertEquals(node.value, "x");
 * ```
 */
export type Literal = Extract<Nodes, { value: string; }>;

/**
 * Options for `parse()`.
 *
 * @example Usage
 * ```ts
 * import type { ParseOptions } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const options: ParseOptions = { gfm: true };
 * assertEquals(options.gfm, true);
 * ```
 */
export interface ParseOptions {
  /**
   * Enable the {@link https://github.github.com/gfm/ | GitHub Flavored Markdown}
   * extensions: tables, task list items, strikethrough, extended autolinks
   * (`www.`, `http://`, `https://`, `ftp://` and email addresses), and
   * footnotes, plus GitHub's alerts (`> [!NOTE]`), which become
   * {@linkcode Admonition} nodes. The Disallowed Raw HTML (tagfilter)
   * extension isn't included. Without it, parsing follows CommonMark exactly.
   *
   * @default {false}
   */
  gfm?: boolean;
  /**
   * Makes a heading id from the heading's plain text: its text and code, and
   * the alt text of its images, without footnote references or raw HTML tags.
   * Ids are made unique afterwards, whatever the slugger returns: a repeated
   * id gets `-1`, `-2` and so on, as {@linkcode Heading.id} describes.
   *
   * @default {slug}
   */
  slugger?: (text: string) => string;
}

/**
 * Options for `render()`.
 *
 * @example Usage
 * ```ts
 * import type { RenderOptions } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const options: RenderOptions = { headingIds: false, html: "escape" };
 * assertEquals(options.html, "escape");
 * ```
 */
export interface RenderOptions {
  /**
   * Write each heading's {@linkcode Heading.id} as its `id` attribute. Turn
   * it off for output that matches the CommonMark spec exactly.
   *
   * @default {true}
   */
  headingIds?: boolean;
  /**
   * Changes the URL of every link and image, including autolinks, but not
   * the links between footnote references and footnotes. The result is
   * escaped for the attribute.
   */
  rewriteLink?: (url: string, node: Link | Image) => string;
  /**
   * Highlights the code of a code block. It gets the code without its final
   * line ending, and the block's language (`null` if it has none). A string
   * is inserted as it is, so it must be HTML with the code escaped, inside
   * `<pre><code class="language-…">`; `undefined` renders the code as usual.
   */
  highlight?: (code: string, lang: string | null) => string | undefined;
  /**
   * What to do with raw HTML, both HTML blocks and inline HTML:
   *
   * - `"allow"` writes it as it is, as the CommonMark spec does.
   * - `"escape"` writes it as text, so the markup shows. An HTML block
   *   becomes a paragraph of that text (without `<p>` tags in a tight list,
   *   like other paragraphs).
   * - `"strip"` leaves it out. A paragraph with nothing left but whitespace
   *   is left out too; other containers, such as list items and block quotes,
   *   stay.
   *
   * `"escape"` and `"strip"` only cover raw HTML; they don't sanitize link
   * URLs such as `javascript:` ones.
   *
   * @default {"allow"}
   */
  html?: "allow" | "escape" | "strip";
}

/**
 * Options for `toc()`.
 *
 * @example Usage
 * ```ts
 * import type { TocOptions } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const options: TocOptions = { minDepth: 2, maxDepth: 3 };
 * assertEquals(options.maxDepth, 3);
 * ```
 */
export interface TocOptions {
  /**
   * The shallowest heading level to include.
   *
   * @default {1}
   */
  minDepth?: number;
  /**
   * The deepest heading level to include.
   *
   * @default {6}
   */
  maxDepth?: number;
}

/**
 * A heading in the list `toc()` returns.
 *
 * @example Usage
 * ```ts
 * import type { TocEntry } from "@ende/markdown/types";
 * import { assertEquals } from "@ende/assert";
 *
 * const entry: TocEntry = { depth: 2, text: "Install", slug: "install" };
 * assertEquals(`<a href="#${entry.slug}">${entry.text}</a>`, "<a href=\"#install\">Install</a>");
 * ```
 */
export interface TocEntry {
  /** The heading level, from 1 to 6. */
  depth: Heading["depth"];
  /** The heading's plain text, as the slugger got it. Escape it for HTML. */
  text: string;
  /** The heading's {@linkcode Heading.id}. */
  slug: string;
}
