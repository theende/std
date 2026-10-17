// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
//
// Ported from cmark-gfm (extensions/table.c, extensions/autolink.c,
// extensions/ext_scanners.re and src/scanners.re), commit 27d942c.
//
// cmark-gfm is Copyright (c) 2014, John MacFarlane. All rights reserved.
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

import type { AlignType } from "./types.ts";

/** Matches a table delimiter row, such as `| :-- | --: |`. */
export const reTableDelimiterRow = /^\|?[ \t\v\f]*:?-+:?[ \t\v\f]*(?:\|[ \t\v\f]*:?-+:?[ \t\v\f]*)*\|?[ \t\v\f]*$/;

/** Matches the start of a footnote definition, such as `[^1]: `. */
export const reFootnoteDefinition = /^\[\^([^\] \r\n\0\t]+)\]:[ \t]*/;

/** Matches a task list item marker, which must be followed by a space or tab. */
export const reTaskListMarker = /^\[([ \txX])\][ \t]/;

// cmark-gfm's scanner matches the longest run, so a backslash before a pipe
// always escapes it, even after another backslash.
const reTableCell = /(?:\\\||[^|\r\n])+/y;
const reTableCellEnd = /\|[ \t\v\f]*/y;
const reTableRowEnd = /[ \t\v\f]*\r?\n/y;
const reCmarkSpaceTrim = /^[ \t\n\v\f\r]+|[ \t\n\v\f\r]+$/g;
const reAsciiSpace = /[ \t\n\v\f\r]/;
const reAsciiAlpha = /[A-Za-z]/;
const reAsciiAlnum = /[A-Za-z0-9]/;
const reAsciiPunctuation = /[!-/:-@[-`{-~]/;
// cmark-gfm's Unicode whitespace test, which unlike its ASCII one leaves out \v.
const reHostSpace = /[\t\n\f\r ]/;
const reHostCharInvalid = /^(?:[\t\n\f\r    -   　]|[!-/:-@[-`{-~]|\p{P})/u;
const SCHEMES = ["http://", "https://", "ftp://"];

/** A link found by {@linkcode splitEmailAutolinks}. */
export interface Autolink {
  url: string;
  text: string;
}

function scan(re: RegExp, s: string, pos: number): number {
  re.lastIndex = pos;
  const match = re.exec(s);
  return match === null ? 0 : match[0].length;
}

function isAsciiSpace(c: string | undefined): boolean {
  return c !== undefined && reAsciiSpace.test(c);
}

function isAsciiAlpha(c: string | undefined): boolean {
  return c !== undefined && reAsciiAlpha.test(c);
}

function isAsciiAlnum(c: string | undefined): boolean {
  return c !== undefined && reAsciiAlnum.test(c);
}

/**
 * Splits one line of a table into the text of its cells, with escaped pipes
 * unescaped and surrounding whitespace trimmed. Returns `null` if the line
 * isn't a table row.
 */
export function parseTableRow(line: string): string[] | null {
  const s = `${line}\n`;
  const cells: string[] = [];
  let offset = scan(reTableCellEnd, s, 0);
  while (offset < s.length) {
    const cellLength = scan(reTableCell, s, offset);
    const pipeLength = scan(reTableCellEnd, s, offset + cellLength);
    if (cellLength > 0 || pipeLength > 0) {
      cells.push(s.slice(offset, offset + cellLength).replaceAll("\\|", "|").replace(reCmarkSpaceTrim, ""));
    }
    offset += cellLength + pipeLength;
    if (pipeLength === 0) {
      offset += scan(reTableRowEnd, s, offset);
      break;
    }
  }
  return offset === s.length && cells.length > 0 ? cells : null;
}

/** Reads the column alignments from the cells of a delimiter row. */
export function tableAlign(cells: string[]): AlignType[] {
  return cells.map(cell => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    return left && right ? "center" : left ? "left" : right ? "right" : null;
  });
}

