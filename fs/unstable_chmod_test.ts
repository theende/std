// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import {
  assertEquals,
  assertExists,
  assertRejects,
  assertThrows
} from "@ende/assert";
import { chmod, chmodSync } from "./unstable_chmod.ts";
import { NotFound } from "./unstable_errors.js";
import { join, resolve } from "@ende/path";

Ende.test({
  name: "chmod() sets read only permission bits on regular files",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "chmod_" });
    const testFile = join(tempDirPath, "chmod_file.txt");
    const tempFh = await Ende.create(testFile);

    // Check initial testFile permissions are 0o644 (-rw-r--r--).
    const fileStatBefore = await Ende.stat(testFile);
    assertExists(fileStatBefore.mode, "mode property is null");
    assertEquals(fileStatBefore.mode & 0o644, 0o644);

    // Set testFile permission bits to read only, 0o444 (-r--r--r--).
    await chmod(testFile, 0o444);
    const fileStatAfter = await Ende.stat(testFile);
    assertExists(fileStatAfter.mode, "mode property is null");
    assertEquals(fileStatAfter.mode & 0o444, 0o444);

    tempFh.close();
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "chmod() sets read only permission bits on a directory",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "chmod_" });
    const testDir = resolve(tempDirPath, "testDir");
    await Ende.mkdir(testDir);

    // Check initial testDir permissions are 0o755 (drwxr-xr-x).
    const dirStatBefore = await Ende.stat(testDir);
    assertExists(dirStatBefore.mode, "mode property is null");
    assertEquals(dirStatBefore.mode & 0o755, 0o755);

    // Set testDir permission bits to read only to 0o444 (dr--r--r--).
    await chmod(testDir, 0o444);
    const dirStatAfter = await Ende.stat(testDir);
    assertExists(dirStatAfter.mode, "mode property is null");
    assertEquals(dirStatAfter.mode & 0o444, 0o444);

    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "chmod() sets write only permission bits of regular file via symlink",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "chmod_" });
    const testFile = resolve(tempDirPath, "chmod_file.txt");
    const testSymlink = resolve(tempDirPath, "chmod_file.txt.link");

    const tempFh = await Ende.create(testFile);
    await Ende.symlink(testFile, testSymlink);

    // Check initial testFile permission bits are 0o644 (-rw-r-xr-x) reading through testSymlink.
    const symlinkStatBefore = await Ende.stat(testSymlink);
    assertExists(symlinkStatBefore.mode, "mode property via symlink is null");
    assertEquals(symlinkStatBefore.mode & 0o644, 0o644);

    // Set write only permission bits of testFile through testSymlink to 0o222 (--w--w--w-).
    await chmod(testSymlink, 0o222);
    const symlinkStatAfter = await Ende.stat(testSymlink);
    assertExists(symlinkStatAfter.mode, "mode property via symlink is null");
    const fileStatAfter = await Ende.stat(testFile);
    assertExists(fileStatAfter.mode, "mode property via file is null");

    // Check if both regular file mode and the mode read through symlink are both write only.
    assertEquals(symlinkStatAfter.mode, fileStatAfter.mode);

    tempFh.close();
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("chmod() rejects with NotFound for a non-existent file", async () => {
  await assertRejects(async () => {
    await chmod("non_existent_file.txt", 0o644);
  }, NotFound);
});

Ende.test({
  name: "chmodSync() sets read-only permission bits on regular files",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "chmodSync_" });
    const testFile = resolve(tempDirPath, "chmod_file.txt");
    const tempFd = Ende.createSync(testFile);

    // Check initial testFile permissions are 0o644 (-rw-r--r--).
    const fileStatBefore = Ende.statSync(testFile);
    assertExists(fileStatBefore.mode, "mode property is null");
    assertEquals(fileStatBefore.mode & 0o644, 0o644);

    // Set testFile permission bits to read only, 0o444 (-r--r--r--).
    chmodSync(testFile, 0o444);
    const fileStatAfter = Ende.statSync(testFile);
    assertExists(fileStatAfter.mode, "mode property is null");
    assertEquals(fileStatAfter.mode & 0o444, 0o444);

    tempFd.close();
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "chmodSync() sets read-only permissions bits on directories",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "chmodSync_" });
    const testDir = resolve(tempDirPath, "testDir");
    Ende.mkdirSync(testDir);

    // Check initial testDir permissions are 0o755 (drwxr-xr-x).
    const dirStatBefore = Ende.statSync(testDir);
    assertExists(dirStatBefore.mode, "mode property is null");
    assertEquals(dirStatBefore.mode & 0o755, 0o755);

    // Set testDir permission bits to read only to 0o444 (dr--r--r--).
    chmodSync(testDir, 0o444);
    const dirStatAfter = Ende.statSync(testDir);
    assertExists(dirStatAfter.mode, "mode property is null");
    assertEquals(dirStatAfter.mode & 0o444, 0o444);

    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "chmodSync() sets write only permission on a regular file via symlink",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "chmodSync_" });
    const testFile = resolve(tempDirPath, "chmod_file.txt");
    const testSymlink = resolve(tempDirPath, "chmod_file.txt.link");

    const tempFd = Ende.createSync(testFile);
    Ende.symlinkSync(testFile, testSymlink);

    // Check initial testFile permission bits are 0o644 (-rw-r-xr-x) reading through testSymlink.
    const symlinkStatBefore = Ende.statSync(testSymlink);
    assertExists(symlinkStatBefore.mode, "mode property via symlink is null");
    assertEquals(symlinkStatBefore.mode & 0o644, 0o644);

    // Set write only permission bits of testFile through testSymlink to 0o222 (--w--w--w-).
    chmodSync(testSymlink, 0o222);
    const symlinkStatAfter = Ende.statSync(testSymlink);
    assertExists(symlinkStatAfter.mode, "mode property via symlink is null");
    const fileStatAfter = Ende.statSync(testFile);
    assertExists(fileStatAfter.mode, "mode property via file is null");

    // Check if both regular file mode and the mode read through symlink are both write only.
    assertEquals(symlinkStatAfter.mode, fileStatAfter.mode);

    tempFd.close();
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("chmodSync() throws with NotFound for a non-existent file", () => {
  assertThrows(() => {
    chmodSync("non_existent_file.txt", 0o644);
  }, NotFound);
});
