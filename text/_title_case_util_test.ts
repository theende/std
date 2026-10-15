// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertLess } from "@ende/assert";
import {
  CACHE_MAX_SEGMENT_LENGTH,
  resolveOptions,
  titleCaseSegment,
} from "./_title_case_util.ts";

const DEFAULTS = resolveOptions();

Ende.test("titleCaseSegment() default options are same as expected", () => {
  assertEquals(DEFAULTS.locale.toString(), "und");
  assertEquals(DEFAULTS.trailingCase, "lower");
});

// https://github.com/unicode-org/icu4x/blob/21b7e1c0df/components/casemap/tests/conversions.rs
Ende.test("titleCaseSegment() passes ICU4X titlecase tests", () => {
  assertEquals(
    titleCaseSegment("I\u{307}", resolveOptions({ locale: "tr-TR" })),
    "I\u{307}",
  );

  // Basic case mapping
  assertEquals(titleCaseSegment("a", DEFAULTS), "A");
  assertEquals(titleCaseSegment("A", DEFAULTS), "A");
  // Case mapping of titlecase character

  assertEquals(titleCaseSegment("Ǆ", DEFAULTS), "ǅ");
  assertEquals(titleCaseSegment("ǅ", DEFAULTS), "ǅ");
  assertEquals(titleCaseSegment("ǆ", DEFAULTS), "ǅ");
  // Turkic case folding
  // Supplementary code points (Deseret)
  assertEquals(titleCaseSegment("𐐼", DEFAULTS), "𐐔");
  assertEquals(titleCaseSegment("𐐔", DEFAULTS), "𐐔");

  const ew = "և";
  const yerevan = "Երևանի";

  assertEquals(titleCaseSegment(ew, resolveOptions({ locale: "und" })), "Եւ");
  assertEquals(
    titleCaseSegment(yerevan, resolveOptions({ locale: "und" })),
    "Երևանի",
  );
  // V8's default ICU data doesn't include separate casings for `hy` vs `hyw`
  // assertEquals(titleCaseSegment(ew, resolveOptions({ locale: 'hy' })), "Եվ");
  assertEquals(
    titleCaseSegment(yerevan, resolveOptions({ locale: "hy" })),
    "Երևանի",
  );
  assertEquals(titleCaseSegment(ew, resolveOptions({ locale: "hyw" })), "Եւ");
  assertEquals(
    titleCaseSegment(yerevan, resolveOptions({ locale: "hyw" })),
    "Երևանի",
  );

  assertEquals(
    titleCaseSegment("ijssel", resolveOptions({ locale: "nl" })),
    "IJssel",
  );
  assertEquals(
    titleCaseSegment("igloo", resolveOptions({ locale: "nl" })),
    "Igloo",
  );
  assertEquals(
    titleCaseSegment("IJMUIDEN", resolveOptions({ locale: "nl" })),
    "IJmuiden",
  );

  assertEquals(titleCaseSegment("ij", resolveOptions({ locale: "nl" })), "IJ");
  assertEquals(titleCaseSegment("IJ", resolveOptions({ locale: "nl" })), "IJ");
  assertEquals(titleCaseSegment("íj́", resolveOptions({ locale: "nl" })), "ÍJ́");
  assertEquals(titleCaseSegment("ÍJ́", resolveOptions({ locale: "nl" })), "ÍJ́");
  assertEquals(titleCaseSegment("íJ́", resolveOptions({ locale: "nl" })), "ÍJ́");
  assertEquals(titleCaseSegment("Ij́", resolveOptions({ locale: "nl" })), "Ij́");
  assertEquals(titleCaseSegment("ij́", resolveOptions({ locale: "nl" })), "Ij́");
  assertEquals(titleCaseSegment("ïj́", resolveOptions({ locale: "nl" })), "Ïj́");
  assertEquals(
    titleCaseSegment("íj\u{308}", resolveOptions({ locale: "nl" })),
    "Íj\u{308}",
  );
  assertEquals(
    titleCaseSegment("íj́\u{1D16E}", resolveOptions({ locale: "nl" })),
    "Íj́\u{1D16E}",
  );
  assertEquals(
    titleCaseSegment("íj\u{1ABE}", resolveOptions({ locale: "nl" })),
    "Íj\u{1ABE}",
  );

  assertEquals(
    titleCaseSegment("ijabc", resolveOptions({ locale: "nl" })),
    "IJabc",
  );
  assertEquals(
    titleCaseSegment("IJabc", resolveOptions({ locale: "nl" })),
    "IJabc",
  );
  assertEquals(
    titleCaseSegment("íj́abc", resolveOptions({ locale: "nl" })),
    "ÍJ́abc",
  );
  assertEquals(
    titleCaseSegment("íj́abc\u{1D16E}", resolveOptions({ locale: "nl" })),
    "ÍJ́abc\u{1D16E}",
  );
  assertEquals(
    titleCaseSegment("íjabc\u{1ABE}", resolveOptions({ locale: "nl" })),
    "Íjabc\u{1ABE}",
  );

  // digraph version isn't actually special-cased, as there's no title-case mapping for this char
  assertEquals(titleCaseSegment("ĳ", resolveOptions({ locale: "nl" })), "Ĳ");
  assertEquals(titleCaseSegment("ĳ", DEFAULTS), "Ĳ");
});

// https://unicode-org.github.io/icu-docs/apidoc/released/icu4j/com/ibm/icu/text/CaseMap.Title.html#adjustToCased--
Ende.test("titleCaseSegment() adjusts the index for casing first char properly", () => {
  assertEquals(titleCaseSegment("49ers", DEFAULTS), "49ers");
  assertEquals(titleCaseSegment("丰(abc)", DEFAULTS), "丰(abc)");

  assertEquals(titleCaseSegment(".a", DEFAULTS), ".A");

  assertEquals(
    titleCaseSegment(".ijx", resolveOptions({ locale: "nl" })),
    ".IJx",
  );
  assertEquals(
    titleCaseSegment("1ijx", resolveOptions({ locale: "nl" })),
    "1ijx",
  );
});

Ende.test("titleCaseSegment() handles lone U+0345 Combining Greek Ypogegrammeni", () => {
  // The only char that matches `\p{Cased}` but not `[\p{Letter}\p{Number}\p{Symbol}\p{Private_Use}]`.
  // Not really clear whether it ought to return itself unchanged or be converted to uppercase Iota (ICU4X leaves it
  // unchanged in title case), but as it's an extreme edge case that doesn't occur alone in normal text, any
  // non-throwing behavior is probably fine.
  assertEquals(titleCaseSegment("\u{345}", DEFAULTS), "\u{345}");
});

Ende.test("titleCaseSegment() has a max cache size", () => {
  const cache = new Map<string, string>();
  // "widest" possible options for cache key
  const opts = resolveOptions({
    locale: "yue-Hant-419",
    trailingCase: "unchanged",
  });
  for (let i = 0; cache.size === i; ++i) {
    const str = String(i).padStart(CACHE_MAX_SEGMENT_LENGTH, "0");
    titleCaseSegment(str, opts, cache);
  }
  // 2 bytes per UTF-16 internal char
  const approxSize = JSON.stringify(Object.fromEntries(cache)).length * 2;
  // < 5 MB (current actual size is ~ 1 MB)
  assertLess(approxSize, 5_000_000);
});
