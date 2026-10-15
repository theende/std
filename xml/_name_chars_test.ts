// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { isNameChar, isNameStartChar } from "./_name_chars.ts";

// =============================================================================
// NameStartChar Tests
// =============================================================================

Ende.test("isNameStartChar() returns true for ASCII letters", () => {
  // a-z
  for (let c = 0x61; c <= 0x7A; c++) {
    assertEquals(isNameStartChar(c), true, `a-z: U+${c.toString(16)}`);
  }
  // A-Z
  for (let c = 0x41; c <= 0x5A; c++) {
    assertEquals(isNameStartChar(c), true, `A-Z: U+${c.toString(16)}`);
  }
});

Ende.test("isNameStartChar() returns true for underscore and colon", () => {
  assertEquals(isNameStartChar(0x5F), true, "underscore _");
  assertEquals(isNameStartChar(0x3A), true, "colon :");
});

Ende.test("isNameStartChar() returns false for digits", () => {
  for (let c = 0x30; c <= 0x39; c++) {
    assertEquals(isNameStartChar(c), false, `digit: U+${c.toString(16)}`);
  }
});

Ende.test("isNameStartChar() returns false for hyphen and dot", () => {
  assertEquals(isNameStartChar(0x2D), false, "hyphen -");
  assertEquals(isNameStartChar(0x2E), false, "dot .");
});

Ende.test("isNameStartChar() returns false for ASCII invalid chars", () => {
  assertEquals(isNameStartChar(0x20), false, "space");
  assertEquals(isNameStartChar(0x21), false, "!");
  assertEquals(isNameStartChar(0x3C), false, "<");
  assertEquals(isNameStartChar(0x3E), false, ">");
  assertEquals(isNameStartChar(0x40), false, "@");
  assertEquals(isNameStartChar(0x5B), false, "[");
  assertEquals(isNameStartChar(0x7B), false, "{");
});

Ende.test("isNameStartChar() validates Latin-1 Supplement correctly", () => {
  // Valid: [#xC0-#xD6]
  assertEquals(isNameStartChar(0xC0), true, "À");
  assertEquals(isNameStartChar(0xD6), true, "Ö");

  // Invalid: #xD7 (×)
  assertEquals(isNameStartChar(0xD7), false, "× multiplication sign");

  // Valid: [#xD8-#xF6]
  assertEquals(isNameStartChar(0xD8), true, "Ø");
  assertEquals(isNameStartChar(0xF6), true, "ö");

  // Invalid: #xF7 (÷)
  assertEquals(isNameStartChar(0xF7), false, "÷ division sign");

  // Valid: [#xF8-#xFF]
  assertEquals(isNameStartChar(0xF8), true, "ø");
  assertEquals(isNameStartChar(0xFF), true, "ÿ");

  // Invalid: [#x80-#xBF]
  assertEquals(isNameStartChar(0x80), false, "control char 0x80");
  assertEquals(isNameStartChar(0xBF), false, "¿");
});

Ende.test("isNameStartChar() validates Unicode ranges correctly", () => {
  // [#x100-#x2FF] - Latin Extended
  assertEquals(isNameStartChar(0x100), true, "Ā");
  assertEquals(isNameStartChar(0x2FF), true, "end of Latin Extended");

  // [#x370-#x37D] | [#x37F-#x1FFF] - Greek, Cyrillic, etc.
  assertEquals(isNameStartChar(0x370), true, "Ͱ Greek");
  assertEquals(isNameStartChar(0x37D), true, "ͽ Greek");
  assertEquals(isNameStartChar(0x37E), false, "; Greek question mark");
  assertEquals(isNameStartChar(0x37F), true, "Ϳ Greek");
  assertEquals(isNameStartChar(0x391), true, "Α Greek Alpha");
  assertEquals(isNameStartChar(0x410), true, "А Cyrillic");

  // [#x200C-#x200D] - Zero-width joiners
  assertEquals(isNameStartChar(0x200C), true, "ZWNJ");
  assertEquals(isNameStartChar(0x200D), true, "ZWJ");
  assertEquals(isNameStartChar(0x200B), false, "ZWSP");

  // [#x3001-#xD7FF] - CJK
  assertEquals(isNameStartChar(0x3001), true, "、CJK punctuation");
  assertEquals(isNameStartChar(0x4E00), true, "一 CJK");
  assertEquals(isNameStartChar(0x9FFF), true, "鿿 CJK");

  // Invalid ranges
  assertEquals(isNameStartChar(0x2000), false, "En Quad");
  assertEquals(isNameStartChar(0x206F), false, "Nominal Digit Shapes");
});

Ende.test("isNameStartChar() validates astral planes", () => {
  // [#x10000-#xEFFFF]
  assertEquals(isNameStartChar(0x10000), true, "Linear B Syllable");
  assertEquals(isNameStartChar(0x1F600), true, "😀 emoji (in valid range)");
  assertEquals(isNameStartChar(0xEFFFF), true, "last valid astral");
  assertEquals(isNameStartChar(0xF0000), false, "Private Use Area");
});

// =============================================================================
// NameChar Tests
// =============================================================================

