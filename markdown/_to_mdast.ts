// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import { normalizeUri } from "./_common.ts";
import { splitEmailAutolinks } from "./_gfm.ts";
import { normalizeReference } from "./_inline_parser.ts";
import type { Node } from "./_node.ts";
import type {
  BlockContent,
  DefinitionContent,
  Heading,
  Image,
  ListItem,
  PhrasingContent,
  Root,
  TableCell,
  TableRow
} from "./types.ts";

const reWhitespace = /\s+/;

/**
 * Converts the parser's working tree into an mdast tree. With `gfm`, email
 * addresses in text become links, as in cmark-gfm's autolink postprocessing.
 */
export function toMdast(doc: Node, gfm: boolean): Root {
  return { type: "root", children: blockChildren(doc, gfm) };
}

// The mdast identifier of a footnote label, as mdast-util-from-markdown makes it.
function identifier(label: string): string {
  return normalizeReference(`[${label}]`).toLowerCase();
}

function blockChildren(node: Node, gfm: boolean): (BlockContent | DefinitionContent)[] {
  const children: (BlockContent | DefinitionContent)[] = [];
  for (let child = node.firstChild; child; child = child.next) {
    children.push(convertBlock(child, gfm));
  }
  return children;
}

function convertBlock(node: Node, gfm: boolean): BlockContent | DefinitionContent {
  switch (node.type) {
    case "paragraph":
      return { type: "paragraph", children: phrasingChildren(node, gfm) };
    case "heading":
      // `parse()` sets the id once the whole tree exists.
      return { type: "heading", depth: node.level as Heading["depth"], id: "", children: phrasingChildren(node, gfm) };
    case "thematicBreak":
      return { type: "thematicBreak" };
    case "blockquote":
      if (node.alert === null) {
        return { type: "blockquote", children: blockChildren(node, gfm) };
      }
      return node.alertTitle === null ?
        { type: "admonition", kind: node.alert, children: blockChildren(node, gfm) } :
        { type: "admonition", kind: node.alert, title: phrasingChildren(node.alertTitle, gfm), children: blockChildren(node, gfm) };
    case "list": {
      const listData = node.listData!;
      const children: ListItem[] = [];
      for (let item = node.firstChild; item; item = item.next) {
        children.push({ type: "listItem", spread: item.spread, checked: item.checked, children: blockChildren(item, gfm) });
      }
      return {
        type: "list",
        ordered: listData.type === "ordered",
        start: listData.start,
        spread: !listData.tight,
        children
      };
    }
    case "code": {
      // The info string is already trimmed, so a whitespace run separates the
      // language from the meta string.
      const info = node.info;
      const space = reWhitespace.exec(info);
      return {
        type: "code",
        lang: info === "" ? null : space ? info.slice(0, space.index) : info,
        meta: space ? info.slice(space.index + space[0].length) : null,
        value: node.literal.endsWith("\n") ? node.literal.slice(0, -1) : node.literal
      };
    }
    case "html":
      return { type: "html", value: node.literal };
    case "table": {
      const rows: TableRow[] = [];
      for (let row = node.firstChild; row; row = row.next) {
        const cells: TableCell[] = [];
        for (let cell = row.firstChild; cell; cell = cell.next) {
          cells.push({ type: "tableCell", children: phrasingChildren(cell, gfm) });
        }
        rows.push({ type: "tableRow", children: cells });
      }
      return { type: "table", align: node.align, children: rows };
    }
    case "footnoteDefinition":
      return { type: "footnoteDefinition", identifier: identifier(node.label), label: node.label, children: blockChildren(node, gfm) };
    default:
      throw new Error(`Cannot convert node: unexpected block type "${node.type}"`);
  }
}

// Converts inline children, merging adjacent text: the inline parser leaves
// many small text nodes behind (unused delimiters, brackets, soft breaks).
// With `emailAutolinks`, email addresses in the merged text become links.
function phrasingChildren(node: Node, emailAutolinks: boolean): PhrasingContent[] {
  const children: PhrasingContent[] = [];
  for (let child = node.firstChild; child; child = child.next) {
    const converted = convertInline(child, emailAutolinks);
    const last = children.at(-1);
    if (converted.type !== "text") {
      children.push(converted);
    } else if (last?.type === "text") {
      last.value += converted.value;
    } else if (converted.value !== "") {
      children.push(converted);
    }
  }
  return emailAutolinks ? children.flatMap(linkEmails) : children;
}

function linkEmails(node: PhrasingContent): PhrasingContent[] {
  if (node.type !== "text" || !node.value.includes("@")) {
    return [node];
  }
  return splitEmailAutolinks(node.value)
    .filter(part => part !== "")
    .map(part =>
      typeof part === "string" ?
        { type: "text", value: part } :
        { type: "link", url: normalizeUri(part.url), title: null, children: [{ type: "text", value: part.text }] }
    );
}

function convertInline(node: Node, gfm: boolean): PhrasingContent {
  switch (node.type) {
    case "text":
      return { type: "text", value: node.literal };
    case "softbreak":
      return { type: "text", value: "\n" };
    case "break":
      return { type: "break" };
    case "emphasis":
      return { type: "emphasis", children: phrasingChildren(node, gfm) };
    case "strong":
      return { type: "strong", children: phrasingChildren(node, gfm) };
    case "delete":
      return { type: "delete", children: phrasingChildren(node, gfm) };
    case "inlineCode":
      return { type: "inlineCode", value: node.literal };
    case "html":
      return { type: "html", value: node.literal };
    case "link":
      // No autolinks inside a link.
      return { type: "link", url: node.destination, title: node.title || null, children: phrasingChildren(node, false) };
    case "image":
      return { type: "image", url: node.destination, title: node.title || null, alt: altText(node) };
    case "footnoteReference":
      return { type: "footnoteReference", identifier: identifier(node.label), label: node.label };
    default:
      throw new Error(`Cannot convert node: unexpected inline type "${node.type}"`);
  }
}

// The plain text of an image description, as commonmark.js renders it into
// the `alt` attribute.
function altText(node: Node): Image["alt"] {
  let alt = "";
  for (let child = node.firstChild; child; child = child.next) {
    switch (child.type) {
      case "text":
      case "inlineCode":
      case "html":
        alt += child.literal;
        break;
      case "softbreak":
      case "break":
        alt += "\n";
        break;
      default:
        alt += altText(child);
    }
  }
  return alt;
}
