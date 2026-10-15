// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import {
  assert,
  assertEquals,
  assertExists,
  assertRejects,
  assertThrows
} from "@ende/assert";
import { link, linkSync } from "./unstable_link.ts";
import { AlreadyExists, NotFound } from "./unstable_errors.js";
import { join } from "@ende/path";

Ende.test("link() creates a hard link to a file and mutate through hard link", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "link_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const linkFile = join(tempDirPath, "testFile.txt.hardlink");

  const helloWrite = "Hello";
  await Ende.writeTextFile(testFile, helloWrite);

  // Linux & Mac: A single file implicitly has 1 hard link count to an inode.
  if (Ende.build.os !== "windows") {
    const testFileStat = await Ende.stat(testFile);
    assertExists(testFileStat.nlink, "Hard link count is null");
    assert(testFileStat.nlink === 1);
  }

  // Make another hard link with `link` to the same file. (Linux & Mac - inode).
  await link(testFile, linkFile);

  // Linux & Mac: Count hard links.
  if (Ende.build.os !== "windows") {
    const testFileStat = await Ende.stat(testFile);
    assertExists(testFileStat.nlink, "Hard link count is null");
    assert(testFileStat.nlink === 2);
  }

  // Read test file content through the hard link.
  const helloRead = await Ende.readTextFile(linkFile);
  assertEquals(helloRead, helloWrite);

  // Overwrite file content through hard link and read through testFile.
  const stdWrite = "Standard Library";
  await Ende.writeTextFile(linkFile, stdWrite);
  const stdRead = await Ende.readTextFile(testFile);
  assertEquals(stdRead, stdWrite);

  // Remove testFile, count links, and check hard link properties.
  await Ende.remove(testFile);

  const linkFileStat = await Ende.stat(linkFile);
  assert(linkFileStat.isFile);
  assert(!linkFileStat.isSymlink);

  // Linux & Mac: Count hard links.
  if (Ende.build.os !== "windows") {
    assertExists(linkFileStat.nlink, "Hard link count is null");
    assert(linkFileStat.nlink === 1);
  }

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("link() rejects with AlreadyExists when hard linking with an existing path", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "link_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const anotherFile = join(tempDirPath, "anotherFile.txt");

  const testFh = await Ende.create(testFile);
  testFh.close();
  const anotherFh = await Ende.create(anotherFile);
  anotherFh.close();

  await assertRejects(async () => {
    await link(testFile, anotherFile);
  }, AlreadyExists);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("link() rejects with NotFound with a non-existent file", async () => {
  await assertRejects(async () => {
    await link("non-existent-file.txt", "non-existent-hard-link");
  }, NotFound);
});

Ende.test("linkSync() creates a hard link to a file and mutate through hard link", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "linkSync_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const linkFile = join(tempDirPath, "testFile.txt.hardlink");

  const helloWrite = "Hello";
  Ende.writeTextFileSync(testFile, helloWrite);

  // Linux & Mac: A single file implicitly has 1 hard link to an inode.
  if (Ende.build.os !== "windows") {
    const testFileStat = Ende.statSync(testFile);
    assertExists(testFileStat.nlink, "Hard link count is null");
    assert(testFileStat.nlink === 1);
  }

  // Make another hard link with `link` to the same inode.
  linkSync(testFile, linkFile);

  // Linux & Mac: Count hard links.
  if (Ende.build.os !== "windows") {
    const testFileStat = Ende.statSync(testFile);
    assertExists(testFileStat.nlink, "Hard link count is null");
    assert(testFileStat.nlink === 2);
  }

  // Read test file content through the hard link.
  const helloRead = Ende.readTextFileSync(linkFile);
  assertEquals(helloRead, helloWrite);

  // Overwrite file content through hard link and read through testFile.
  const stdWrite = "Standard Library";
  Ende.writeTextFileSync(linkFile, stdWrite);
  const stdRead = Ende.readTextFileSync(testFile);
  assertEquals(stdRead, stdWrite);

  // Remove testFile, count links, and check hard link properties.
  Ende.removeSync(testFile);

  const linkFileStat = Ende.statSync(linkFile);
  assert(linkFileStat.isFile);
  assert(!linkFileStat.isSymlink);

  // Linux & Mac: Count hard links.
  if (Ende.build.os !== "windows") {
    assertExists(linkFileStat.nlink, "Hard link count is null");
    assert(linkFileStat.nlink === 1);
  }

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("linkSync() throws with AlreadyExists when hard linking with an existing path", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "link_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const anotherFile = join(tempDirPath, "anotherFile.txt");

  const testFd = Ende.createSync(testFile);
  testFd.close();
  const anotherFd = Ende.createSync(anotherFile);
  anotherFd.close();

  assertThrows(() => {
    linkSync(testFile, anotherFile);
  }, AlreadyExists);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("linkSync() throws with NotFound with a non-existent file", () => {
  assertThrows(() => {
    linkSync("non-existent-file.txt", "non-existent-hard-link");
  }, NotFound);
});