Ende.test("isNameChar() returns true for all NameStartChar", () => {
  // Sample of NameStartChar that should also be valid NameChar
  assertEquals(isNameChar(0x61), true, "a");
  assertEquals(isNameChar(0x5A), true, "Z");
  assertEquals(isNameChar(0x5F), true, "_");
  assertEquals(isNameChar(0x3A), true, ":");
  assertEquals(isNameChar(0xC0), true, "À");
  assertEquals(isNameChar(0x4E00), true, "一");
});

Ende.test("isNameChar() returns true for digits", () => {
  for (let c = 0x30; c <= 0x39; c++) {
    assertEquals(isNameChar(c), true, `digit: U+${c.toString(16)}`);
  }
});

Ende.test("isNameChar() returns true for hyphen and dot", () => {
  assertEquals(isNameChar(0x2D), true, "hyphen -");
  assertEquals(isNameChar(0x2E), true, "dot .");
});

Ende.test("isNameChar() returns true for middle dot", () => {
  assertEquals(isNameChar(0xB7), true, "· middle dot");
});

Ende.test("isNameChar() returns true for combining diacritical marks", () => {
  // [#x0300-#x036F]
  assertEquals(isNameChar(0x0300), true, "Combining Grave Accent");
  assertEquals(isNameChar(0x036F), true, "Combining Latin Small Letter X");
  assertEquals(isNameChar(0x0370), true, "Ͱ (is NameStartChar)");
});

Ende.test("isNameChar() returns true for undertie and character tie", () => {
  assertEquals(isNameChar(0x203F), true, "Undertie");
  assertEquals(isNameChar(0x2040), true, "Character Tie");
});

Ende.test("isNameChar() returns false for invalid chars", () => {
  assertEquals(isNameChar(0x20), false, "space");
  assertEquals(isNameChar(0x3C), false, "<");
  assertEquals(isNameChar(0x3E), false, ">");
  assertEquals(isNameChar(0xD7), false, "×");
  assertEquals(isNameChar(0xF7), false, "÷");
});

// =============================================================================
// Edge Cases
// =============================================================================

Ende.test("isNameStartChar() rejects control characters", () => {
  for (let c = 0; c < 0x20; c++) {
    assertEquals(
      isNameStartChar(c),
      false,
      `control char: U+${c.toString(16)}`
    );
  }
});

Ende.test("isNameChar() rejects control characters", () => {
  for (let c = 0; c < 0x20; c++) {
    assertEquals(isNameChar(c), false, `control char: U+${c.toString(16)}`);
  }
});

// =============================================================================
// Additional Coverage: Unicode Range Tests
// =============================================================================

Ende.test("isNameStartChar() validates Glagolitic and Extended Latin range", () => {
  // [#x2C00-#x2FEF] - Glagolitic, Latin Extended-C/D, Coptic, Georgian Supplement
  assertEquals(isNameStartChar(0x2C00), true, "Glagolitic Capital Azu");
  assertEquals(isNameStartChar(0x2C30), true, "Glagolitic Small Azu");
  assertEquals(isNameStartChar(0x2FEF), true, "end of range");
  assertEquals(
    isNameStartChar(0x2FF0),
    false,
    "after range - Ideographic Description"
  );
});

Ende.test("isNameStartChar() validates CJK Compatibility and Arabic Presentation Forms range", () => {
  // [#xF900-#xFDCF] | [#xFDF0-#xFFFD]
  assertEquals(isNameStartChar(0xF900), true, "CJK Compatibility start");
  assertEquals(
    isNameStartChar(0xFDCF),
    true,
    "Arabic Presentation Forms-A end"
  );
  assertEquals(isNameStartChar(0xFDD0), false, "non-character");
  assertEquals(isNameStartChar(0xFDEF), false, "non-character range");
  assertEquals(
    isNameStartChar(0xFDF0),
    true,
    "Arabic Presentation Forms-A restart"
  );
  assertEquals(isNameStartChar(0xFFFD), true, "Replacement Character");
  assertEquals(isNameStartChar(0xFFFE), false, "non-character");
});

Ende.test("isNameStartChar() validates Superscripts and Currency range", () => {
  // [#x2070-#x218F] - Superscripts, Currency, Letterlike, Number Forms
  assertEquals(isNameStartChar(0x2070), true, "Superscript zero");
  assertEquals(isNameStartChar(0x20AC), true, "Euro sign");
  assertEquals(isNameStartChar(0x2100), true, "Account of");
  assertEquals(isNameStartChar(0x218F), true, "end of Letterlike range");
  assertEquals(isNameStartChar(0x2190), false, "Arrow - outside range");
});

Ende.test("isNameChar() rejects characters not in any valid range", () => {
  // Tests line 111: return false in isUnicodeNameChar
  // Characters that are neither NameStartChar nor in the NameChar-only ranges
  assertEquals(isNameChar(0x2000), false, "En Quad - general punctuation");
  assertEquals(
    isNameChar(0x2010),
    false,
    "Hyphen (different from ASCII hyphen)"
  );
  assertEquals(isNameChar(0x2041), false, "after Character Tie");
  assertEquals(isNameChar(0x2050), false, "Close Up");
  assertEquals(isNameChar(0x2190), false, "Leftwards Arrow");
});
