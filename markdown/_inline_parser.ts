// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
//
// Ported from commonmark.js 0.31.2 (lib/inlines.js). The GFM inline
// extensions (strikethrough, extended autolinks and footnote references)
// follow cmark-gfm, which has the same copyright and license.
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

import { decodeEntity, ENTITY, ESCAPABLE, normalizeUri, reHtmlTag, unescapeString } from "./_common.ts";
import { matchUrlAutolink, matchWwwAutolink } from "./_gfm.ts";
import { Node, text } from "./_node.ts";

const C_NEWLINE = 10;
const C_ASTERISK = 42;
const C_UNDERSCORE = 95;
const C_BACKTICK = 96;
const C_OPEN_BRACKET = 91;
const C_CLOSE_BRACKET = 93;
const C_LESSTHAN = 60;
const C_BANG = 33;
const C_BACKSLASH = 92;
const C_AMPERSAND = 38;
const C_OPEN_PAREN = 40;
const C_CLOSE_PAREN = 41;
const C_COLON = 58;
const C_TILDE = 126;
const C_CARET = 94;
const C_W = 119;

const ESCAPED_CHAR = `\\\\${ESCAPABLE}`;

const rePunctuation = /^[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\p{P}\p{S}]/u;
const reLinkTitle = new RegExp(
  `^(?:"(${ESCAPED_CHAR}|\\\\[^\\\\]|[^\\\\"\\x00])*"` +
    `|'(${ESCAPED_CHAR}|\\\\[^\\\\]|[^\\\\'\\x00])*'` +
    `|\\((${ESCAPED_CHAR}|\\\\[^\\\\]|[^\\\\()\\x00])*\\))`
);
// deno-lint-ignore no-control-regex -- the spec excludes these control characters
const reLinkDestinationBraces = /^(?:<(?:[^<>\n\\\x00]|\\.)*>)/;
const reEscapable = new RegExp(`^${ESCAPABLE}`);
const reEntityHere = new RegExp(`^${ENTITY}`, "i");
const reTicks = /`+/;
const reTicksHere = /^`+/;
const reEmailAutolink =
  /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
// deno-lint-ignore no-control-regex -- the spec excludes these control characters
const reAutolink = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i;
const reSpnl = /^ *(?:\n *)?/;
// deno-lint-ignore no-control-regex -- the spec excludes these control characters
const reWhitespaceChar = /^[ \t\n\x0b\x0c\x0d]/;
const reUnicodeWhitespaceChar = /^\s/;
const reFinalSpace = / *$/;
const reInitialSpace = /^ */;
const reSpaceAtEndOfLine = /^ *(?:\n|$)/;
const reLinkLabel = /^\[(?:[^\\\[\]]|\\.){0,1000}\]/s;
// Matches a string of non-special characters.
const reMain = /^[^\n`\[\]\\!<&*_]+/;
// With the gfm option, `~` can also be a delimiter, and `:` and `w` can start
// an extended autolink.
const reMainGfm = /^[^\n`\[\]\\!<&*_~:w]+/;

/** A resolved link reference definition. */
export interface LinkReference {
  destination: string;
  title: string;
}

/** Link reference definitions, keyed by normalized label. */
export type RefMap = Map<string, LinkReference>;

/** An entry in the emphasis delimiter stack. */
interface Delimiter {
  cc: number;
  numdelims: number;
  origdelims: number;
  node: Node;
  previous: Delimiter | null;
  next: Delimiter | null;
  canOpen: boolean;
  canClose: boolean;
}

/** An entry in the `[` and `![` stack. */
interface Bracket {
  node: Node;
  previous: Bracket | null;
  previousDelimiter: Delimiter | null;
  index: number;
  image: boolean;
  active: boolean;
  bracketAfter: boolean;
}

/**
 * Normalizes a link label for matching: strips the brackets, trims, collapses
 * internal whitespace, and case-folds.
 */
export function normalizeReference(label: string): string {
  return label
    .slice(1, label.length - 1)
    .trim()
    .replace(/[ \t\r\n]+/g, " ")
    .toLowerCase()
    .toUpperCase();
}

/** Returns the code point that ends just before `index`, as a string. */
function charBefore(s: string, index: number): string {
  const low = s.charCodeAt(index - 1);
  if (low >= 0xdc00 && low <= 0xdfff && index >= 2) {
    const high = s.charCodeAt(index - 2);
    if (high >= 0xd800 && high <= 0xdbff) {
      return s.slice(index - 2, index);
    }
  }
  return s.charAt(index - 1);
}

