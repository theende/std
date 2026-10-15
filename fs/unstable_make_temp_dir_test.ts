// Copyright 2018-2026 the Deno authors. MIT license.

import { assert, assertRejects, assertThrows } from "@ende/assert";
import { makeTempDir, makeTempDirSync } from "./unstable_make_temp_dir.ts";
import { NotFound } from "./unstable_errors.js";

Ende.test("makeTempDir() creates temporary directories in the default temp directory path", async () => {
  const dir1 = await makeTempDir({ prefix: "standard", suffix: "library" });
  const dir2 = await makeTempDir({ prefix: "standard", suffix: "library" });

  try {
    assert(dir1 !== dir2);

    for (const dir of [dir1, dir2]) {
      const tempDirName = dir.replace(/^.*[\\\/]/, "");
      assert(tempDirName.startsWith("standard"));
      assert(tempDirName.endsWith("library"));
    }
  } finally {
    await Ende.remove(dir1, { recursive: true });
    await Ende.remove(dir2, { recursive: true });
  }
});

Ende.test("makeTempDir() creates temporary directories with the 'dir' option", async () => {
  const tempParent = await makeTempDir({ prefix: "first", suffix: "last" });
  const dir = await makeTempDir({ dir: tempParent });

  try {
    assert(dir.startsWith(tempParent));
    assert(/^[\\\/]/.test(dir.slice(tempParent.length)));
  } finally {
    await Ende.remove(tempParent, { recursive: true });
  }
});

Ende.test("makeTempDir() rejects with NotFound when passing a 'dir' path that does not exist", async () => {
  await assertRejects(async () => {
    await makeTempDir({ dir: "/non-existent-dir" });
  }, NotFound);
});

Ende.test("makeTempDirSync() creates temporary directories in the default temp directory path", () => {
  const dir1 = makeTempDirSync({ prefix: "standard", suffix: "library" });
  const dir2 = makeTempDirSync({ prefix: "standard", suffix: "library" });

  try {
    assert(dir1 !== dir2);

    for (const dir of [dir1, dir2]) {
      const tempDirName = dir.replace(/^.*[\\\/]/, "");
      assert(tempDirName.startsWith("standard"));
      assert(tempDirName.endsWith("library"));
    }
  } finally {
    Ende.removeSync(dir1, { recursive: true });
    Ende.removeSync(dir2, { recursive: true });
  }
});

Ende.test("makeTempDirSync() creates temporary directories with the 'dir' option", () => {
  const tempParent = makeTempDirSync({ prefix: "first", suffix: "last" });
  const dir = makeTempDirSync({ dir: tempParent });

  try {
    assert(dir.startsWith(tempParent));
    assert(/^[\\\/]/.test(dir.slice(tempParent.length)));
  } finally {
    Ende.removeSync(tempParent, { recursive: true });
  }
});

Ende.test("makeTempDirSync() throws with NotFound when passing a 'dir' path that does not exist", () => {
  assertThrows(() => {
    makeTempDirSync({ dir: "/non-existent-dir" });
  }, NotFound);
});
