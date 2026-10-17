// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.
//
// Ported from commonmark.js 0.31.2 (lib/common.js). `normalizeUri` is ported
// from mdurl 1.0.1 (lib/encode.js), Copyright (c) 2015 Vitaly Puzrin, Alex
// Kocharin. MIT license.
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

import entityList from "@ende/html/named-entity-list.json" with { type: "json" };

const C_BACKSLASH = 92;

export const ENTITY = "&(?:#x[a-f0-9]{1,6}|#[0-9]{1,7}|[a-z][a-z0-9]{1,31});";

const TAGNAME = "[A-Za-z][A-Za-z0-9-]*";
const ATTRIBUTENAME = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
const UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
const SINGLEQUOTEDVALUE = "'[^']*'";
const DOUBLEQUOTEDVALUE = "\"[^\"]*\"";
const ATTRIBUTEVALUE = `(?:${UNQUOTEDVALUE}|${SINGLEQUOTEDVALUE}|${DOUBLEQUOTEDVALUE})`;
const ATTRIBUTEVALUESPEC = `(?:\\s*=\\s*${ATTRIBUTEVALUE})`;
const ATTRIBUTE = `(?:\\s+${ATTRIBUTENAME}${ATTRIBUTEVALUESPEC}?)`;
export const OPENTAG = `<${TAGNAME}${ATTRIBUTE}*\\s*/?>`;
export const CLOSETAG = `</${TAGNAME}\\s*[>]`;
const HTMLCOMMENT = "<!-->|<!--->|<!--[\\s\\S]*?-->";
const PROCESSINGINSTRUCTION = "[<][?][\\s\\S]*?[?][>]";
const DECLARATION = "<![A-Za-z]+[^>]*>";
const CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
const HTMLTAG = `(?:${OPENTAG}|${CLOSETAG}|${HTMLCOMMENT}|${PROCESSINGINSTRUCTION}|${DECLARATION}|${CDATA})`;

/** Matches a raw HTML tag at the start of a string. */
export const reHtmlTag = new RegExp(`^${HTMLTAG}`);

export const ESCAPABLE = "[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]";

const reBackslashOrAmp = /[\\&]/;
const reEntityOrEscapedChar = new RegExp(`\\\\${ESCAPABLE}|${ENTITY}`, "gi");
const reXmlSpecial = /[&<>"]/g;

const namedEntities: Record<string, string> = entityList;

/**
 * Decodes one entity or numeric character reference, such as `&amp;` or
 * `&#x22;`. Returns the input unchanged if it names no known entity.
 */
export function decodeEntity(entity: string): string {
  if (entity[1] === "#") {
    const hex = entity[2] === "x" || entity[2] === "X";
    const codePoint = parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    // The spec replaces U+0000 and invalid code points with U+FFFD.
    if (
      codePoint === 0 ||
      codePoint > 0x10ffff ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff)
    ) {
      return "�";
    }
    return String.fromCodePoint(codePoint);
  }
  return namedEntities[entity] ?? entity;
}

function unescapeChar(s: string): string {
  return s.charCodeAt(0) === C_BACKSLASH ? s.charAt(1) : decodeEntity(s);
}

/** Replaces entities and backslash escapes with literal characters. */
export function unescapeString(s: string): string {
  return reBackslashOrAmp.test(s) ? s.replace(reEntityOrEscapedChar, unescapeChar) : s;
}

const URI_SAFE_CHARS = ";/?:@&=+$,-_.!~*'()#";
const reAlphanumeric = /^[0-9a-z]$/i;
const reHexPair = /^[0-9a-f]{2}$/i;

const encodeCache: string[] = [];
for (let i = 0; i < 128; i++) {
  const ch = String.fromCharCode(i);
  encodeCache.push(
    reAlphanumeric.test(ch) || URI_SAFE_CHARS.includes(ch) ? ch : `%${i.toString(16).toUpperCase().padStart(2, "0")}`
  );
}

/**
 * Percent-encodes characters that aren't allowed in a URI, leaving existing
 * `%XX` escapes alone.
 */
export function normalizeUri(uri: string): string {
  let result = "";
  for (let i = 0; i < uri.length; i++) {
    const code = uri.charCodeAt(i);
    if (code === 0x25 && i + 2 < uri.length && reHexPair.test(uri.slice(i + 1, i + 3))) {
      result += uri.slice(i, i + 3);
      i += 2;
    } else if (code < 128) {
      result += encodeCache[code];
    } else if (code >= 0xd800 && code <= 0xdfff) {
      const nextCode = uri.charCodeAt(i + 1);
      if (code <= 0xdbff && nextCode >= 0xdc00 && nextCode <= 0xdfff) {
        result += encodeURIComponent(uri.slice(i, i + 2));
        i++;
      } else {
        result += "%EF%BF%BD";
      }
    } else {
      result += encodeURIComponent(uri.charAt(i));
    }
  }
  return result;
}

function replaceUnsafeChar(s: string): string {
  switch (s) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    default:
      return "&quot;";
  }
}

/** Escapes `&`, `<`, `>` and `"` for HTML text and attribute values. */
export function escapeXml(s: string): string {
  return s.replace(reXmlSpecial, replaceUnsafeChar);
}