/** Parses the text content of a paragraph or heading into inline nodes. */
export class InlineParser {
  subject = "";
  pos = 0;
  delimiters: Delimiter | null = null;
  brackets: Bracket | null = null;
  refmap: RefMap = new Map();
  /** Whether to parse the GFM inline extensions. */
  gfm = false;
  /** The normalized labels of the footnote definitions (gfm). */
  footnotes: Set<string> = new Set();

  /** Parses `block.stringContent` into inline children of `block`. */
  parse(block: Node) {
    // Table cells are already trimmed of ASCII whitespace only, as in cmark-gfm.
    this.subject = block.type === "tableCell" ? block.stringContent : block.stringContent.trim();
    this.pos = 0;
    this.delimiters = null;
    this.brackets = null;
    while (this.parseInline(block)) {
      // Keep parsing until the subject is used up.
    }
    block.stringContent = "";
    this.processEmphasis(null);
  }

  // If re matches at current position in the subject, advance
  // position in subject and return the match; otherwise return null.
  match(re: RegExp): string | null {
    const m = re.exec(this.subject.slice(this.pos));
    if (m === null) {
      return null;
    }
    this.pos += m.index + m[0].length;
    return m[0];
  }

  // Returns the code for the character at the current subject position, or -1
  // there are no more characters.
  peek(): number {
    return this.pos < this.subject.length ? this.subject.charCodeAt(this.pos) : -1;
  }

  // Parse zero or more space characters, including at most one newline.
  spnl(): true {
    this.match(reSpnl);
    return true;
  }

  // Parse the next inline element in subject, advancing subject position.
  // On success, add the result to block's children and return true.
  // On failure, return false.
  parseInline(block: Node): boolean {
    const c = this.peek();
    if (c === -1) {
      return false;
    }
    let res: boolean;
    switch (c) {
      case C_NEWLINE:
        res = this.parseNewline(block);
        break;
      case C_BACKSLASH:
        res = this.parseBackslash(block);
        break;
      case C_BACKTICK:
        res = this.parseBackticks(block);
        break;
      case C_ASTERISK:
      case C_UNDERSCORE:
        res = this.handleDelim(c, block);
        break;
      case C_OPEN_BRACKET:
        res = this.parseOpenBracket(block);
        break;
      case C_BANG:
        res = this.parseBang(block);
        break;
      case C_CLOSE_BRACKET:
        res = this.parseCloseBracket(block);
        break;
      case C_LESSTHAN:
        res = this.parseAutolink(block) || this.parseHtmlTag(block);
        break;
      case C_AMPERSAND:
        res = this.parseEntity(block);
        break;
      case C_TILDE:
        res = this.gfm ? this.handleDelim(c, block) : this.parseString(block);
        break;
      case C_COLON:
        res = (this.gfm && this.parseUrlAutolink(block)) || this.parseString(block);
        break;
      case C_W:
        res = (this.gfm && this.parseWwwAutolink(block)) || this.parseString(block);
        break;
      default:
        res = this.parseString(block);
        break;
    }
    if (!res) {
      this.pos += 1;
      block.appendChild(text(String.fromCharCode(c)));
    }
    return true;
  }

  // Attempt to parse backticks, adding either a backtick code span or a
  // literal sequence of backticks.
  parseBackticks(block: Node): boolean {
    const ticks = this.match(reTicksHere);
    if (ticks === null) {
      return false;
    }
    const afterOpenTicks = this.pos;
    let matched: string | null;
    while ((matched = this.match(reTicks)) !== null) {
      if (matched === ticks) {
        const node = new Node("inlineCode");
        const contents = this
          .subject
          .slice(afterOpenTicks, this.pos - ticks.length)
          .replace(/\n/gm, " ");
        if (
          contents.length > 0 &&
          /[^ ]/.test(contents) &&
          contents[0] === " " &&
          contents[contents.length - 1] === " "
        ) {
          node.literal = contents.slice(1, contents.length - 1);
        } else {
          node.literal = contents;
        }
        block.appendChild(node);
        return true;
      }
    }
    // If we got here, we didn't match a closing backtick sequence.
    this.pos = afterOpenTicks;
    block.appendChild(text(ticks));
    return true;
  }