// Returns the length of the domain at `start`, or 0 if it isn't valid. The
// scan starts at the second character, as in cmark-gfm. Non-ASCII characters
// end the scan, as cmark-gfm stops at the second byte of a UTF-8 sequence.
function checkDomain(s: string, start: number, allowShort: boolean): number {
  const size = s.length - start;
  let i: number;
  let periods = 0;
  let underscores1 = 0;
  let underscores2 = 0;
  for (i = 1; i < size - 1; i++) {
    if (s[start + i] === "\\" && i < size - 2) {
      i++;
    }
    const c = s[start + i]!;
    if (c === "_") {
      underscores2++;
    } else if (c === ".") {
      underscores1 = underscores2;
      underscores2 = 0;
      periods++;
    } else if (c.charCodeAt(0) >= 0x80 || reHostSpace.test(c) || (reAsciiPunctuation.test(c) && c !== "-")) {
      break;
    }
  }
  // No underscores in the last two segments, unless there are many segments
  // (cmark-gfm's guard against quadratic behavior).
  if ((underscores1 > 0 || underscores2 > 0) && periods <= 10) {
    return 0;
  }
  return allowShort || periods > 0 ? i : 0;
}

// Trims trailing punctuation, unmatched closing parentheses and entity-like
// endings from the link of length `linkEnd` at `start`.
function autolinkDelim(s: string, start: number, linkEnd: number): number {
  let opening = 0;
  let closing = 0;
  for (let i = 0; i < linkEnd; i++) {
    const c = s[start + i];
    if (c === "<") {
      linkEnd = i;
      break;
    } else if (c === "(") {
      opening++;
    } else if (c === ")") {
      closing++;
    }
  }
  while (linkEnd > 0) {
    switch (s[start + linkEnd - 1]) {
      case ")":
        if (closing <= opening) {
          return linkEnd;
        }
        closing--;
        linkEnd--;
        break;
      case "?":
      case "!":
      case ".":
      case ",":
      case ":":
      case "*":
      case "_":
      case "~":
      case "'":
      case "\"":
        linkEnd--;
        break;
      case ";": {
        let newEnd = linkEnd - 2;
        while (newEnd > 0 && isAsciiAlpha(s[start + newEnd])) {
          newEnd--;
        }
        linkEnd = newEnd < linkEnd - 2 && s[start + newEnd] === "&" ? newEnd : linkEnd - 1;
        break;
      }
      default:
        return linkEnd;
    }
  }
  return linkEnd;
}

// Extends a link over non-space characters up to `<`, then trims its end.
function extendLink(s: string, start: number, linkEnd: number): number {
  while (start + linkEnd < s.length && !isAsciiSpace(s[start + linkEnd]) && s[start + linkEnd] !== "<") {
    linkEnd++;
  }
  return autolinkDelim(s, start, linkEnd);
}

/**
 * Matches an extended www autolink at `pos`, which must be at the start of
 * the text or after whitespace, `*`, `_`, `~` or `(`. Returns its length, or 0.
 */
export function matchWwwAutolink(s: string, pos: number): number {
  if (pos > 0 && !"*_~(".includes(s[pos - 1]!) && !isAsciiSpace(s[pos - 1])) {
    return 0;
  }
  if (!s.startsWith("www.", pos)) {
    return 0;
  }
  const domainLength = checkDomain(s, pos, false);
  return domainLength === 0 ? 0 : extendLink(s, pos, domainLength);
}

/**
 * Matches an extended URL autolink around the `:` at `pos`: the scheme is
 * the run of letters before it. Returns the link's start and end, or `null`.
 */
