// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { extract } from "@ende/front-matter/any";
import { assertEquals } from "../assert/equals.ts";
import { assertThrows } from "../assert/throws.ts";

Ende.test("extract() handles yaml data", () => {
  const input = `---
  foo: bar
---
Hello, world!`;
  const actual = extract(input);
  const expected = {
    attrs: {
      foo: "bar"
    },
    body: "Hello, world!",
    frontMatter: "foo: bar"
  };
  assertEquals(actual, expected);
});

Ende.test("extract() handles toml data", () => {
  const input = `+++
  foo = "bar"
+++
Hello, world!`;
  const actual = extract(input);
  const expected = {
    attrs: {
      foo: "bar"
    },
    body: "Hello, world!",
    frontMatter: "foo = \"bar\""
  };
  assertEquals(actual, expected);
});

Ende.test("extract() handles json data", () => {
  const input = `---json
{
  "foo": "bar"
}
---
Hello, world!`;

  const actual = extract(input);
  const expected = {
    attrs: { foo: "bar" },
    body: "Hello, world!",
    frontMatter: "{\n  \"foo\": \"bar\"\n}"
  };
  assertEquals(actual, expected);
});

Ende.test("extract() throws on unsupported format", () => {
  const input = `---unsupported
  foo: bar
---
Hello, world!`;

  assertThrows(
    () => extract(input),
    TypeError,
    "Unsupported front matter format"
  );
});

Ende.test("extract() handles bom when recognizing format", () => {
  const actual = extract(
    `\ufeff---
  foo: bar
---
Hello, world!
`
  );
  const expected = {
    attrs: { foo: "bar" },
    body: "Hello, world!\n",
    frontMatter: "foo: bar"
  };
  assertEquals(actual, expected);
});
