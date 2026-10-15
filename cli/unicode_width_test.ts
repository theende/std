// Copyright 2018-2026 the Deno authors. MIT license.

import { unicodeWidth } from "./unicode_width.ts";
import { assertEquals } from "@ende/assert";

Ende.test("unicodeWidth()", async (t) => {
  await t.step("checks ASCII input", () => {
    const lorem =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

    assertEquals(unicodeWidth(lorem), lorem.length);
  });

  await t.step("checks CJK input", () => {
    const qianZiWen =
      "天地玄黃宇宙洪荒日月盈昃辰宿列張寒來暑往秋收冬藏閏餘成歲律呂調陽雲騰致雨露結爲霜金生麗水玉出崑岡劍號巨闕珠稱夜光果珍李柰菜重芥薑海鹹河淡鱗潛羽翔龍師火帝鳥官人皇始制文字乃服衣裳推位讓國有虞陶唐弔民伐罪周發殷湯坐朝問道垂拱平章愛育黎首臣伏戎羌遐邇壹體率賓歸王鳴鳳在樹白駒食場化被草木賴及萬方蓋此身髮四大五常恭惟鞠養豈敢毀傷女慕貞絜男效才良知過必改得能莫忘罔談彼短靡恃己長信使可覆器欲難量墨悲絲淬詩讚羔羊";

    assertEquals(unicodeWidth(qianZiWen), qianZiWen.length * 2);
  });

  const str = "á";

  await t.step("checks NFC normalized input", () => {
    const nfc = str.normalize("NFC");

    assertEquals(nfc.length, 1);
    assertEquals(unicodeWidth(nfc), 1);
  });

  await t.step("checks NFD normalized input", () => {
    const nfd = str.normalize("NFD");

    assertEquals(nfd.length, 2);
    assertEquals(unicodeWidth(nfd), 1);
  });

  await t.step("checks emoji input", () => {
    assertEquals(unicodeWidth("👩"), 2); // Woman
    assertEquals(unicodeWidth("🔬"), 2); // Microscope
    // Note: Returns 4 for the below case, following the upstream crate
    // `unicode_width`. Another possibility might be returning 2, which is what
    // `npm:string-width` returns.
    // See discussion at https://github.com/denoland/std/pull/3297#discussion_r1166289430
    assertEquals(unicodeWidth("👩‍🔬"), 4); // Woman Scientist
  });

  await t.step("checks escape sequences", () => {
    assertEquals(unicodeWidth("\0"), 0);
    assertEquals(unicodeWidth("\n"), 0);
    assertEquals(unicodeWidth("\r"), 0);
    assertEquals(unicodeWidth("\t"), 0);
  });

  await t.step("checks C1 controls", () => {
    assertEquals(unicodeWidth("\u0080"), 0);
    assertEquals(unicodeWidth("\u008A"), 0);
    assertEquals(unicodeWidth("\u0093"), 0);
    assertEquals(unicodeWidth("\u009F"), 0);
  });
});
