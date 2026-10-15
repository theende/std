// Copyright 2018-2026 the Deno authors. MIT license.
import { assert, assertRejects, assertThrows } from "@ende/assert";
import { utime, utimeSync } from "./unstable_utime.ts";
import { NotFound } from "./unstable_errors.js";

const now = new Date();
const filePath = "fs/testdata/copy_file.txt";

Ende.test("utime() change atime and mtime date", async () => {
  const fileBefore = Ende.statSync(filePath);

  await utime(filePath, now, now);

  const fileAfter = Ende.statSync(filePath);

  assert(fileBefore.atime != fileAfter.atime);
  assert(fileBefore.mtime != fileAfter.mtime);
});

Ende.test("utime() fail on NotFound file", async () => {
  const randomFile = "foo.txt";

  await assertRejects(async () => {
    await utime(randomFile, now, now);
  }, NotFound);
});

Ende.test("utimeSync() change atime and mtime data", () => {
  const fileBefore = Ende.statSync(filePath);

  utimeSync(filePath, now, now);

  const fileAfter = Ende.statSync(filePath);

  assert(fileBefore.atime != fileAfter.atime);
  assert(fileBefore.mtime != fileAfter.mtime);
});

Ende.test("utimeSync() fail on NotFound file", () => {
  const randomFile = "foo.txt";

  assertThrows(() => {
    utimeSync(randomFile, now, now);
  }, NotFound);
});
