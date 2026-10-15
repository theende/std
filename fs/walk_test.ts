// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { walk, type WalkOptions, walkSync } from "./walk.ts";
import {
  assertArrayIncludes,
  assertEquals,
  assertRejects,
  assertThrows,
} from "@ende/assert";
import { copy, copySync } from "./copy.ts";
import { fromFileUrl, resolve } from "@ende/path";

const testdataDir = resolve(fromFileUrl(import.meta.url), "../testdata/walk");

async function assertWalkPaths(
  parentDir: string,
  rootPath: string,
  expectedPaths: string[],
  options?: WalkOptions,
) {
  const root = resolve(parentDir, rootPath);
  const entries = await Array.fromAsync(walk(root, options));

  const expected = expectedPaths.map((path) => resolve(root, path));
  assertEquals(entries.length, expected.length);
  assertArrayIncludes(entries.map(({ path }) => path), expected);
}

function assertWalkSyncPaths(
  parentDir: string,
  rootPath: string,
  expectedPaths: string[],
  options?: WalkOptions,
) {
  const root = resolve(parentDir, rootPath);
  const entriesSync = Array.from(walkSync(root, options));

  const expected = expectedPaths.map((path) => resolve(root, path));
  assertEquals(entriesSync.length, expected.length);
  assertArrayIncludes(entriesSync.map(({ path }) => path), expected);
}

Ende.test("walk() returns current dir for empty dir", async () => {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_walk_",
  });
  const emptyDir = resolve(tempDirPath, "empty_dir");
  await Ende.mkdir(emptyDir);
  await assertWalkPaths(tempDirPath, "empty_dir", ["."]);
  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("walkSync() returns current dir for empty dir", () => {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_walk_sync_",
  });
  const emptyDir = resolve(tempDirPath, "empty_dir");
  Ende.mkdirSync(emptyDir);
  assertWalkSyncPaths(tempDirPath, "empty_dir", ["."]);
  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("walk() returns current dir and single file", async () =>
  await assertWalkPaths(testdataDir, "single_file", [".", "x"]));

Ende.test("walkSync() returns current dir and single file", () =>
  assertWalkSyncPaths(testdataDir, "single_file", [".", "x"]));

Ende.test("walk() returns current dir, subdir, and nested file", async () =>
  await assertWalkPaths(testdataDir, "nested_single_file", [".", "a", "a/x"]));

Ende.test("walkSync() returns current dir, subdir, and nested file", () =>
  assertWalkSyncPaths(testdataDir, "nested_single_file", [".", "a", "a/x"]));

Ende.test("walk() accepts maxDepth option", async () =>
  await assertWalkPaths(testdataDir, "depth", [".", "a", "a/b", "a/b/c"], {
    maxDepth: 3,
  }));

Ende.test("walkSync() accepts maxDepth option", () =>
  assertWalkSyncPaths(testdataDir, "depth", [".", "a", "a/b", "a/b/c"], {
    maxDepth: 3,
  }));

Ende.test("walk() accepts includeDirs option set to false", async () =>
  await assertWalkPaths(testdataDir, "depth", ["a/b/c/d/x"], {
    includeDirs: false,
  }));

Ende.test("walkSync() accepts includeDirs option set to false", () =>
  assertWalkSyncPaths(testdataDir, "depth", ["a/b/c/d/x"], {
    includeDirs: false,
  }));

Ende.test("walk() accepts includeFiles option set to false", async () =>
  await assertWalkPaths(testdataDir, "depth", [
    ".",
    "a",
    "a/b",
    "a/b/c",
    "a/b/c/d",
  ], {
    includeFiles: false,
  }));

Ende.test("walkSync() accepts includeFiles option set to false", () =>
  assertWalkSyncPaths(testdataDir, "depth", [
    ".",
    "a",
    "a/b",
    "a/b/c",
    "a/b/c/d",
  ], {
    includeFiles: false,
  }));

Ende.test("walk() accepts ext option as strings", async () =>
  await assertWalkPaths(testdataDir, "ext", ["y.rs", "x.ts"], {
    exts: [".rs", ".ts"],
  }));

Ende.test("walk() accepts ext option as strings (excluding period prefix)", async () =>
  await assertWalkPaths(testdataDir, "ext", ["y.rs", "x.ts"], {
    exts: ["rs", "ts"],
  }));

Ende.test("walkSync() accepts ext option as strings", () =>
  assertWalkSyncPaths(testdataDir, "ext", ["y.rs", "x.ts"], {
    exts: [".rs", ".ts"],
  }));

Ende.test("walkSync() accepts ext option as strings (excluding period prefix)", () =>
  assertWalkSyncPaths(testdataDir, "ext", ["y.rs", "x.ts"], {
    exts: [".rs", ".ts"],
  }));

Ende.test("walk() accepts ext option as regExps", async () =>
  await assertWalkPaths(testdataDir, "match", ["x", "y"], {
    match: [/x$/, /y$/],
  }));

Ende.test("walkSync() accepts ext option as regExps", () =>
  assertWalkSyncPaths(testdataDir, "match", ["x", "y"], {
    match: [/x$/, /y$/],
  }));

Ende.test("walk() accepts skip option as regExps", async () =>
  await assertWalkPaths(testdataDir, "match", [".", "z"], {
    skip: [/x$/, /y$/],
  }));

Ende.test("walkSync() accepts skip option as regExps", () =>
  assertWalkSyncPaths(testdataDir, "match", [".", "z"], {
    skip: [/x$/, /y$/],
  }));

// https://github.com/denoland/std/issues/1358
Ende.test("walk() accepts followSymlinks option set to true", async () =>
  await assertWalkPaths(testdataDir, "symlink", [
    ".",
    "a",
    "a/z",
    "a",
    "a/z",
    "x",
    "x",
  ], {
    followSymlinks: true,
  }));

