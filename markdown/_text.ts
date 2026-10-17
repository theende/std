// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import type { PhrasingContent } from "./types.ts";

/**
 * The plain text of phrasing content, as heading ids are made from: text and
 * code, and the alt text of images. Raw HTML tags and footnote references
 * add nothing, and a hard break adds a newline.
 */
export function plainText(children: readonly PhrasingContent[]): string {
  let text = "";
  for (const node of children) {
    switch (node.type) {
      case "text":
      case "inlineCode":
        text += node.value;
        break;
      case "image":
        text += node.alt;
        break;
      case "break":
        text += "\n";
        break;
      case "emphasis":
      case "strong":
      case "delete":
      case "link":
        text += plainText(node.children);
        break;
      case "html":
      case "footnoteReference":
        break;
    }
  }
  return text;
}
