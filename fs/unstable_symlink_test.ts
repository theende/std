// Copyright 2018-2026 the Deno authors. MIT license.

import { assert, assertRejects, assertThrows } from "@ende/assert";
import { symlink, symlinkSync } from "./unstable_symlink.ts";
import { AlreadyExists } from "./unstable_errors.js";
import { dirname, fromFileUrl, join, resolve } from "@ende/path";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const testdataDir = resolve(moduleDir, "testdata");

Ende.test("symlink() creates a link to a regular file", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "symlink_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const symlinkPath = join(tempDirPath, "testFile.txt.link");

  const tempFh = await Ende.create(testFile);
  await symlink(testFile, symlinkPath);

  const symlinkLstat = await Ende.lstat(symlinkPath);
  const fileStat = await Ende.stat(testFile);

  assert(symlinkLstat.isSymlink);
  assert(fileStat.isFile);

  tempFh.close();
  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("symlink() creates a link to a directory", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "symlink_" });
  const testDir = join(tempDirPath, "testDir");
  const symlinkPath = join(tempDirPath, "testDir.link");

  await Ende.mkdir(testDir);
  await symlink(testDir, symlinkPath);

  const symlinkLstat = await Ende.lstat(symlinkPath);
  const dirStat = await Ende.stat(testDir);

  assert(symlinkLstat.isSymlink);
  assert(dirStat.isDirectory);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test(
  "symlink() rejects with AlreadyExists for creating the same link path to the same file path",
  async () => {
    const existingFile = join(testdataDir, "0.ts");
    const existingSymlink = join(testdataDir, "0-link");

    await assertRejects(async () => {
      await symlink(existingFile, existingSymlink);
    }, AlreadyExists);
  },
);

Ende.test(
  "symlinkSync() creates a link to a regular file",
  () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "symlinkSync_" });
    const filePath = join(tempDirPath, "testFile.txt");
    const symlinkPath = join(tempDirPath, "testFile.txt.link");

    const tempFd = Ende.createSync(filePath);
    symlinkSync(filePath, symlinkPath);

    const symlinkLstat = Ende.lstatSync(symlinkPath);
    const fileStat = Ende.statSync(filePath);

    assert(symlinkLstat.isSymlink);
    assert(fileStat.isFile);

    tempFd.close();
    Ende.removeSync(tempDirPath, { recursive: true });
  },
);

Ende.test("symlinkSync() creates a link to a directory", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "symlinkSync_" });
  const testDir = join(tempDirPath, "testDir");
  const symlinkPath = join(tempDirPath, "testDir.link");

  Ende.mkdirSync(testDir);
  symlinkSync(testDir, symlinkPath);

  const symlinkLstat = Ende.lstatSync(symlinkPath);
  const dirStat = Ende.statSync(testDir);

  assert(symlinkLstat.isSymlink);
  assert(dirStat.isDirectory);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test(
  "symlinkSync() throws with AlreadyExists for creating the same link path to the same file path",
  () => {
    const existingFile = join(testdataDir, "0.ts");
    const existingSymlink = join(testdataDir, "0-link");

    assertThrows(() => {
      symlinkSync(existingFile, existingSymlink);
    }, AlreadyExists);
  },
);