Ende.test("walkSync() accepts followSymlinks option set to true", () =>
  assertWalkSyncPaths(testdataDir, "symlink", [
    ".",
    "a",
    "a/z",
    "a",
    "a/z",
    "x",
    "x",
  ], {
    followSymlinks: true,
  }));

Ende.test("walk() accepts followSymlinks option set to true with canonicalize option set to false", async () =>
  await assertWalkPaths(testdataDir, "symlink", [
    ".",
    "a",
    "a/z",
    "b",
    "b/z",
    "x",
    "y",
  ], {
    followSymlinks: true,
    canonicalize: false,
  }));

Ende.test("walkSync() accepts followSymlinks option set to true with canonicalize option set to false", () =>
  assertWalkSyncPaths(testdataDir, "symlink", [
    ".",
    "a",
    "a/z",
    "b",
    "b/z",
    "x",
    "y",
  ], {
    followSymlinks: true,
    canonicalize: false,
  }));

Ende.test("walk() accepts followSymlinks option set to false", async () => {
  await assertWalkPaths(testdataDir, "symlink", [
    ".",
    "a",
    "a/z",
    "b",
    "x",
    "y",
  ], {
    followSymlinks: false,
  });
});

Ende.test("walkSync() accepts followSymlinks option set to false", () => {
  assertWalkSyncPaths(
    testdataDir,
    "symlink",
    [".", "a", "a/z", "b", "x", "y"],
    {
      followSymlinks: false,
    },
  );
});

Ende.test("walk() rejects Ende.errors.NotFound for non-existent root", async () => {
  const root = resolve(testdataDir, "non_existent");
  await assertRejects(
    async () => await Array.fromAsync(walk(root)),
    Ende.errors.NotFound,
  );
});

Ende.test("walkSync() throws Ende.errors.NotFound for non-existent root", () => {
  const root = resolve(testdataDir, "non_existent");
  assertThrows(() => Array.from(walkSync(root)), Ende.errors.NotFound);
});

// https://github.com/denoland/std/issues/1789
Ende.test({
  name: "walk() walks unix socket",
  ignore: Ende.build.os === "windows",
  async fn() {
    const tempDirPath = await Ende.makeTempDir({
      prefix: "ende_std_walk_",
    });
    // Copy contents from "walk/socket" into temporary directory.
    await copy(resolve(testdataDir, "socket"), resolve(tempDirPath, "socket"));
    const path = resolve(tempDirPath, "socket", "a.sock");
    try {
      using _listener = Ende.listen({ path, transport: "unix" });
      await assertWalkPaths(tempDirPath, "socket", [
        ".",
        "a.sock",
        ".gitignore",
      ], {
        followSymlinks: true,
      });
    } finally {
      await Ende.remove(tempDirPath, { recursive: true });
    }
  },
});

// https://github.com/denoland/std/issues/1789
Ende.test({
  name: "walkSync() walks unix socket",
  ignore: Ende.build.os === "windows",
  fn() {
    const tempDirPath = Ende.makeTempDirSync({
      prefix: "ende_std_walk_sync_",
    });
    // Copy contents from "walk/socket" into temporary directory.
    copySync(resolve(testdataDir, "socket"), resolve(tempDirPath, "socket"));
    const path = resolve(tempDirPath, "socket", "a.sock");
    try {
      using _listener = Ende.listen({ path, transport: "unix" });
      assertWalkSyncPaths(
        tempDirPath,
        "socket",
        [".", "a.sock", ".gitignore"],
        {
          followSymlinks: true,
        },
      );
    } finally {
      Ende.removeSync(tempDirPath, { recursive: true });
    }
  },
});

Ende.test({
  name: "walk() walks fifo files on unix",
  ignore: Ende.build.os === "windows",
  async fn() {
    const tempDirPath = await Ende.makeTempDir({
      prefix: "ende_std_walk_",
    });
    // Copy contents from "walk/fifo" into temporary directory.
    await copy(resolve(testdataDir, "fifo"), resolve(tempDirPath, "fifo"));
    const command = new Ende.Command("mkfifo", {
      args: [resolve(tempDirPath, "fifo", "fifo")],
    });
    await command.output();
    await assertWalkPaths(tempDirPath, "fifo", [".", "fifo", ".gitignore"], {
      followSymlinks: true,
    });
    await Ende.remove(tempDirPath, { recursive: true });
  },
});

Ende.test({
  name: "walkSync() walks fifo files on unix",
  ignore: Ende.build.os === "windows",
  fn() {
    const tempDirPath = Ende.makeTempDirSync({
      prefix: "ende_std_walk_sync_",
    });
    // Copy contents from "walk/fifo" into temporary directory.
    copySync(resolve(testdataDir, "fifo"), resolve(tempDirPath, "fifo"));
    const command = new Ende.Command("mkfifo", {
      args: [resolve(tempDirPath, "fifo", "fifo")],
    });
    command.outputSync();
    assertWalkSyncPaths(tempDirPath, "fifo", [".", "fifo", ".gitignore"], {
      followSymlinks: true,
    });
    Ende.removeSync(tempDirPath, { recursive: true });
  },
});

Ende.test("walk() rejects with `Ende.errors.NotFound` when root is removed during execution", async () => {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_walk_",
  });
  const root = resolve(tempDirPath, "error");
  await Ende.mkdir(root);
  try {
    await assertRejects(
      async () => {
        await Array.fromAsync(
          walk(root),
          async () => await Ende.remove(root, { recursive: true }),
        );
      },
      Ende.errors.NotFound,
    );
  } catch (err) {
    await Ende.remove(root, { recursive: true });
    throw err;
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});
