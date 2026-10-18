// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
//
// Ported from commonmark.js 0.31.2 (lib/blocks.js). The GFM block extensions
// (tables, task list items and footnote definitions) follow cmark-gfm, which
// has the same copyright and license.
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

import { CLOSETAG, OPENTAG, unescapeString } from "./_common.ts";
import { parseTableRow, reFootnoteDefinition, reTableDelimiterRow, reTaskListMarker, tableAlign } from "./_gfm.ts";
import { InlineParser, normalizeReference, type RefMap } from "./_inline_parser.ts";
import { Node, type BlockType, type ListData } from "./_node.ts";
import type { ParseOptions } from "./types.ts";

const CODE_INDENT = 4;

const C_TAB = 9;
const C_NEWLINE = 10;
const C_GREATERTHAN = 62;
const C_LESSTHAN = 60;
const C_SPACE = 32;
const C_OPEN_BRACKET = 91;

const reHtmlBlockOpen = [
  /./, // dummy for 0
  /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
  /^<!--/,
  /^<[?]/,
  /^<![A-Za-z]/,
  /^<!\[CDATA\[/,
  /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
  new RegExp(`^(?:${OPENTAG}|${CLOSETAG})\\s*$`, "i")
] as const;

const reHtmlBlockClose = [
  /./, // dummy for 0
  /<\/(?:script|pre|textarea|style)>/i,
  /-->/,
  /\?>/,
  />/,
  /\]\]>/
] as const;

