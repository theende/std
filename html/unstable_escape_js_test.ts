// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { escapeJs } from "./unstable_escape_js.ts";
import { dedent } from "@ende/text/unstable-dedent";

Ende.test("escapeJs() escapes strings for <script> context", async t => {
  const testCases = [
    { input: "</script>", expected: String.raw`"\u003c/script>"` },
    { input: "<SCRIPT>", expected: String.raw`"\u003cSCRIPT>"` },
    { input: "<!-- ", expected: String.raw`"\u003c!-- "` },
    { input: "\u2028\u2029<>", expected: String.raw`"\u2028\u2029<>"` }
  ];

  for (const { input, expected } of testCases) {
    await t.step(JSON.stringify(input), () => {
      const result = escapeJs(input);
      assertEquals(result, expected);
    });
  }
});

Ende.test("escapeJs() escapes object for <script> context", async t => {
  const input = {
    foo: "</script>",
    bar: "<SCRIPT>",
    baz: "<!-- ",
    quux: "\u2028\u2029<>"
  };

  const expected = dedent`
    {
      "foo": "\\u003c/script>",
      "bar": "\\u003cSCRIPT>",
      "baz": "\\u003c!-- ",
      "quux": "\\u2028\\u2029<>"
    }
  `;

  await t.step(JSON.stringify(input), () => {
    const result = escapeJs(input, { space: 2 });
    assertEquals(result, expected);
  });
});
