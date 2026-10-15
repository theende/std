// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals, assertRejects, assertThrows } from "@ende/assert";
import { truncate, truncateSync } from "./unstable_truncate.ts";
import { NotFound } from "./unstable_errors.js";
import { join } from "@ende/path";

Ende.test("truncate() succeeds in truncating file sizes", async () => {
  const tempDataDir = await Ende.makeTempDir({ prefix: "truncate_" });
  const testFile = join(tempDataDir, "truncFile.txt");
  await Ende.writeTextFile(testFile, "Hello, Standard Library");

  await truncate(testFile, 30);
  assertEquals((await Ende.readFile(testFile)).length, 30);
  await truncate(testFile, 10);
  assertEquals((await Ende.readFile(testFile)).length, 10);
  await truncate(testFile, -5);
  assertEquals((await Ende.readFile(testFile)).length, 0);

  await Ende.remove(tempDataDir, { recursive: true });
});

Ende.test(
  "truncate() truncates the file to zero when 'len' is not provided",
  async () => {
    const tempDataDir = await Ende.makeTempDir({ prefix: "truncate_" });
    const testFile = join(tempDataDir, "truncFile.txt");
    await Ende.writeTextFile(testFile, "Hello, Standard Library");

    await truncate(testFile);
    assertEquals((await Ende.readFile(testFile)).length, 0);

    await Ende.remove(tempDataDir, { recursive: true });
  },
);

Ende.test("truncate() rejects with Error when passing a non-regular file", async () => {
  const tempDataDir = await Ende.makeTempDir({ prefix: "truncate_" });

  await assertRejects(async () => {
    await truncate(tempDataDir);
  }, Error);

  await Ende.remove(tempDataDir, { recursive: true });
});

Ende.test(
  "truncate() rejects with NotFound with a non-existent file",
  async () => {
    await assertRejects(async () => {
      await truncate("non-existent-file.txt");
    }, NotFound);
  },
);

Ende.test("truncateSync() succeeds in truncating file sizes", () => {
  const tempDataDir = Ende.makeTempDirSync({ prefix: "truncateSync_" });
  const testFile = join(tempDataDir, "truncFile.txt");
  Ende.writeTextFileSync(testFile, "Hello, Standard Library");

  truncateSync(testFile, 30);
  assertEquals((Ende.readFileSync(testFile)).length, 30);
  truncateSync(testFile, 10);
  assertEquals((Ende.readFileSync(testFile)).length, 10);
  truncateSync(testFile, -5);
  assertEquals((Ende.readFileSync(testFile)).length, 0);

  Ende.removeSync(tempDataDir, { recursive: true });
});

Ende.test(
  "truncateSync() truncates the file to zero when 'len' is not provided",
  () => {
    const tempDataDir = Ende.makeTempDirSync({ prefix: "truncateSync_" });
    const testFile = join(tempDataDir, "truncFile.txt");
    Ende.writeTextFileSync(testFile, "Hello, Standard Library");

    truncateSync(testFile);
    assertEquals((Ende.readFileSync(testFile)).length, 0);

    Ende.removeSync(tempDataDir, { recursive: true });
  },
);

Ende.test("truncateSync() throws with Error with a non-regular file", () => {
  const tempDataDir = Ende.makeTempDirSync({ prefix: "truncateSync_" });

  assertThrows(() => {
    truncateSync(tempDataDir);
  }, Error);

  Ende.removeSync(tempDataDir, { recursive: true });
});

Ende.test(
  "truncateSync() throws with NotFound with a non-existent file",
  () => {
    assertThrows(() => {
      truncateSync("non-existent-file.txt");
    }, NotFound);
  },
);
