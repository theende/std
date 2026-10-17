// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import spec from "./testdata/spec.json" with { type: "json" };
import { parse } from "./parse.ts";
import { render } from "./render.ts";

// Every example in the CommonMark Spec 0.31.2, compared exactly. Heading ids
// aren't part of the spec's HTML.
for (const example of spec) {
  Ende.test(`CommonMark example ${example.example} (${example.section})`, () => {
    assertEquals(render(parse(example.markdown), { headingIds: false }), example.html);
  });
}