const reThematicBreak = /^(?:\*[ \t]*){3,}$|^(?:_[ \t]*){3,}$|^(?:-[ \t]*){3,}$/;
const reMaybeSpecial = /^[#`~*+_=<>0-9-]/;
// Characters that can also start a block with the gfm option: a table
// delimiter row or a footnote definition.
const reMaybeSpecialGfm = /^[|:[]/;
const reNonSpace = /[^ \t\f\v\r\n]/;
const reBulletListMarker = /^[*+-]/;
const reOrderedListMarker = /^(\d{1,9})([.)])/;
const reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;
const reCodeFence = /^`{3,}(?!.*`)|^~{3,}/;
const reClosingCodeFence = /^(?:`{3,}|~{3,})(?=[ \t]*$)/;
const reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;
const reLineEnding = /\r\n|\n|\r/;

/**
 * How a block start matched: not at all, as a container (keep looking for
 * more block starts), or as a leaf (no more block starts on this line).
 */
type Start = "none" | "container" | "leaf";

/**
 * Whether a block continues on the current line. `"done"` means the block
 * consumed the whole line (a closing code fence).
 */
type Continue = "matched" | "unmatched" | "done";

/** How the parser treats one block type. */
interface BlockSpec {
  continue(parser: BlockParser, container: Node): Continue;
  finalize(parser: BlockParser, block: Node): void;
  canContain(type: BlockType): boolean;
  acceptsLines: boolean;
}

/** Tries to start a block at the current position of the line. */
type BlockStart = (parser: BlockParser, container: Node) => Start;

// Returns true if string contains only space characters.
function isBlank(s: string): boolean {
  return !reNonSpace.test(s);
}

function isSpaceOrTab(c: number): boolean {
  return c === C_SPACE || c === C_TAB;
}

function peek(ln: string, pos: number): number {
  return pos < ln.length ? ln.charCodeAt(pos) : -1;
}

// Returns true if block ends with a blank line.
function endsWithBlankLine(block: Node): boolean {
  return block.next !== null && block.endLine !== block.next.startLine - 1;
}

// Parse a list marker and return data on the marker (type,
// start, delimiter, bullet character, padding) or null.
function parseListMarker(parser: BlockParser, container: Node): ListData | null {
  const rest = parser.currentLine.slice(parser.nextNonspace);
  if (parser.indent >= 4) {
    return null;
  }
  let match: RegExpMatchArray | null;
  let data: ListData;
  if ((match = rest.match(reBulletListMarker))) {
    data = {
      type: "bullet",
      tight: true, // lists are tight by default
      bulletChar: match[0],
      start: null,
      delimiter: null,
      padding: 0,
      markerOffset: parser.indent
    };
  } else if (
    (match = rest.match(reOrderedListMarker)) &&
    (container.type !== "paragraph" || parseInt(match[1]!) === 1)
  ) {
    data = {
      type: "ordered",
      tight: true,
      bulletChar: null,
      start: parseInt(match[1]!),
      delimiter: match[2]!,
      padding: 0,
      markerOffset: parser.indent
    };
  } else {
    return null;
  }
  const markerLength = match[0].length;
  // make sure we have spaces after
  let nextc = peek(parser.currentLine, parser.nextNonspace + markerLength);
  if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
    return null;
  }

  // if it interrupts paragraph, make sure first line isn't blank
  if (
    container.type === "paragraph" &&
    !reNonSpace.test(parser.currentLine.slice(parser.nextNonspace + markerLength))
  ) {
    return null;
  }

  // we've got a match! advance offset and calculate padding
  parser.advanceNextNonspace(); // to start of marker
  parser.advanceOffset(markerLength, true); // to end of marker
  const spacesStartCol = parser.column;
  const spacesStartOffset = parser.offset;
  do {
    parser.advanceOffset(1, true);
    nextc = peek(parser.currentLine, parser.offset);
  } while (parser.column - spacesStartCol < 5 && isSpaceOrTab(nextc));
  const blankItem = peek(parser.currentLine, parser.offset) === -1;
  const spacesAfterMarker = parser.column - spacesStartCol;
  if (spacesAfterMarker >= 5 || spacesAfterMarker < 1 || blankItem) {
    data.padding = markerLength + 1;
    parser.column = spacesStartCol;
    parser.offset = spacesStartOffset;
    if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
      parser.advanceOffset(1, true);
    }
  } else {
    data.padding = markerLength + spacesAfterMarker;
  }
  return data;
}

// Returns true if the two list items are of the same type,
// with the same delimiter and bullet character. This is used
// in agglomerating list items into lists.
function listsMatch(listData: ListData, itemData: ListData): boolean {
  return listData.type === itemData.type &&
    listData.delimiter === itemData.delimiter &&
    listData.bulletChar === itemData.bulletChar;
}

// Parses link reference definitions at the start of a paragraph into the
// refmap, removing them from the paragraph's content. Returns the number of
// lines removed.
function parseReferences(parser: BlockParser, block: Node): number {
  let removedLines = 0;
  let pos: number;
  while (
    peek(block.stringContent, 0) === C_OPEN_BRACKET &&
    (pos = parser.inlineParser.parseReference(block.stringContent, parser.refmap))
  ) {
    removedLines += block.stringContent.slice(0, pos).split("\n").length - 1;
    block.stringContent = block.stringContent.slice(pos);
  }
  return removedLines;
}

// Remove link reference definitions from given tree.
function removeLinkReferenceDefinitions(parser: BlockParser, tree: Node) {
  const emptyNodes: Node[] = [];
  function visit(node: Node) {
    if (node.type === "paragraph") {
      // Link reference definitions can only be at the beginning of a paragraph,
      // since they can't interrupt paragraphs.
      const removedLines = parseReferences(parser, node);
      node.startLine += removedLines;
      if (removedLines > 0 && isBlank(node.stringContent)) {
        emptyNodes.push(node);
      }
    }
    for (let child = node.firstChild; child; child = child.next) {
      visit(child);
    }
  }
  visit(tree);
  for (const node of emptyNodes) {
    node.unlink();
  }
}

// The first line of a GitHub alert (gfm): the marker, then optionally a space
// and a title (an extension; GitHub wants the marker alone on the line).
const reAlertMarker = /^\[!(note|tip|important|warning|caution)\](?:[ \t]+([^\n]*))?(?:\n|$)/i;

// Marks the block quotes that are GitHub alerts, removing the marker line.
// As on GitHub, only a block quote at the top level of the document is an
// alert, and only when its first block is a paragraph whose first line is the
// marker, and something follows the marker line. The rest of the marker line,
// if any, is the alert's title, parsed as inline content with the paragraphs.
// This runs on the raw text of the paragraph, before inline parsing, so an
// escaped marker (`\[!NOTE]`) isn't one.
function markAlerts(doc: Node) {
  for (let block = doc.firstChild; block; block = block.next) {
    const paragraph = block.firstChild;
    if (block.type !== "blockquote" || paragraph?.type !== "paragraph") {
      continue;
    }
    const match = reAlertMarker.exec(paragraph.stringContent);
    if (!match) {
      continue;
    }
    const rest = paragraph.stringContent.slice(match[0].length);
    if (isBlank(rest) && paragraph.next === null) {
      continue;
    }
    block.alert = match[1]!.toLowerCase() as Node["alert"];
    const title = match[2]?.trim() ?? "";
    if (title !== "") {
      block.alertTitle = new Node("paragraph");
      block.alertTitle.stringContent = title;
    }
    if (isBlank(rest)) {
      paragraph.unlink();
    } else {
      paragraph.stringContent = rest;
    }
  }
}

// 'finalize' is run when the block is closed.
// 'continue' is run to check whether the block is continuing
// at a certain line and offset (e.g. whether a block quote
// contains a `>`.
const blocks: Record<BlockType, BlockSpec> = {
  root: {
    continue: () => "matched",
    finalize: (parser, block) => removeLinkReferenceDefinitions(parser, block),
    canContain: t => t !== "listItem",
    acceptsLines: false
  },
  list: {
    continue: () => "matched",
    finalize(_parser, block) {
      const listData = block.listData!;
      for (let item = block.firstChild; item; item = item.next) {
        // check for non-final list item ending with blank line:
        if (endsWithBlankLine(item)) {
          listData.tight = false;
        }
        // recurse into children of list item, to see if there are
        // spaces between any of them:
        for (let subitem = item.firstChild; subitem; subitem = subitem.next) {
          if (endsWithBlankLine(subitem)) {
            item.spread = true;
            listData.tight = false;
          }
        }
      }
      block.endLine = block.lastChild!.endLine;
    },
    canContain: t => t === "listItem",
    acceptsLines: false
  },
  blockquote: {
    continue(parser) {
      const ln = parser.currentLine;
      if (!parser.indented && peek(ln, parser.nextNonspace) === C_GREATERTHAN) {
        parser.advanceNextNonspace();
        parser.advanceOffset(1, false);
        if (isSpaceOrTab(peek(ln, parser.offset))) {
          parser.advanceOffset(1, true);
        }
        return "matched";
      }
      return "unmatched";
    },
    finalize() {},
    canContain: t => t !== "listItem",
    acceptsLines: false
  },
  listItem: {
    continue(parser, container) {
      const listData = container.listData!;
      if (parser.blank) {
        if (container.firstChild === null) {
          // Blank line after empty list item
          return "unmatched";
        }
        parser.advanceNextNonspace();
      } else if (parser.indent >= listData.markerOffset + listData.padding) {
        parser.advanceOffset(listData.markerOffset + listData.padding, true);
      } else {
        return "unmatched";
      }
      return "matched";
    },
    finalize(_parser, block) {
      block.endLine = block.lastChild ? block.lastChild.endLine : block.startLine;
    },
    canContain: t => t !== "listItem",
    acceptsLines: false
  },
  heading: {
    // a heading can never contain > 1 line, so fail to match:
    continue: () => "unmatched",
    finalize() {},
    canContain: () => false,
    acceptsLines: false
  },
  thematicBreak: {
    // a thematic break can never contain > 1 line, so fail to match:
    continue: () => "unmatched",
    finalize() {},
    canContain: () => false,
    acceptsLines: false
  },
  code: {
    continue(parser, container) {
      const ln = parser.currentLine;
      const indent = parser.indent;
      if (container.isFenced) {
        const match = indent <= 3 &&
          ln.charAt(parser.nextNonspace) === container.fenceChar &&
          ln.slice(parser.nextNonspace).match(reClosingCodeFence);
        if (match && match[0].length >= container.fenceLength) {
          // closing fence - we're at end of line, so we can return
          parser.finalize(container, parser.lineNumber);
          return "done";
        }
        // skip optional spaces of fence offset
        let i = container.fenceOffset;
        while (i > 0 && isSpaceOrTab(peek(ln, parser.offset))) {
          parser.advanceOffset(1, true);
          i--;
        }
      } else if (indent >= CODE_INDENT) {
        parser.advanceOffset(CODE_INDENT, true);
      } else if (parser.blank) {
        parser.advanceNextNonspace();
      } else {
        return "unmatched";
      }
      return "matched";
    },
    finalize(_parser, block) {
      if (block.isFenced) {
        // first line becomes info string
        const content = block.stringContent;
        const newlinePos = content.indexOf("\n");
        block.info = unescapeString(content.slice(0, newlinePos).trim());
        block.literal = content.slice(newlinePos + 1);
      } else {
        const lines = block.stringContent.split("\n");
        // Note that indented code block cannot be empty, so
        // lines.length cannot be zero.
        while (/^[ \t]*$/.test(lines[lines.length - 1]!)) {
          lines.pop();
        }
        block.literal = lines.join("\n") + "\n";
        block.endLine = block.startLine + lines.length - 1;
      }
      block.stringContent = "";
    },
    canContain: () => false,
    acceptsLines: true
  },
  html: {
    continue(parser, container) {
      return parser.blank && (container.htmlBlockType === 6 || container.htmlBlockType === 7) ?
        "unmatched" :
        "matched";
    },
    finalize(_parser, block) {
      block.literal = block.stringContent.replace(/\n$/, "");
      block.stringContent = "";
    },
    canContain: () => false,
    acceptsLines: true
  },
  paragraph: {
    continue: parser => parser.blank ? "unmatched" : "matched",
    finalize() {},
    canContain: () => false,
    acceptsLines: true
  },
  // A table continues on any line that parses as a row. That line can still
  // start another block, which closes the table.
  table: {
    continue: parser => parseTableRow(parser.currentLine.slice(parser.nextNonspace)) ? "matched" : "unmatched",
    finalize() {},
    canContain: () => false,
    acceptsLines: false
  },
  // Rows and cells are created closed, so the parser never continues them.
  tableRow: {
    continue: () => "unmatched",
    finalize() {},
    canContain: () => false,
    acceptsLines: false
  },
  tableCell: {
    continue: () => "unmatched",
    finalize() {},
    canContain: () => false,
    acceptsLines: false
  },
  footnoteDefinition: {
    // As in cmark-gfm, only a line indented by four or more columns, or a
    // completely empty line, continues a footnote definition (besides lazy
    // paragraph continuation lines).
    continue(parser) {
      if (parser.indent >= 4) {
        parser.advanceOffset(4, true);
        return "matched";
      }
      return parser.currentLine === "" ? "matched" : "unmatched";
    },
    finalize() {},
    canContain: t => t !== "listItem",
    acceptsLines: false
  }
};

// Adds a closed table row with one cell per string to the table.
function addTableRow(table: Node, cells: string[], lineNumber: number) {
  const row = new Node("tableRow", lineNumber);
  row.open = false;
  for (const content of cells) {
    const cell = new Node("tableCell", lineNumber);
    cell.open = false;
    cell.stringContent = content;
    row.appendChild(cell);
  }
  table.appendChild(row);
}

// Block start functions, tried in order.
const blockStarts: BlockStart[] = [
  // block quote
  parser => {
    if (!parser.indented && peek(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN) {
      parser.advanceNextNonspace();
      parser.advanceOffset(1, false);
      // optional following space
      if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
        parser.advanceOffset(1, true);
      }
      parser.closeUnmatchedBlocks();
      parser.addChild("blockquote");
      return "container";
    }
    return "none";
  },

  // ATX heading
  parser => {
    let match: RegExpMatchArray | null;
    if (!parser.indented && (match = parser.currentLine.slice(parser.nextNonspace).match(reATXHeadingMarker))) {
      parser.advanceNextNonspace();
      parser.advanceOffset(match[0].length, false);
      parser.closeUnmatchedBlocks();
      const container = parser.addChild("heading");
      container.level = match[0].trim().length; // number of #s
      // remove trailing ###s:
      container.stringContent = parser
        .currentLine
        .slice(parser.offset)
        .replace(/^[ \t]*#+[ \t]*$/, "")
        .replace(/[ \t]+#+[ \t]*$/, "");
      parser.advanceOffset(parser.currentLine.length - parser.offset, false);
      return "leaf";
    }
    return "none";
  },

  // Fenced code block
  parser => {
    let match: RegExpMatchArray | null;
    if (!parser.indented && (match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))) {
      const fenceLength = match[0].length;
      parser.closeUnmatchedBlocks();
      const container = parser.addChild("code");
      container.isFenced = true;
      container.fenceLength = fenceLength;
      container.fenceChar = match[0][0]!;
      container.fenceOffset = parser.indent;
      parser.advanceNextNonspace();
      parser.advanceOffset(fenceLength, false);
      return "leaf";
    }
    return "none";
  },

  // HTML block
  (parser, container) => {
    if (!parser.indented && peek(parser.currentLine, parser.nextNonspace) === C_LESSTHAN) {
      const s = parser.currentLine.slice(parser.nextNonspace);
      for (let blockType = 1; blockType <= 7; blockType++) {
        if (
          reHtmlBlockOpen[blockType]!.test(s) &&
          (blockType < 7 ||
            (container.type !== "paragraph" &&
              // maybe lazy
              !(!parser.allClosed && !parser.blank && parser.tip.type === "paragraph")))
        ) {
          parser.closeUnmatchedBlocks();
          // We don't adjust parser.offset;
          // spaces are part of the HTML block:
          const b = parser.addChild("html");
          b.htmlBlockType = blockType;
          return "leaf";
        }
      }
    }
    return "none";
  },

  // Setext heading
  (parser, container) => {
    let match: RegExpMatchArray | null;
    if (
      !parser.indented &&
      container.type === "paragraph" &&
      (match = parser.currentLine.slice(parser.nextNonspace).match(reSetextHeadingLine))
    ) {
      parser.closeUnmatchedBlocks();
      // resolve reference link definitions
      parseReferences(parser, container);
      if (container.stringContent.length > 0) {
        const heading = new Node("heading", container.startLine);
        heading.level = match[0][0] === "=" ? 1 : 2;
        heading.stringContent = container.stringContent;
        container.insertAfter(heading);
        container.unlink();
        parser.tip = heading;
        parser.advanceOffset(parser.currentLine.length - parser.offset, false);
        return "leaf";
      }
    }
    return "none";
  },

  // thematic break
  parser => {
    if (!parser.indented && reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))) {
      parser.closeUnmatchedBlocks();
      parser.addChild("thematicBreak");
      parser.advanceOffset(parser.currentLine.length - parser.offset, false);
      return "leaf";
    }
    return "none";
  },

  // footnote definition (gfm)
  parser => {
    let match: RegExpMatchArray | null;
    if (
      parser.options.gfm &&
      !parser.indented &&
      (match = parser.currentLine.slice(parser.nextNonspace).match(reFootnoteDefinition))
    ) {
      parser.closeUnmatchedBlocks();
      parser.advanceNextNonspace();
      parser.advanceOffset(match[0].length, false);
      const definition = parser.addChild("footnoteDefinition");
      definition.label = match[1]!;
      parser.footnotes.add(normalizeReference(`[${definition.label}]`));
      return "container";
    }
    return "none";
  },

  // list item
  (parser, container) => {
    let data: ListData | null;
    if ((!parser.indented || container.type === "list") && (data = parseListMarker(parser, container))) {
      parser.closeUnmatchedBlocks();

      // add the list if needed
      if (parser.tip.type !== "list" || !listsMatch(container.listData!, data)) {
        container = parser.addChild("list");
        container.listData = data;
      }

      // add the list item
      container = parser.addChild("listItem");
      container.listData = data;

      // A task list item marker (gfm) right after the list marker. As in
      // cmark-gfm, no other block can start after it on this line.
      const task = parser.options.gfm ? reTaskListMarker.exec(parser.currentLine.slice(parser.offset)) : null;
      if (task) {
        container.checked = task[1] === "x" || task[1] === "X";
        parser.advanceOffset(3, false);
        parser.findNextNonspace();
        return "leaf";
      }
      return "container";
    }
    return "none";
  },

  // indented code block
  parser => {
    if (parser.indented && parser.tip.type !== "paragraph" && !parser.blank) {
      parser.advanceOffset(CODE_INDENT, true);
      parser.closeUnmatchedBlocks();
      parser.addChild("code");
      return "leaf";
    }
    return "none";
  },

  // table (gfm): a delimiter row turns the last line of the paragraph before
  // it into a table's header row
  (parser, container) => {
    if (!parser.options.gfm || parser.indented || container.type !== "paragraph" || container.tableVisited) {
      return "none";
    }
    const line = parser.currentLine.slice(parser.nextNonspace);
    const delimiters = reTableDelimiterRow.test(line) ? parseTableRow(line) : null;
    if (delimiters === null) {
      return "none";
    }
    const content = container.stringContent;
    const headerStart = content.lastIndexOf("\n", content.length - 2) + 1;
    const header = parseTableRow(content.slice(headerStart, -1));
    if (header === null || header.length !== delimiters.length) {
      container.tableVisited = true;
      return "none";
    }
    parser.closeUnmatchedBlocks();
    const headerLine = parser.lineNumber - 1;
    const table = new Node("table", headerLine);
    table.align = tableAlign(delimiters);
    container.insertAfter(table);
    if (headerStart > 0) {
      // The lines before the header row stay a paragraph.
      container.stringContent = content.slice(0, headerStart);
      parser.finalize(container, headerLine - 1);
    } else {
      container.unlink();
    }
    parser.tip = table;
    addTableRow(table, header, headerLine);
    parser.advanceOffset(parser.currentLine.length - parser.offset, false);
    return "leaf";
  },

  // table row (gfm)
  (parser, container) => {
    if (!parser.options.gfm || parser.indented || parser.blank || container.type !== "table") {
      return "none";
    }
    const cells = parseTableRow(parser.currentLine.slice(parser.nextNonspace));
    if (cells === null) {
      return "none";
    }
    parser.closeUnmatchedBlocks();
    // Short rows are filled with empty cells and long ones are truncated.
    const columns = container.align.length;
    addTableRow(container, Array.from({ length: columns }, (_, i) => cells[i] ?? ""), parser.lineNumber);
    parser.advanceOffset(parser.currentLine.length - parser.offset, false);
    return "leaf";
  }
];

/** Parses Markdown into the internal block tree, then parses inlines. */
export class BlockParser {
  readonly options: ParseOptions;
  readonly inlineParser: InlineParser = new InlineParser();
  doc: Node = new Node("root", 1);
  tip: Node = this.doc;
  oldtip: Node = this.doc;
  currentLine = "";
  lineNumber = 0;
  offset = 0;
  column = 0;
  nextNonspace = 0;
  nextNonspaceColumn = 0;
  indent = 0;
  indented = false;
  blank = false;
  partiallyConsumedTab = false;
  allClosed = true;
  lastMatchedContainer: Node = this.doc;
  refmap: RefMap = new Map();
  /** The normalized labels of the footnote definitions (gfm). */
  footnotes: Set<string> = new Set();

  constructor(options: ParseOptions) {
    this.options = options;
  }

  /** Parses a whole document and returns its root node. */
  parse(input: string): Node {
    this.doc = new Node("root", 1);
    this.tip = this.doc;
    this.refmap = new Map();
    this.footnotes = new Set();
    this.lineNumber = 0;
    this.offset = 0;
    this.column = 0;
    this.lastMatchedContainer = this.doc;
    this.currentLine = "";
    const lines = input.split(reLineEnding);
    let len = lines.length;
    if (input.charCodeAt(input.length - 1) === C_NEWLINE) {
      // ignore last blank line created by final newline
      len -= 1;
    }
    for (let i = 0; i < len; i++) {
      this.incorporateLine(lines[i]!);
    }
    while (this.tip !== this.doc) {
      this.finalize(this.tip, len);
    }
    this.finalize(this.doc, len);
    if (this.options.gfm) {
      markAlerts(this.doc);
    }
    this.inlineParser.refmap = this.refmap;
    this.inlineParser.footnotes = this.footnotes;
    this.inlineParser.gfm = this.options.gfm === true;
    this.processInlines(this.doc);
    return this.doc;
  }

  // Add a line to the block at the tip. We assume the tip
  // can accept lines -- that check should be done before calling this.
  addLine() {
    if (this.partiallyConsumedTab) {
      this.offset += 1; // skip over tab
      // add space characters:
      const charsToTab = 4 - (this.column % 4);
      this.tip.stringContent += " ".repeat(charsToTab);
    }
    this.tip.stringContent += this.currentLine.slice(this.offset) + "\n";
  }

  // Add block of type tag as a child of the tip. If the tip can't
  // accept children, close and finalize it and try its parent,
  // and so on til we find a block that can accept children.
  addChild(type: BlockType): Node {
    while (!blocks[this.tip.type as BlockType].canContain(type)) {
      this.finalize(this.tip, this.lineNumber - 1);
    }
    const newBlock = new Node(type, this.lineNumber);
    this.tip.appendChild(newBlock);
    this.tip = newBlock;
    return newBlock;
  }

  // Finalize and close any unmatched blocks.
  closeUnmatchedBlocks() {
    if (!this.allClosed) {
      // finalize any blocks not matched
      while (this.oldtip !== this.lastMatchedContainer) {
        const parent = this.oldtip.parent!;
        this.finalize(this.oldtip, this.lineNumber - 1);
        this.oldtip = parent;
      }
      this.allClosed = true;
    }
  }

  advanceOffset(count: number, columns: boolean) {
    const currentLine = this.currentLine;
    let c: string | undefined;
    while (count > 0 && (c = currentLine[this.offset])) {
      if (c === "\t") {
        const charsToTab = 4 - (this.column % 4);
        if (columns) {
          this.partiallyConsumedTab = charsToTab > count;
          const charsToAdvance = charsToTab > count ? count : charsToTab;
          this.column += charsToAdvance;
          this.offset += this.partiallyConsumedTab ? 0 : 1;
          count -= charsToAdvance;
        } else {
          this.partiallyConsumedTab = false;
          this.column += charsToTab;
          this.offset += 1;
          count -= 1;
        }
      } else {
        this.partiallyConsumedTab = false;
        this.offset += 1;
        this.column += 1; // assume ascii; block starts are ascii
        count -= 1;
      }
    }
  }

  advanceNextNonspace() {
    this.offset = this.nextNonspace;
    this.column = this.nextNonspaceColumn;
    this.partiallyConsumedTab = false;
  }

  findNextNonspace() {
    const currentLine = this.currentLine;
    let i = this.offset;
    let cols = this.column;
    let c: string;

    while ((c = currentLine.charAt(i)) !== "") {
      if (c === " ") {
        i++;
        cols++;
      } else if (c === "\t") {
        i++;
        cols += 4 - (cols % 4);
      } else {
        break;
      }
    }
    this.blank = c === "\n" || c === "\r" || c === "";
    this.nextNonspace = i;
    this.nextNonspaceColumn = cols;
    this.indent = this.nextNonspaceColumn - this.column;
    this.indented = this.indent >= CODE_INDENT;
  }

  // Analyze a line of text and update the document appropriately.
  // We parse markdown text by calling this on each line of input,
  // then finalizing the document.
  incorporateLine(ln: string) {
    let container = this.doc;
    this.oldtip = this.tip;
    this.offset = 0;
    this.column = 0;
    this.blank = false;
    this.partiallyConsumedTab = false;
    this.lineNumber += 1;

    // replace NUL characters for security
    if (ln.includes("\u0000")) {
      ln = ln.replace(/\0/g, "�");
    }
    this.currentLine = ln;

    // For each containing block, try to parse the associated line start.
    // Bail out on failure: container will point to the last matching block.
    let lastChild: Node | null;
    while ((lastChild = container.lastChild) && lastChild.open) {
      container = lastChild;
      this.findNextNonspace();
      const res = blocks[container.type as BlockType].continue(this, container);
      if (res === "done") {
        // we've hit end of line for fenced code close and can return
        return;
      }
      if (res === "unmatched") {
        container = container.parent!; // back up to last matching block
        break;
      }
    }

    this.allClosed = container === this.oldtip;
    this.lastMatchedContainer = container;

    let matchedLeaf = container.type !== "paragraph" && blocks[container.type as BlockType].acceptsLines;
    // Unless last matched container is a code block, try new container starts,
    // adding children to the last matched container:
    while (!matchedLeaf) {
      this.findNextNonspace();

      // this is a little performance optimization:
      if (
        !this.indented &&
        !reMaybeSpecial.test(ln.slice(this.nextNonspace)) &&
        !(this.options.gfm && (container.type === "table" || reMaybeSpecialGfm.test(ln.slice(this.nextNonspace))))
      ) {
        this.advanceNextNonspace();
        break;
      }

      let res: Start = "none";
      for (const start of blockStarts) {
        res = start(this, container);
        if (res !== "none") {
          break;
        }
      }
      if (res === "none") {
        // nothing matched
        this.advanceNextNonspace();
        break;
      }
      container = this.tip;
      matchedLeaf = res === "leaf";
    }

    // What remains at the offset is a text line. Add the text to the
    // appropriate container.

    // First check for a lazy paragraph continuation:
    if (!this.allClosed && !this.blank && this.tip.type === "paragraph") {
      // lazy paragraph continuation
      this.addLine();
      return;
    }

    // not a lazy continuation

    // finalize any blocks not matched
    this.closeUnmatchedBlocks();

    const t = container.type as BlockType;
    if (blocks[t].acceptsLines) {
      this.addLine();
      // if HtmlBlock, check for end condition
      if (
        t === "html" &&
        container.htmlBlockType >= 1 &&
        container.htmlBlockType <= 5 &&
        reHtmlBlockClose[container.htmlBlockType]!.test(this.currentLine.slice(this.offset))
      ) {
        this.finalize(container, this.lineNumber);
      }
    } else if (this.offset < ln.length && !this.blank) {
      // create paragraph container for line
      container = this.addChild("paragraph");
      this.advanceNextNonspace();
      this.addLine();
    }
  }

  // Finalize a block. Close it and do any necessary postprocessing,
  // e.g. creating string_content from strings, setting the 'tight'
  // or 'loose' status of a list, and parsing the beginnings
  // of paragraphs for reference definitions. Reset the tip to the
  // parent of the closed block.
  finalize(block: Node, lineNumber: number) {
    const above = block.parent;
    block.open = false;
    block.endLine = lineNumber;
    blocks[block.type as BlockType].finalize(this, block);
    if (above) {
      this.tip = above;
    }
  }

  // Walk through a block & children recursively, parsing string content
  // into inline content where appropriate.
  processInlines(block: Node) {
    for (let child = block.firstChild; child; child = child.next) {
      this.processInlines(child);
    }
    if (block.alertTitle) {
      this.inlineParser.parse(block.alertTitle);
    }
    if (block.type === "paragraph" || block.type === "heading" || block.type === "tableCell") {
      this.inlineParser.parse(block);
    }
  }
}
