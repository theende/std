// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals, assertRejects, assertThrows } from "@ende/assert";
import { readLink, readLinkSync } from "./unstable_read_link.ts";
import { NotFound } from "./unstable_errors.js";
import { join } from "@ende/path";

Ende.test("readLink() can read through symlink", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "readLink_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const symlinkFile = join(tempDirPath, "testFile.txt.link");

  await Ende.writeTextFile(testFile, "Hello, Standard Library");
  await Ende.symlink(testFile, symlinkFile);

  const realFile = await readLink(symlinkFile);
  assertEquals(testFile, realFile);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("readLink() rejects with Error when reading from a hard link", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "readLink_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const linkFile = join(tempDirPath, "testFile.txt.hlink");

  await Ende.writeTextFile(testFile, "Hello, Standard Library");
  await Ende.link(testFile, linkFile);

  await assertRejects(async () => {
    await readLink(linkFile);
  }, Error);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("readLink() rejects with NotFound when reading through a non-existent file", async () => {
  await assertRejects(async () => {
    await readLink("non-existent-file.txt.link");
  }, NotFound);
});

Ende.test("readLinkSync() can read through symlink", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "readLink_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const symlinkFile = join(tempDirPath, "testFile.txt.link");

  Ende.writeTextFileSync(testFile, "Hello, Standard Library");
  Ende.symlinkSync(testFile, symlinkFile);

  const realFile = readLinkSync(symlinkFile);
  assertEquals(testFile, realFile);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("readLinkSync() throws Error when reading from a hard link", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "readLinkSync_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const linkFile = join(tempDirPath, "testFile.txt.hlink");

  Ende.writeTextFileSync(testFile, "Hello, Standard Library!");
  Ende.linkSync(testFile, linkFile);

  assertThrows(() => {
    readLinkSync(linkFile);
  }, Error);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("readLinkSync() throws NotFound when reading through a non-existent file", () => {
  assertThrows(() => {
    readLinkSync("non-existent-file.txt.hlink");
  }, NotFound);
});
