// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assert, assertRejects, assertThrows } from "@ende/assert";
import { lessOrEqual, parse as parseSemver } from "@ende/semver";
import { rename, renameSync } from "./unstable_rename.ts";
import { NotFound } from "./unstable_errors.js";
import { join } from "@ende/path";

// In Ende 2.2.2 or earlier, the `rename` function has an issue on Windows.
const RENAME_HAS_ISSUE = Ende.version &&
  parseSemver(Ende.version.ende).build?.length === 0 && // not canary
  lessOrEqual(parseSemver(Ende.version.ende), parseSemver("2.2.2")) &&
  Ende.build.os === "windows";

/** Tests if the original file/directory is missing since the file is renamed. */
function assertMissing(path: string) {
  let caughtErr = false;
  let info;
  try {
    info = Ende.lstatSync(path);
  } catch (error) {
    caughtErr = true;
    assert(error instanceof NotFound, "error is not NotFound.");
  }
  assert(caughtErr);
  assert(info === undefined);
}

Ende.test("rename() renames a regular file", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const renameFile = join(tempDirPath, "renamedFile.txt");

  const testFh = await Ende.create(testFile);
  testFh.close();

  await rename(testFile, renameFile);
  assertMissing(testFile);
  const renameFileStat = await Ende.stat(renameFile);
  assert(renameFileStat.isFile);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("rename() rejects with Error when an existing regular file is renamed with an existing directory path", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const testDir = join(tempDirPath, "testDir");

  const tempFh = await Ende.create(testFile);
  tempFh.close();
  await Ende.mkdir(testDir);

  await assertRejects(async () => {
    await rename(testFile, testDir);
  }, Error);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("rename() rejects with Error when an existing directory is renamed with an existing directory containing a file", async () => {
  const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
  const emptyDir = join(tempDirPath, "emptyDir");
  const fullDir = join(tempDirPath, "fullDir");
  const testFile = join(fullDir, "testFile.txt");

  await Ende.mkdir(fullDir);
  await Ende.mkdir(emptyDir);
  const testFh = await Ende.create(testFile);
  testFh.close();

  await assertRejects(async () => {
    await rename(emptyDir, fullDir);
  }, Error);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test(
  "rename() succeeds when an existing directory is renamed with another directory path",
  { ignore: RENAME_HAS_ISSUE },
  async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
    const testDir = join(tempDirPath, "testDir");
    const anotherDir = join(tempDirPath, "anotherDir");

    await Ende.mkdir(testDir);
    await Ende.mkdir(anotherDir);

    await rename(testDir, anotherDir);
    assertMissing(testDir);
    const anotherDirStat = await Ende.stat(anotherDir);
    assert(anotherDirStat.isDirectory);

    await Ende.remove(tempDirPath, { recursive: true });
  }
);

Ende.test(
  "rename() rejects with Error when an existing directory is renamed with an existing regular file path",
  // TODO(kt3k): This test should pass on Windows
  { ignore: Ende.build.os === "windows" || RENAME_HAS_ISSUE },
  async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
    const testFile = join(tempDirPath, "testFile.txt");
    const testDir = join(tempDirPath, "testDir");

    const testFh = await Ende.create(testFile);
    testFh.close();
    await Ende.mkdir(testDir);

    await assertRejects(async () => {
      await rename(testDir, testFile);
    }, Error);

    await Ende.remove(tempDirPath, { recursive: true });
  }
);

Ende.test({
  name: "rename() rejects with Error when renaming an existing directory with a valid symlink'd regular file path",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
    const testDir = join(tempDirPath, "testDir");
    const testFile = join(tempDirPath, "testFile.txt");
    const symlinkFile = join(tempDirPath, "testFile.txt.link");

    await Ende.mkdir(testDir);
    const testFh = await Ende.create(testFile);
    testFh.close();
    await Ende.symlink(testFile, symlinkFile);

    await assertRejects(async () => {
      await rename(testDir, symlinkFile);
    }, Error);

    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "rename() rejects with Error when renaming an existing directory with a valid symlink'd directory path",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
    const testDir = join(tempDirPath, "testDir");
    const anotherDir = join(tempDirPath, "anotherDir");
    const symlinkDir = join(tempDirPath, "symlinkDir");

    await Ende.mkdir(testDir);
    await Ende.mkdir(anotherDir);
    await Ende.symlink(anotherDir, symlinkDir);

    await assertRejects(async () => {
      await rename(testDir, symlinkDir);
    }, Error);

    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "rename() rejects with Error when renaming an existing directory with a symlink'd file pointing to a non-existent file path",
  ignore: Ende.build.os === "windows",
  fn: async () => {
    const tempDirPath = await Ende.makeTempDir({ prefix: "rename_" });
    const testDir = join(tempDirPath, "testDir");
    const symlinkPath = join(tempDirPath, "symlinkPath");

    await Ende.mkdir(testDir);
    await Ende.symlink("non-existent", symlinkPath);

    await assertRejects(async () => {
      await rename(testDir, symlinkPath);
    }, Error);

    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("rename() rejects with NotFound for renaming a non-existent file", async () => {
  await assertRejects(async () => {
    await rename("non-existent-file.txt", "new-name.txt");
  }, NotFound);
});

Ende.test("renameSync() renames a regular file", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const renameFile = join(tempDirPath, "renamedFile.txt");

  const testFd = Ende.createSync(testFile);
  testFd.close();

  renameSync(testFile, renameFile);
  assertMissing(testFile);
  const renameFileStat = Ende.statSync(renameFile);
  assert(renameFileStat.isFile);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("renameSync() throws with Error when an existing regular file is renamed with an existing directory path", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const testDir = join(tempDirPath, "testDir");

  const testFd = Ende.createSync(testFile);
  testFd.close();
  Ende.mkdirSync(testDir);

  assertThrows(() => {
    renameSync(testFile, testDir);
  }, Error);
});

Ende.test("renameSync() throws with Error when an existing file path is renamed with an existing directory path", () => {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
  const testFile = join(tempDirPath, "testFile.txt");
  const testDir = join(tempDirPath, "testDir");

  const testFd = Ende.createSync(testFile);
  testFd.close();
  Ende.mkdirSync(testDir);

  assertThrows(() => {
    renameSync(testFile, testDir);
  }, Error);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test(
  "renameSync() throws with Error when an existing directory is renamed with an existing directory containing a file",
  { ignore: RENAME_HAS_ISSUE },
  () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
    const emptyDir = join(tempDirPath, "emptyDir");
    const fullDir = join(tempDirPath, "fullDir");
    const testFile = join(fullDir, "testFile.txt");

    Ende.mkdirSync(fullDir);
    Ende.mkdirSync(emptyDir);
    const testFd = Ende.createSync(testFile);
    testFd.close();

    assertThrows(() => {
      renameSync(emptyDir, fullDir);
    }, Error);

    Ende.removeSync(tempDirPath, { recursive: true });
  }
);

Ende.test(
  "renameSync() succeeds when an existing directory is renamed with another directory path",
  { ignore: RENAME_HAS_ISSUE },
  () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
    const testDir = join(tempDirPath, "testDir");
    const anotherDir = join(tempDirPath, "anotherDir");

    Ende.mkdirSync(testDir);
    Ende.mkdirSync(anotherDir);

    renameSync(testDir, anotherDir);
    assertMissing(testDir);
    const anotherDirStat = Ende.statSync(anotherDir);
    assert(anotherDirStat.isDirectory);

    Ende.removeSync(tempDirPath, { recursive: true });
  }
);

Ende.test(
  "renameSync() throws with Error when an existing directory is renamed with an existing regular file path",
  // TODO(kt3k): This test should pass on Windows
  { ignore: Ende.build.os === "windows" || RENAME_HAS_ISSUE },
  () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
    const testFile = join(tempDirPath, "testFile.txt");
    const testDir = join(tempDirPath, "testDir");

    const testFd = Ende.createSync(testFile);
    testFd.close();
    Ende.mkdirSync(testDir);

    assertThrows(() => {
      renameSync(testDir, testFile);
    }, Error);

    Ende.removeSync(tempDirPath, { recursive: true });
  }
);

Ende.test({
  name: "renameSync() throws with Error when renaming an existing directory with a valid symlink'd regular file path",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
    const testDir = join(tempDirPath, "testDir");
    const testFile = join(tempDirPath, "testFile.txt");
    const symlinkFile = join(tempDirPath, "testFile.txt.link");

    Ende.mkdirSync(testDir);
    const testFd = Ende.createSync(testFile);
    testFd.close();
    Ende.symlinkSync(testFile, symlinkFile);

    assertThrows(() => {
      renameSync(testDir, symlinkFile);
    }, Error);

    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "renameSync() throws with Error when renaming an existing directory with a valid symlink'd directory path",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
    const testDir = join(tempDirPath, "testDir");
    const anotherDir = join(tempDirPath, "anotherDir");
    const symlinkDir = join(tempDirPath, "symlinkDir");

    Ende.mkdirSync(testDir);
    Ende.mkdirSync(anotherDir);
    Ende.symlinkSync(anotherDir, symlinkDir);

    assertThrows(() => {
      renameSync(testDir, symlinkDir);
    }, Error);

    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test({
  name: "rename() rejects with Error when renaming an existing directory with a symlink'd file pointing to a non-existent file path",
  ignore: Ende.build.os === "windows",
  fn: () => {
    const tempDirPath = Ende.makeTempDirSync({ prefix: "renameSync_" });
    const testDir = join(tempDirPath, "testDir");
    const symlinkPath = join(tempDirPath, "symlinkPath");

    Ende.mkdirSync(testDir);
    Ende.symlinkSync("non-existent", symlinkPath);

    assertThrows(() => {
      renameSync(testDir, symlinkPath);
    }, Error);

    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("renameSync() throws with NotFound for renaming a non-existent file", () => {
  assertThrows(() => {
    renameSync("non-existent-file.txt", "new-name.txt");
  }, NotFound);
});
