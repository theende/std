// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// Copyright the Browserify authors. MIT License.

import { assertEquals } from "@ende/assert";
import * as path from "@ende/path";
import { isSamePath } from "./_is_same_path.ts";

Ende.test({
  name: "isSamePath() works correctly for win32",
  ignore: Ende.build.os !== "windows",
  fn() {
    const pairs: (string | URL | boolean)[][] = [
      ["", "", true],
      ["C:\\test", "C:\\test", true],
      ["C:\\test", "C:\\test\\test", false],
      ["C:\\test", path.toFileUrl("C:\\test"), true],
      ["C:\\test", path.toFileUrl("C:\\test\\test"), false]
    ];

    for (const p of pairs) {
      const src = p[0] as string | URL;
      const dest = p[1] as string | URL;
      const expected = p[2] as boolean;

      assertEquals(
        isSamePath(src, dest),
        expected,
        `'${src}' should ${expected ? "" : "not"} be the same as '${dest}'`
      );
    }
  }
});

Ende.test({
  name: "isSamePath() works correctly for posix",
  ignore: Ende.build.os === "windows",
  fn() {
    const pairs: (string | URL | boolean)[][] = [
      ["", "", true],
      ["/test", "/test/", true],
      ["/test", "/test/test", false],
      ["/test", "/test/test/..", true],
      ["/test", path.toFileUrl("/test"), true],
      ["/test", path.toFileUrl("/test/test"), false]
    ];

    for (const p of pairs) {
      const src = p[0] as string | URL;
      const dest = p[1] as string | URL;
      const expected = p[2] as boolean;

      assertEquals(
        isSamePath(src, dest),
        expected,
        `'${src}' should ${expected ? "" : "not"} be the same as '${dest}'`
      );
    }
  }
});
