// Copyright Isaac Z. Schlueter and Contributors. All rights reserved. ISC license.
// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import { format } from "./format.ts";
import { parse } from "./parse.ts";

Ende.test("format()", async (t) => {
  const versions: [string, string][] = [
    ["0.0.0", "0.0.0"],
    ["1.2.3", "1.2.3"],
    ["1.2.3-pre", "1.2.3-pre"],
    ["1.2.3-pre.0", "1.2.3-pre.0"],
    ["1.2.3+b", "1.2.3+b"],
    ["1.2.3+b.0", "1.2.3+b.0"],
    ["1.2.3-pre.0+b.0", "1.2.3-pre.0+b.0"],
  ];

  for (const [version, expected] of versions) {
    await t.step({
      name: version,
      fn: () => {
        const v = parse(version)!;
        const actual = format(v);
        assertEquals(actual, expected);
      },
    });
  }
});
