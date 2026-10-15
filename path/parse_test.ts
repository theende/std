// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import * as windows from "./windows/mod.ts";

Ende.test("windows.parse() parses UNC root only path", () => {
  const parsed = windows.parse("\\\\server\\share");
  assertEquals<unknown>(parsed, {
    base: "\\",
    dir: "\\\\server\\share",
    ext: "",
    name: "",
    root: "\\\\server\\share",
  });
});
