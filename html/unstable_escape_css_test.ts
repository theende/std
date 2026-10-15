// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { escapeCss } from "./unstable_escape_css.ts";
import { assertEquals } from "@ende/assert";

export const testCases = [
  { input: "", expected: "" },
  { input: "a", expected: "a" },
  { input: "A", expected: "A" },
  { input: "0", expected: String.raw`\30 ` },
  { input: "123", expected: String.raw`\31 23` },
  { input: "-123", expected: String.raw`-\31 23` },
  { input: "a-123", expected: "a-123" },
  { input: "a23", expected: "a23" },
  { input: "-", expected: String.raw`\-` },
  { input: "a-", expected: "a-" },
  { input: "_", expected: "_" },
  { input: " ", expected: String.raw`\ ` },
  { input: "\n", expected: String.raw`\a ` },
  { input: "\r", expected: String.raw`\d ` },
  { input: "\t", expected: String.raw`\9 ` },
  { input: "\f", expected: String.raw`\c ` },
  { input: "\v", expected: String.raw`\b ` },
  { input: "\0", expected: "\ufffd" },
  { input: "\ufffd", expected: "\ufffd" },
  { input: "\x01", expected: String.raw`\1 ` },
  { input: "\x1f", expected: String.raw`\1f ` },
  { input: "\x7f", expected: String.raw`\7f ` },
  { input: "文字", expected: "文字" },
  { input: "💩", expected: "💩" },
  { input: "\uffff", expected: "\uffff" },
  { input: "\u{10ffff}", expected: "\u{10ffff}" },
  {
    input: "<style>\r\n<!-- -->\r\n</style>",
    expected: String.raw`\<style\>\d \a \<\!--\ --\>\d \a \<\/style\>`,
  },
  {
    input:
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
    expected: String
      .raw`\ \!\"\#\$\%\&\'\(\)\*\+\,-\.\/0123456789\:\;\<\=\>\?\@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]\^_\`abcdefghijklmnopqrstuvwxyz\{\|\}\~`,
  },
];

Ende.test("escapeCss() gives same results as CSS.escape in browser", async (t) => {
  for (const { input, expected } of testCases) {
    await t.step(JSON.stringify(input), () => {
      const result = escapeCss(input);
      assertEquals(result, expected);
    });
  }
});
