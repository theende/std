// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assert, assertRejects, assertThrows } from "@ende/assert";
import { NotFound } from "./unstable_errors.js";
import { makeTempDir, makeTempDirSync } from "./unstable_make_temp_dir.ts";
import { remove, removeSync } from "./unstable_remove.ts";
import { stat, statSync } from "./unstable_stat.ts";
import { join } from "@ende/path";

// Cleans up like `rm -rf`: the directory may already have been removed by the
// test itself.
async function forceRemove(path: string) {
  try {
    await Ende.remove(path, { recursive: true });
  } catch (e) {
    if (!(e instanceof NotFound))
      throw e;
  }
}

function forceRemoveSync(path: string) {
  try {
    Ende.removeSync(path, { recursive: true });
  } catch (e) {
    if (!(e instanceof NotFound))
      throw e;
  }
}

async function checkExists(path: string | URL) {
  try {
    const stated = await stat(path);
    return stated.isDirectory;
  } catch (e) {
    if (e instanceof NotFound) {
      return false;
    }
    throw e;
  }
}

function checkExistsSync(path: string | URL) {
  try {
    const stated = statSync(path);
    return stated.isDirectory;
  } catch (e) {
    if (e instanceof NotFound) {
      return false;
    }
    throw e;
  }
}

Ende.test(
  "remove() removes an existing and empty directory",
  async () => {
    const tempDir = await makeTempDir({ prefix: "remove_async_" });
    const existedCheck = await stat(tempDir);
    assert(existedCheck.isDirectory === true);

    try {
      await remove(tempDir);
      const existed = await checkExists(tempDir);
      assert(existed === false);
    } finally {
      await forceRemove(tempDir);
    }
  }
);

Ende.test("remove() remove a non empty directory", async () => {
  const tempDir1 = await makeTempDir({ prefix: "remove_async_" });
  const tempDir2 = await makeTempDir({
    dir: tempDir1,
    prefix: "remove_async_"
  });
  const testFile1 = join(tempDir1, "test.txt");
  const testFile2 = join(tempDir2, "test.txt");

  const encoder = new TextEncoder();
  const data = encoder.encode("This is a test content");
  await Ende.writeFile(testFile1, data, { mode: 0o777 });
  await Ende.writeFile(testFile2, data, { mode: 0o777 });

  try {
    await assertRejects(async () => {
      await remove(tempDir1);
    }, Error);

    await remove(tempDir1, { recursive: true });
    const existed = await checkExists(tempDir1);
    assert(existed === false);
  } finally {
    await forceRemove(tempDir1);
  }
});

Ende.test(
  "remove() remove a non existed directory",
  async () => {
    const tempDir = await makeTempDir({ prefix: "remove_async_" });
    const nonExistedDir = join(tempDir, "non", "existed", "dir");

    try {
      await assertRejects(async () => {
        await remove(nonExistedDir);
      }, NotFound);
      await remove(tempDir);
      const existed = await checkExists(tempDir);
      assert(existed === false);
    } finally {
      await forceRemove(tempDir);
    }
  }
);

Ende.test(
  "remove() remove a non existed directory with option",
  async () => {
    const tempDir = await makeTempDir({ prefix: "remove_async_" });
    const nonExistedDir = join(tempDir, "non", "existed", "dir");

    try {
      await assertRejects(async () => {
        await remove(nonExistedDir, { recursive: true });
      }, NotFound);
      await remove(tempDir);
      const existed = await checkExists(tempDir);
      assert(existed === false);
    } finally {
      await forceRemove(tempDir);
    }
  }
);

Ende.test(
  "removeSync() remove an existed and empty directory",
  () => {
    const tempDir = makeTempDirSync({ prefix: "remove_sync_" });
    assert(statSync(tempDir).isDirectory === true);

    try {
      removeSync(tempDir);
      assert(checkExistsSync(tempDir) === false);
    } finally {
      forceRemoveSync(tempDir);
    }
  }
);

Ende.test("removeSync() remove a non empty directory", () => {
  const tempDir1 = makeTempDirSync({ prefix: "remove_sync_" });
  const tempDir2 = makeTempDirSync({
    dir: tempDir1,
    prefix: "remove_async_"
  });
  const testFile1 = join(tempDir1, "test.txt");
  const testFile2 = join(tempDir2, "test.txt");

  const encoder = new TextEncoder();
  const data = encoder.encode("This is a test content");
  Ende.writeFileSync(testFile1, data, { mode: 0o777 });
  Ende.writeFileSync(testFile2, data, { mode: 0o777 });

  try {
    assertThrows(() => {
      removeSync(tempDir1);
    }, Error);

    removeSync(tempDir1, { recursive: true });
    assert(checkExistsSync(tempDir1) === false);
  } finally {
    forceRemoveSync(tempDir1);
  }
});

Ende.test("removeSync() remove a non existed directory", () => {
  const tempDir = makeTempDirSync({ prefix: "remove_sync_" });
  const nonExistedDir = join(tempDir, "non", "existed", "dir");

  try {
    assertThrows(() => {
      removeSync(nonExistedDir);
    }, NotFound);

    removeSync(tempDir, { recursive: true });
    assert(checkExistsSync(tempDir) === false);
  } finally {
    forceRemoveSync(tempDir);
  }
});

Ende.test("removeSync() remove a non existed directory with option", () => {
  const tempDir = makeTempDirSync({ prefix: "remove_sync_" });
  const nonExistedDir = join(tempDir, "non", "existed", "dir");

  try {
    assertThrows(() => {
      removeSync(nonExistedDir, { recursive: true });
    }, NotFound);

    removeSync(tempDir, { recursive: true });
    assert(checkExistsSync(tempDir) === false);
  } finally {
    forceRemoveSync(tempDir);
  }
});
