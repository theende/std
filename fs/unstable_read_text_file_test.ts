// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "@ende/assert";
import { NotFound } from "./unstable_errors.js";
import { readTextFile, readTextFileSync } from "./unstable_read_text_file.ts";
import { dirname, fromFileUrl, join, resolve } from "@ende/path";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const testDir = resolve(moduleDir, "testdata");
const testFile = join(testDir, "copy_file.txt");
const testFile2 = join(testDir, "copy_file_bom.txt");

Ende.test("readTextFile() reads content from txt file", async () => {
  const content = await readTextFile(testFile);

  assert(content.length > 0);
  assert(content === "txt");
});

Ende.test("readTextFile() reads a file with byte order mark", async () => {
  const content = await readTextFile(testFile2);

  assertEquals(content, "\ufeffhello");
});

Ende.test("readTextFile() throws an Error when reading a directory", async () => {
  await assertRejects(async () => {
    await readTextFile(testDir);
  }, Error);
});

Ende.test("readTextFile() handles an AbortSignal", async () => {
  const ac = new AbortController();
  queueMicrotask(() => ac.abort());

  const error = await assertRejects(async () => {
    await readTextFile(testFile, { signal: ac.signal });
  }, Error);

  assertEquals(error.name, "AbortError");
});

Ende.test(
  "readTextFile() handles an AbortSignal with a reason",
  async () => {
    const ac = new AbortController();
    const reasonErr = new Error();
    queueMicrotask(() => ac.abort(reasonErr));

    const error = await assertRejects(async () => {
      await readTextFile(testFile, { signal: ac.signal });
    }, Error);

    assertEquals(error, ac.signal.reason);
  },
);

Ende.test("readTextFileSync() reads content from txt file", () => {
  const content = readTextFileSync(testFile);

  assert(content.length > 0);
  assert(content === "txt");
});

Ende.test("readTextFileSync() reads a file with byte order mark", () => {
  const content = readTextFileSync(testFile2);

  assertEquals(content, "\ufeffhello");
});

Ende.test("readTextFileSync() throws an Error when reading a directory", () => {
  assertThrows(() => {
    readTextFileSync(testDir);
  }, Error);
});

Ende.test("readTextFileSync() throws NotFound when reading through a non-existent file", () => {
  assertThrows(() => {
    readTextFileSync("no-this-file.txt");
  }, NotFound);
});