  // Parse a backslash-escaped special character, adding either the escaped
  // character, a hard line break (if the backslash is followed by a newline),
  // or a literal backslash to the block's children. Assumes current character
  // is a backslash.
  parseBackslash(block: Node): boolean {
    const subj = this.subject;
    this.pos += 1;
    if (this.peek() === C_NEWLINE) {
      this.pos += 1;
      block.appendChild(new Node("break"));
    } else if (reEscapable.test(subj.charAt(this.pos))) {
      block.appendChild(text(subj.charAt(this.pos)));
      this.pos += 1;
    } else {
      block.appendChild(text("\\"));
    }
    return true;
  }

  // Attempt to parse an autolink (URL or email in pointy brackets).
  parseAutolink(block: Node): boolean {
    let m: string | null;
    let dest: string;
    if ((m = this.match(reEmailAutolink))) {
      dest = m.slice(1, m.length - 1);
      block.appendChild(this.#autolink(normalizeUri(`mailto:${dest}`), dest));
      return true;
    } else if ((m = this.match(reAutolink))) {
      dest = m.slice(1, m.length - 1);
      block.appendChild(this.#autolink(normalizeUri(dest), dest));
      return true;
    }
    return false;
  }

  // Attempt to parse an extended www autolink (gfm). Not inside link text.
  parseWwwAutolink(block: Node): boolean {
    const length = this.brackets === null ? matchWwwAutolink(this.subject, this.pos) : 0;
    if (length === 0) {
      return false;
    }
    const label = this.subject.slice(this.pos, this.pos + length);
    this.pos += length;
    block.appendChild(this.#autolink(normalizeUri(`http://${label}`), label));
    return true;
  }

  // Attempt to parse an extended URL autolink around a `:` (gfm). The scheme
  // before the `:` was already added as text, so take it back.
  parseUrlAutolink(block: Node): boolean {
    const match = this.brackets === null ? matchUrlAutolink(this.subject, this.pos) : null;
    if (match === null) {
      return false;
    }
    let rewind = this.pos - match.start;
    for (let node = block.lastChild; rewind > 0 && node?.type === "text"; node = node.prev) {
      const removed = Math.min(rewind, node.literal.length);
      node.literal = node.literal.slice(0, node.literal.length - removed);
      rewind -= removed;
    }
    const label = this.subject.slice(match.start, match.end);
    this.pos = match.end;
    block.appendChild(this.#autolink(normalizeUri(label), label));
    return true;
  }

  #autolink(destination: string, label: string): Node {
    const node = new Node("link");
    node.destination = destination;
    node.title = "";
    node.appendChild(text(label));
    return node;
  }

  // Attempt to parse a raw HTML tag.
  parseHtmlTag(block: Node): boolean {
    const m = this.match(reHtmlTag);
    if (m === null) {
      return false;
    }
    const node = new Node("html");
    node.literal = m;
    block.appendChild(node);
    return true;
  }

  // Scan a sequence of characters with code cc, and return information about
  // the number of delimiters and whether they are positioned such that
  // they can open and/or close emphasis or strong emphasis. A utility
  // function for strong/emph parsing.
  scanDelims(cc: number): { numdelims: number; canOpen: boolean; canClose: boolean; } | null {
    let numdelims = 0;
    const startpos = this.pos;

    while (this.peek() === cc) {
      numdelims++;
      this.pos++;
    }
    if (numdelims === 0) {
      return null;
    }

    // With gfm, cmark-gfm looks past tildes next to a `*` or `_` run to find
    // the characters before and after it.
    let beforePos = startpos;
    let afterPos = this.pos;
    if (this.gfm && cc !== C_TILDE) {
      while (beforePos > 1 && this.subject.charCodeAt(beforePos - 1) === C_TILDE) {
        beforePos--;
      }
      while (this.subject.charCodeAt(afterPos) === C_TILDE) {
        afterPos++;
      }
    }
    const before = beforePos === 0 ? "\n" : charBefore(this.subject, beforePos);
    const charBeforeDelims = this.gfm && before === "~" ? "\n" : before;
    const ccAfter = this.subject.codePointAt(afterPos);
    const charAfter = ccAfter === undefined ? "\n" : String.fromCodePoint(ccAfter);

    const afterIsWhitespace = reUnicodeWhitespaceChar.test(charAfter);
    const afterIsPunctuation = rePunctuation.test(charAfter);
    const beforeIsWhitespace = reUnicodeWhitespaceChar.test(charBeforeDelims);
    const beforeIsPunctuation = rePunctuation.test(charBeforeDelims);

    const leftFlanking = !afterIsWhitespace &&
      (!afterIsPunctuation || beforeIsWhitespace || beforeIsPunctuation);
    const rightFlanking = !beforeIsWhitespace &&
      (!beforeIsPunctuation || afterIsWhitespace || afterIsPunctuation);
    let canOpen: boolean;
    let canClose: boolean;
    if (cc === C_UNDERSCORE) {
      canOpen = leftFlanking && (!rightFlanking || beforeIsPunctuation);
      canClose = rightFlanking && (!leftFlanking || afterIsPunctuation);
    } else {
      canOpen = leftFlanking;
      canClose = rightFlanking;
    }
    this.pos = startpos;
    return { numdelims, canOpen, canClose };
  }

  // Handle a delimiter marker for emphasis.
  handleDelim(cc: number, block: Node): boolean {
    const res = this.scanDelims(cc);
    if (!res) {
      return false;
    }
    const numdelims = res.numdelims;
    const startpos = this.pos;

    this.pos += numdelims;
    const node = text(this.subject.slice(startpos, this.pos));
    block.appendChild(node);

    // Add entry to stack for this opener. Only runs of one or two tildes can
    // delimit strikethrough.
    if ((res.canOpen || res.canClose) && (cc !== C_TILDE || numdelims <= 2)) {
      this.delimiters = {
        cc,
        numdelims,
        origdelims: numdelims,
        node,
        previous: this.delimiters,
        next: null,
        canOpen: res.canOpen,
        canClose: res.canClose
      };
      if (this.delimiters.previous !== null) {
        this.delimiters.previous.next = this.delimiters;
      }
    }
    return true;
  }

  removeDelimiter(delim: Delimiter) {
    if (delim.previous !== null) {
      delim.previous.next = delim.next;
    }
    if (delim.next === null) {
      // top of stack
      this.delimiters = delim.previous;
    } else {
      delim.next.previous = delim.previous;
    }
  }

  processEmphasis(stackBottom: Delimiter | null) {
    // Lower bounds for opener searches, indexed by the closer's character,
    // whether it can open, and its original length modulo 3.
    const openersBottom: (Delimiter | null)[] = new Array(18).fill(stackBottom);

    // find first closer above stackBottom:
    let closer = this.delimiters;
    while (closer !== null && closer.previous !== stackBottom) {
      closer = closer.previous;
    }
    // move forward, looking for closers, and handling each
    while (closer !== null) {
      if (!closer.canClose) {
        closer = closer.next;
        continue;
      }
      // found emphasis closer. now look back for first matching opener:
      let opener = closer.previous;
      let openerFound = false;
      const openersBottomIndex = (closer.cc === C_UNDERSCORE ? 0 : closer.cc === C_ASTERISK ? 6 : 12) +
        (closer.canOpen ? 3 : 0) +
        (closer.origdelims % 3);
      while (
        opener !== null &&
        opener !== stackBottom &&
        opener !== openersBottom[openersBottomIndex]
      ) {
        const oddMatch = (closer.canOpen || opener.canClose) &&
          closer.origdelims % 3 !== 0 &&
          (opener.origdelims + closer.origdelims) % 3 === 0;
        if (opener.cc === closer.cc && opener.canOpen && !oddMatch) {
          openerFound = true;
          break;
        }
        opener = opener.previous;
      }
      const oldCloser = closer;

      if (!openerFound || opener === null) {
        closer = closer.next;
        // Set lower bound for future searches for openers:
        openersBottom[openersBottomIndex] = oldCloser.previous;
        if (!oldCloser.canOpen) {
          // We can remove a closer that can't be an opener,
          // once we've seen there's no matching opener:
          this.removeDelimiter(oldCloser);
        }
        continue;
      }

      if (closer.cc === C_TILDE) {
        closer = this.strikethrough(opener, closer);
        continue;
      }

      // calculate actual number of delimiters used from closer
      const useDelims = closer.numdelims >= 2 && opener.numdelims >= 2 ? 2 : 1;
      const openerInl = opener.node;
      const closerInl = closer.node;

      // remove used delimiters from stack elts and inlines
      opener.numdelims -= useDelims;
      closer.numdelims -= useDelims;
      openerInl.literal = openerInl.literal.slice(0, openerInl.literal.length - useDelims);
      closerInl.literal = closerInl.literal.slice(0, closerInl.literal.length - useDelims);

      // build contents for new emph element
      const emph = new Node(useDelims === 1 ? "emphasis" : "strong");
      let tmp = openerInl.next;
      while (tmp && tmp !== closerInl) {
        const next: Node | null = tmp.next;
        tmp.unlink();
        emph.appendChild(tmp);
        tmp = next;
      }
      openerInl.insertAfter(emph);

      // remove elts between opener and closer in delimiters stack
      if (opener.next !== closer) {
        opener.next = closer;
        closer.previous = opener;
      }

      // if opener has 0 delims, remove it and the inline
      if (opener.numdelims === 0) {
        openerInl.unlink();
        this.removeDelimiter(opener);
      }

      if (closer.numdelims === 0) {
        closerInl.unlink();
        const tempstack = closer.next;
        this.removeDelimiter(closer);
        closer = tempstack;
      }
    }

    // remove all delimiters
    while (this.delimiters !== null && this.delimiters !== stackBottom) {
      this.removeDelimiter(this.delimiters);
    }
  }

  // Makes a strikethrough from a matched tilde opener and closer if their
  // runs have the same length, as cmark-gfm does, and removes them and the
  // delimiters between them from the stack. Returns the next closer.
  strikethrough(opener: Delimiter, closer: Delimiter): Delimiter | null {
    const next = closer.next;
    if (opener.numdelims === closer.numdelims) {
      const node = new Node("delete");
      let tmp = opener.node.next;
      while (tmp && tmp !== closer.node) {
        const following: Node | null = tmp.next;
        node.appendChild(tmp);
        tmp = following;
      }
      opener.node.insertAfter(node);
      opener.node.unlink();
      closer.node.unlink();
    }
    for (let delim: Delimiter | null = closer; delim !== null && delim !== opener; delim = delim.previous) {
      this.removeDelimiter(delim);
    }
    this.removeDelimiter(opener);
    return next;
  }

  // Attempt to parse link title (sans quotes), returning the string
  // or null if no match.
  parseLinkTitle(): string | null {
    const title = this.match(reLinkTitle);
    if (title === null) {
      return null;
    }
    // chop off quotes from title and unescape:
    return unescapeString(title.slice(1, -1));
  }

  // Attempt to parse link destination, returning the string or
  // null if no match.
  parseLinkDestination(): string | null {
    const res = this.match(reLinkDestinationBraces);
    if (res !== null) {
      // chop off surrounding <..>:
      return normalizeUri(unescapeString(res.slice(1, -1)));
    }
    if (this.peek() === C_LESSTHAN) {
      return null;
    }
    const savepos = this.pos;
    let openparens = 0;
    let c: number;
    while ((c = this.peek()) !== -1) {
      if (c === C_BACKSLASH && reEscapable.test(this.subject.charAt(this.pos + 1))) {
        this.pos += 1;
        if (this.peek() !== -1) {
          this.pos += 1;
        }
      } else if (c === C_OPEN_PAREN) {
        this.pos += 1;
        openparens += 1;
      } else if (c === C_CLOSE_PAREN) {
        if (openparens < 1) {
          break;
        }
        this.pos += 1;
        openparens -= 1;
      } else if (reWhitespaceChar.test(String.fromCharCode(c))) {
        break;
      } else {
        this.pos += 1;
      }
    }
    if (this.pos === savepos && c !== C_CLOSE_PAREN) {
      return null;
    }
    if (openparens !== 0) {
      return null;
    }
    return normalizeUri(unescapeString(this.subject.slice(savepos, this.pos)));
  }

  // Attempt to parse a link label, returning number of characters parsed.
  parseLinkLabel(): number {
    const m = this.match(reLinkLabel);
    return m === null || m.length > 1001 ? 0 : m.length;
  }

  // Add open bracket to delimiter stack and add a text node to block's children.
  parseOpenBracket(block: Node): boolean {
    const startpos = this.pos;
    this.pos += 1;
    const node = text("[");
    block.appendChild(node);
    // Add entry to stack for this opener
    this.addBracket(node, startpos, false);
    return true;
  }

  // If next character is [, add ! delimiter to delimiter stack and
  // add a text node to block's children. Otherwise just add a text node.
  parseBang(block: Node): boolean {
    const startpos = this.pos;
    this.pos += 1;
    // With gfm, `![^` is a `!` followed by a footnote reference, as in cmark-gfm.
    if (this.peek() === C_OPEN_BRACKET && !(this.gfm && this.subject.charCodeAt(this.pos + 1) === C_CARET)) {
      this.pos += 1;
      const node = text("![");
      block.appendChild(node);
      // Add entry to stack for this opener
      this.addBracket(node, startpos + 1, true);
    } else {
      block.appendChild(text("!"));
    }
    return true;
  }

  // Try to match close bracket against an opening in the delimiter
  // stack. Add either a link or image, or a plain [ character,
  // to block's children. If there is a matching delimiter,
  // remove it from the delimiter stack.
  parseCloseBracket(block: Node): boolean {
    let dest: string | null = null;
    let title: string | null = null;
    let matched = false;

    this.pos += 1;
    const startpos = this.pos;

    // get last [ or ![
    let opener = this.brackets;

    if (opener === null) {
      // no matched opener, just return a literal
      block.appendChild(text("]"));
      return true;
    }

    if (!opener.active) {
      // no matched opener, just return a literal
      block.appendChild(text("]"));
      // take opener off brackets stack
      this.removeBracket();
      return true;
    }

    // If we got here, open is a potential opener
    const isImage = opener.image;

    // Check to see if we have a link/image
    const savepos = this.pos;

    // Inline link?
    if (this.peek() === C_OPEN_PAREN) {
      this.pos++;
      if (
        this.spnl() &&
        (dest = this.parseLinkDestination()) !== null &&
        this.spnl() &&
        // make sure there's a space before the title:
        ((reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) &&
          (title = this.parseLinkTitle())) ||
          true) &&
        this.spnl() &&
        this.peek() === C_CLOSE_PAREN
      ) {
        this.pos += 1;
        matched = true;
      } else {
        this.pos = savepos;
      }
    }

    if (!matched) {
      // Next, see if there's a link label
      let reflabel: string | undefined;
      const beforelabel = this.pos;
      const n = this.parseLinkLabel();
      if (n > 2) {
        reflabel = this.subject.slice(beforelabel, beforelabel + n);
      } else if (!opener.bracketAfter) {
        // Empty or missing second label means to use the first label as the
        // reference. The reference must not contain a bracket. If we know
        // there's a bracket, we don't even bother checking it.
        reflabel = this.subject.slice(opener.index, startpos);
      }
      if (n === 0) {
        // If shortcut reference link, rewind before spaces we skipped.
        this.pos = savepos;
      }

      if (reflabel) {
        // lookup rawlabel in refmap
        const link = this.refmap.get(normalizeReference(reflabel));
        if (link) {
          dest = link.destination;
          title = link.title;
          matched = true;
        }
      }
    }

    if (!matched || dest === null) {
      if (this.gfm && this.parseFootnoteReference(opener, startpos)) {
        return true;
      }
      // no match
      this.removeBracket(); // remove this opener from stack
      this.pos = startpos;
      block.appendChild(text("]"));
      return true;
    }

    const node = new Node(isImage ? "image" : "link");
    node.destination = dest;
    node.title = title ?? "";

    let tmp = opener.node.next;
    while (tmp) {
      const next: Node | null = tmp.next;
      tmp.unlink();
      node.appendChild(tmp);
      tmp = next;
    }
    block.appendChild(node);
    this.processEmphasis(opener.previousDelimiter);
    this.removeBracket();
    opener.node.unlink();

    // We remove this bracket and processEmphasis will remove later delimiters.
    // Now, for a link, we also deactivate earlier link openers.
    // (no links in links)
    if (!isImage) {
      opener = this.brackets;
      while (opener !== null) {
        if (!opener.image) {
          opener.active = false; // deactivate this opener
        }
        opener = opener.previous;
      }
    }
    return true;
  }

  // With gfm, a bracket that isn't a link and whose text starts with `^` is a
  // footnote reference. As in cmark-gfm, its label is the raw text between
  // `[^` and `]`, and without a matching definition it becomes plain text.
  parseFootnoteReference(opener: Bracket, startpos: number): boolean {
    const first = opener.node.next;
    if (first === null || first.type !== "text" || first.literal[0] !== "^" || (first.literal.length === 1 && first.next === null)) {
      return false;
    }
    this.pos = startpos;
    const label = this.subject.slice(opener.index + 2, startpos - 1);
    this.processEmphasis(opener.previousDelimiter);
    this.removeBracket();
    while (opener.node.next) {
      opener.node.next.unlink();
    }
    let node: Node;
    if (this.footnotes.has(normalizeReference(`[${label}]`))) {
      node = new Node("footnoteReference");
      node.label = label;
    } else {
      node = text(`[^${label}]`);
    }
    opener.node.insertAfter(node);
    opener.node.unlink();
    return true;
  }

  addBracket(node: Node, index: number, image: boolean) {
    if (this.brackets !== null) {
      this.brackets.bracketAfter = true;
    }
    this.brackets = {
      node,
      previous: this.brackets,
      previousDelimiter: this.delimiters,
      index,
      image,
      active: true,
      bracketAfter: false
    };
  }

  removeBracket() {
    if (this.brackets !== null) {
      this.brackets = this.brackets.previous;
    }
  }

  // Attempt to parse an entity.
  parseEntity(block: Node): boolean {
    const m = this.match(reEntityHere);
    if (m === null) {
      return false;
    }
    block.appendChild(text(decodeEntity(m)));
    return true;
  }

  // Parse a run of ordinary characters, or a single character with
  // a special meaning in markdown, as a plain string.
  parseString(block: Node): boolean {
    const m = this.match(this.gfm ? reMainGfm : reMain);
    if (m === null) {
      return false;
    }
    block.appendChild(text(m));
    return true;
  }

  // Parse a newline. If it was preceded by two spaces, return a hard
  // line break; otherwise a soft line break.
  parseNewline(block: Node): boolean {
    this.pos += 1; // assume we're at a \n
    // check previous node for trailing spaces
    const lastc = block.lastChild;
    if (lastc && lastc.type === "text" && lastc.literal[lastc.literal.length - 1] === " ") {
      const hardbreak = lastc.literal[lastc.literal.length - 2] === " ";
      lastc.literal = lastc.literal.replace(reFinalSpace, "");
      block.appendChild(new Node(hardbreak ? "break" : "softbreak"));
    } else {
      block.appendChild(new Node("softbreak"));
    }
    this.match(reInitialSpace); // gobble leading spaces in next line
    return true;
  }

  // Attempt to parse a link reference, modifying refmap. Returns the number of
  // characters consumed, or 0 if there's no link reference definition.
  parseReference(s: string, refmap: RefMap): number {
    this.subject = s;
    this.pos = 0;
    let title: string | null = null;
    const startpos = this.pos;

    // label:
    const matchChars = this.parseLinkLabel();
    if (matchChars === 0) {
      return 0;
    }
    const rawlabel = this.subject.slice(0, matchChars);

    // colon:
    if (this.peek() === C_COLON) {
      this.pos++;
    } else {
      this.pos = startpos;
      return 0;
    }

    //  link url
    this.spnl();

    const dest = this.parseLinkDestination();
    if (dest === null) {
      this.pos = startpos;
      return 0;
    }

    const beforetitle = this.pos;
    this.spnl();
    if (this.pos !== beforetitle) {
      title = this.parseLinkTitle();
    }
    if (title === null) {
      // rewind before spaces
      this.pos = beforetitle;
    }

    // make sure we're at line end:
    let atLineEnd = true;
    if (this.match(reSpaceAtEndOfLine) === null) {
      if (title === null) {
        atLineEnd = false;
      } else {
        // the potential title we found is not at the line end,
        // but it could still be a legal link reference if we
        // discard the title
        title = null;
        // rewind before spaces
        this.pos = beforetitle;
        // and instead check if the link URL is at the line end
        atLineEnd = this.match(reSpaceAtEndOfLine) !== null;
      }
    }

    if (!atLineEnd) {
      this.pos = startpos;
      return 0;
    }

    const normlabel = normalizeReference(rawlabel);
    if (normlabel === "") {
      // label must contain non-whitespace characters
      this.pos = startpos;
      return 0;
    }

    if (!refmap.has(normlabel)) {
      refmap.set(normlabel, { destination: dest, title: title ?? "" });
    }
    return this.pos - startpos;
  }
}
