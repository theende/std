// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assert, assertRejects, assertThrows } from "@ende/assert";
import { stat, statSync } from "./unstable_stat.ts";
import { NotFound } from "./unstable_errors.js";

Ende.test("stat() and statSync() return FileInfo for a file", async () => {
  {
    const fileInfo = await stat("README.md");
    assert(fileInfo.isFile);
  }

  {
    const fileInfo = statSync("README.md");
    assert(fileInfo.isFile);
  }
});

Ende.test("stat() and statSync() return FileInfo for a directory", async () => {
  {
    const fileInfo = await stat("fs");
    assert(fileInfo.isDirectory);
  }
  {
    const fileInfo = statSync("fs");
    assert(fileInfo.isDirectory);
  }
});

Ende.test("stat() and statSync() throw with NotFound for a non-existent file", async () => {
  await assertRejects(async () => {
    await stat("non_existent_file");
  }, NotFound);
  assertThrows(() => {
    statSync("non_existent_file");
  }, NotFound);
});
