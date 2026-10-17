// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
//
// Ported from commonmark.js 0.31.2 (lib/node.js).
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

import type { Admonition, AlignType } from "./types.ts";

/** Block node types the block parser creates. */
export type BlockType =
  | "root"
  | "blockquote"
  | "list"
  | "listItem"
  | "paragraph"
  | "heading"
  | "thematicBreak"
  | "code"
  | "html"
  | "table"
  | "tableRow"
  | "tableCell"
  | "footnoteDefinition";

/**
 * Inline node types the inline parser creates. `softbreak` only exists in the
 * internal tree; it becomes a newline in a text node in the mdast tree.
 */
export type InlineType =
  | "text"
  | "softbreak"
  | "break"
  | "emphasis"
  | "strong"
  | "inlineCode"
  | "html"
  | "link"
  | "image"
  | "delete"
  | "footnoteReference";

/** Data about a list marker, shared by a list and its items. */
export interface ListData {
  type: "bullet" | "ordered";
  tight: boolean;
  bulletChar: string | null;
  start: number | null;
  delimiter: string | null;
  padding: number;
  markerOffset: number;
}

/**
 * The parser's working tree: a doubly linked tree, so the parsers can move
 * runs of siblings around cheaply. It's converted to mdast once parsing ends.
 *
 * Unlike commonmark.js, only line numbers are tracked, because the parser only
 * needs them to find blank lines between blocks.
 */
export class Node {
  type: BlockType | InlineType;
  parent: Node | null = null;
  firstChild: Node | null = null;
  lastChild: Node | null = null;
  prev: Node | null = null;
  next: Node | null = null;
  /** Whether a block can still take lines. */
  open = true;
  /** The raw text of a block, before inline parsing. */
  stringContent = "";
  /** The text of text, code, and html nodes. */
  literal = "";
  startLine: number;
  endLine = 0;
  listData: ListData | null = null;
  /** For a list item: whether a blank line separates any of its children. */
  spread = false;
  /** For a task list item: whether it's checked. */
  checked: boolean | null = null;
  /** For a table: the alignment of each column. */
  align: AlignType[] = [];
  /**
   * For a paragraph: a line after it looked like a table delimiter row but
   * the paragraph's last line wasn't a matching header row. The paragraph is
   * never checked again, as in cmark-gfm.
   */
  tableVisited = false;
  /** For a block quote that's a GitHub alert (gfm): the alert's kind. */
  alert: Admonition["kind"] | null = null;
  /** For a footnote definition or reference: the label as written. */
  label = "";
  info = "";
  destination = "";
  title = "";
  level = 0;
  isFenced = false;
  fenceChar = "";
  fenceLength = 0;
  fenceOffset = 0;
  htmlBlockType = 0;

  constructor(type: BlockType | InlineType, startLine = 0) {
    this.type = type;
    this.startLine = startLine;
  }

  appendChild(child: Node) {
    child.unlink();
    child.parent = this;
    if (this.lastChild) {
      this.lastChild.next = child;
      child.prev = this.lastChild;
      this.lastChild = child;
    } else {
      this.firstChild = child;
      this.lastChild = child;
    }
  }

  unlink() {
    if (this.prev) {
      this.prev.next = this.next;
    } else if (this.parent) {
      this.parent.firstChild = this.next;
    }
    if (this.next) {
      this.next.prev = this.prev;
    } else if (this.parent) {
      this.parent.lastChild = this.prev;
    }
    this.parent = null;
    this.next = null;
    this.prev = null;
  }

  insertAfter(sibling: Node) {
    sibling.unlink();
    sibling.next = this.next;
    if (sibling.next) {
      sibling.next.prev = sibling;
    }
    sibling.prev = this;
    this.next = sibling;
    sibling.parent = this.parent;
    if (!sibling.next && sibling.parent) {
      sibling.parent.lastChild = sibling;
    }
  }
}

/** Creates a text node. */
export function text(s: string): Node {
  const node = new Node("text");
  node.literal = s;
  return node;
}