export function matchUrlAutolink(s: string, pos: number): { start: number; end: number; } | null {
  if (s.length - pos < 4 || s[pos + 1] !== "/" || s[pos + 2] !== "/") {
    return null;
  }
  let rewind = 0;
  while (rewind < pos && isAsciiAlpha(s[pos - rewind - 1])) {
    rewind++;
  }
  const start = pos - rewind;
  const safe = SCHEMES.some(scheme =>
    s.length - start > scheme.length &&
    s.slice(start, start + scheme.length).toLowerCase() === scheme &&
    !reHostCharInvalid.test(String.fromCodePoint(s.codePointAt(start + scheme.length)!))
  );
  if (!safe) {
    return null;
  }
  const domainLength = checkDomain(s, pos + 3, true);
  if (domainLength === 0) {
    return null;
  }
  const linkEnd = extendLink(s, pos, 3 + domainLength);
  return linkEnd === 0 ? null : { start, end: pos + linkEnd };
}

// Whether `protocol` ends just before the `rewind` characters before the `@`
// at `at`, and doesn't follow a letter or digit.
function validateProtocol(protocol: string, s: string, at: number, rewind: number, maxRewind: number): boolean {
  const length = protocol.length;
  if (length > maxRewind - rewind || s.slice(at - rewind - length, at - rewind) !== protocol) {
    return false;
  }
  return length === maxRewind - rewind || !isAsciiAlnum(s[at - rewind - length - 1]);
}

/**
 * Finds extended email autolinks (and `mailto:` and `xmpp:` links) in text,
 * as cmark-gfm's autolink postprocessing does. Returns the text split into
 * plain strings and links.
 */
export function splitEmailAutolinks(value: string): (string | Autolink)[] {
  const parts: (string | Autolink)[] = [];
  let start = 0;
  let offset = 0;
  const remaining = () => value.length - start;
  search: while (offset < remaining()) {
    let autoMailto = true;
    let isXmpp = false;
    let periods = 0;
    const atIndex = value.indexOf("@", start + offset);
    if (atIndex === -1) {
      break;
    }
    let maxRewind = atIndex - (start + offset);
    let rewind = 0;
    let linkEnd = 0;
    // cmark-gfm retries from a later `@` without resetting its state.
    retry: while (true) {
      const at = start + offset + maxRewind;
      for (rewind = 0; rewind < maxRewind; rewind++) {
        const c = value[at - rewind - 1]!;
        if (isAsciiAlnum(c) || ".+-_".includes(c)) {
          continue;
        }
        if (c === ":") {
          if (validateProtocol("mailto:", value, at, rewind, maxRewind)) {
            autoMailto = false;
            continue;
          }
          if (validateProtocol("xmpp:", value, at, rewind, maxRewind)) {
            autoMailto = false;
            isXmpp = true;
            continue;
          }
        }
        break;
      }
      if (rewind === 0) {
        offset += maxRewind + 1;
        continue search;
      }
      const limit = remaining() - offset - maxRewind;
      for (linkEnd = 1; linkEnd < limit; linkEnd++) {
        const c = value[at + linkEnd];
        if (isAsciiAlnum(c)) {
          continue;
        }
        if (c === "@") {
          offset += maxRewind + 1;
          maxRewind = linkEnd - 1;
          continue retry;
        } else if (c === "." && linkEnd < limit - 1 && isAsciiAlnum(value[at + linkEnd + 1])) {
          periods++;
        } else if (c === "/" && isXmpp) {
          continue;
        } else if (c !== "-" && c !== "_") {
          break;
        }
      }
      break;
    }
    const at = start + offset + maxRewind;
    const last = value[at + linkEnd - 1];
    if (linkEnd < 2 || periods === 0 || (!isAsciiAlpha(last) && last !== ".")) {
      offset += maxRewind + linkEnd;
      continue;
    }
    linkEnd = autolinkDelim(value, at, linkEnd);
    if (linkEnd === 0) {
      offset += maxRewind + 1;
      continue;
    }
    const text = value.slice(at - rewind, at + linkEnd);
    parts.push(value.slice(start, at - rewind), { url: autoMailto ? `mailto:${text}` : text, text });
    start = at + linkEnd;
    offset = 0;
  }
  parts.push(value.slice(start));
  return parts;
}
