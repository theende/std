// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
  unreachable
} from "@ende/assert";
import { readFile, readFileSync } from "./unstable_read_file.ts";
import { NotFound } from "./unstable_errors.js";
import { dirname, fromFileUrl, join, resolve } from "@ende/path";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const testdataDir = resolve(moduleDir, "testdata");
const testFile = join(testdataDir, "copy_file.txt");

Ende.test("readFile() reads a file", async () => {
  const decoder = new TextDecoder("utf-8");
  const data = await readFile(testFile);

  assert(data.byteLength > 0);
  assertEquals(decoder.decode(data), "txt");
});

Ende.test("readFile() is called repeatedly", async () => {
  for (let i = 0; i < 256; i++) {
    await readFile(testFile);
  }
});

Ende.test("readFile() rejects with Error when reading a file path to a directory", async () => {
  await assertRejects(async () => {
    await readFile(testdataDir);
  }, Error);
});

Ende.test("readFile() handles an AbortSignal", async () => {
  const ac = new AbortController();
  queueMicrotask(() => ac.abort());

  const error = await assertRejects(async () => {
    await readFile(testFile, { signal: ac.signal });
  }, Error);
  assertEquals(error.name, "AbortError");
});

Ende.test(
  "readFile() handles an AbortSignal with a reason",
  async () => {
    const ac = new AbortController();
    const reasonErr = new Error();
    queueMicrotask(() => ac.abort(reasonErr));

    const error = await assertRejects(async () => {
      await readFile(testFile, { signal: ac.signal });
    }, Error);

    assertEquals(error, ac.signal.reason);
  }
);

Ende.test(
  "readFile() handles an AbortSignal with a primitive reason value",
  async () => {
    const ac = new AbortController();
    const reasonErr = "Some string";
    queueMicrotask(() => ac.abort(reasonErr));

    try {
      await readFile(testFile, { signal: ac.signal });
      unreachable();
    } catch (error) {
      assertEquals(error, ac.signal.reason);
    }
  }
);

Ende.test("readFile() handles cleanup of an AbortController", async () => {
  const ac = new AbortController();
  await readFile(testFile, { signal: ac.signal });
});

Ende.test("readFile() rejects with NotFound when reading from a non-existent file", async () => {
  await assertRejects(async () => {
    await readFile("non-existent-file.txt");
  }, NotFound);
});

Ende.test("readFileSync() reads a file", () => {
  const decoder = new TextDecoder("utf-8");
  const data = readFileSync(testFile);

  assert(data.byteLength > 0);
  assertEquals(decoder.decode(data), "txt");
});

Ende.test("readFileSync() is called repeatedly", () => {
  for (let i = 0; i < 256; i++) {
    readFileSync(testFile);
  }
});

Ende.test("readFileSync() throws with Error when reading a file path to a directory", () => {
  assertThrows(() => {
    readFileSync(testdataDir);
  }, Error);
});

Ende.test("readFileSync() throws with NotFound when reading from a non-existent file", () => {
  assertThrows(() => {
    readFileSync("non-existent-file.txt");
  }, NotFound);
});
