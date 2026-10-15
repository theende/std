// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// TODO(axetroy): Add test for Windows once symlink is implemented for Windows.
import {
  assert,
  assertEquals,
  assertMatch,
  assertRejects,
  assertThrows,
} from "@ende/assert";
import * as path from "@ende/path";
import { ensureSymlink, ensureSymlinkSync } from "./ensure_symlink.ts";

const moduleDir = path.dirname(path.fromFileUrl(import.meta.url));
const testdataDir = path.resolve(moduleDir, "testdata");

Ende.test("ensureSymlink() rejects if file does not exist", async function () {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_symlink_",
  });
  const testDir = path.join(tempDirPath, "link_file_1");
  const testFile = path.join(testDir, "test.txt");

  await assertRejects(
    async () => {
      await ensureSymlink(testFile, path.join(testDir, "test1.txt"));
    },
  );

  await assertRejects(
    async () => {
      await Ende.stat(testFile).then(() => {
        throw new Error("test file should exist.");
      });
    },
  );

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlinkSync() throws if file does not exist", function () {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_symlink_sync_",
  });
  const testDir = path.join(tempDirPath, "link_file_2");
  const testFile = path.join(testDir, "test.txt");

  assertThrows(() => {
    ensureSymlinkSync(testFile, path.join(testDir, "test1.txt"));
  });

  assertThrows(() => {
    Ende.statSync(testFile);
    throw new Error("test file should exist.");
  });

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlink() ensures linkName links to target", async function () {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_symlink_",
  });
  const testDir = path.join(tempDirPath, "link_file_3");
  const testFile = path.join(testDir, "test.txt");
  const linkFile = path.join(testDir, "link.txt");

  await Ende.mkdir(testDir, { recursive: true });
  await Ende.writeFile(testFile, new Uint8Array());

  await ensureSymlink(testFile, linkFile);
  await ensureSymlink(testFile, linkFile);

  const srcStat = await Ende.lstat(testFile);
  const linkStat = await Ende.lstat(linkFile);

  assertEquals(srcStat.isFile, true);
  assertEquals(linkStat.isSymlink, true);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlinkSync() ensures linkName links to target", function () {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_symlink_sync_",
  });
  const testDir = path.join(tempDirPath, "link_file_4");
  const testFile = path.join(testDir, "test.txt");
  const linkFile = path.join(testDir, "link.txt");

  Ende.mkdirSync(testDir, { recursive: true });
  Ende.writeFileSync(testFile, new Uint8Array());

  ensureSymlinkSync(testFile, linkFile);
  ensureSymlinkSync(testFile, linkFile);

  const srcStat = Ende.lstatSync(testFile);
  const linkStat = Ende.lstatSync(linkFile);

  assertEquals(srcStat.isFile, true);
  assertEquals(linkStat.isSymlink, true);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlink() rejects if the linkName path already exist", async function () {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_symlink_",
  });
  const testDir = path.join(tempDirPath, "link_file_5");
  const linkFile = path.join(testDir, "test.txt");
  const linkDir = path.join(testDir, "test_dir");
  const linkSymlink = path.join(testDir, "test_symlink");
  const targetFile = path.join(testDir, "target.txt");

  await Ende.mkdir(testDir, { recursive: true });
  await Ende.writeTextFile(linkFile, "linkFile");
  await Ende.mkdir(linkDir);
  await Ende.symlink("non-existent", linkSymlink, { type: "file" });
  await Ende.writeTextFile(targetFile, "targetFile");

  await assertRejects(
    async () => {
      await ensureSymlink(targetFile, linkFile);
    },
  );
  await assertRejects(
    async () => {
      await ensureSymlink(targetFile, linkDir);
    },
  );
  await assertRejects(
    async () => {
      await ensureSymlink(targetFile, linkSymlink);
    },
  );

  assertEquals(await Ende.readTextFile(linkFile), "linkFile");
  assertEquals((await Ende.stat(linkDir)).isDirectory, true);
  assertEquals(await Ende.readLink(linkSymlink), "non-existent");
  assertEquals(await Ende.readTextFile(targetFile), "targetFile");

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlinkSync() throws if the linkName path already exist", function () {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_symlink_sync_",
  });
  const testDir = path.join(tempDirPath, "link_file_6");
  const linkFile = path.join(testDir, "test.txt");
  const linkDir = path.join(testDir, "test_dir");
  const linkSymlink = path.join(testDir, "test_symlink");
  const targetFile = path.join(testDir, "target.txt");

  Ende.mkdirSync(testDir, { recursive: true });
  Ende.writeTextFileSync(linkFile, "linkFile");
  Ende.mkdirSync(linkDir);
  Ende.symlinkSync("non-existent", linkSymlink, { type: "file" });
  Ende.writeTextFileSync(targetFile, "targetFile");

  assertThrows(() => {
    ensureSymlinkSync(targetFile, linkFile);
  });
  assertThrows(() => {
    ensureSymlinkSync(targetFile, linkDir);
  });
  assertThrows(() => {
    ensureSymlinkSync(targetFile, linkSymlink);
  });

  assertEquals(Ende.readTextFileSync(linkFile), "linkFile");
  assertEquals(Ende.statSync(linkDir).isDirectory, true);
  assertEquals(Ende.readLinkSync(linkSymlink), "non-existent");
  assertEquals(Ende.readTextFileSync(targetFile), "targetFile");

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlink() ensures dir linkName links to dir target", async function () {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_symlink_",
  });
  const testDir = path.join(tempDirPath, "link_file_origin_3");
  const linkDir = path.join(tempDirPath, "link_file_link_3");
  const testFile = path.join(testDir, "test.txt");

  await Ende.mkdir(testDir, { recursive: true });
  await Ende.writeFile(testFile, new Uint8Array());

  await ensureSymlink(testDir, linkDir);
  await ensureSymlink(testDir, linkDir);

  const testDirStat = await Ende.lstat(testDir);
  const linkDirStat = await Ende.lstat(linkDir);
  const testFileStat = await Ende.lstat(testFile);

  assertEquals(testFileStat.isFile, true);
  assertEquals(testDirStat.isDirectory, true);
  assertEquals(linkDirStat.isSymlink, true);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlinkSync() ensures dir linkName links to dir target", function () {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_symlink_sync_",
  });
  const testDir = path.join(tempDirPath, "link_file_origin_3");
  const linkDir = path.join(tempDirPath, "link_file_link_3");
  const testFile = path.join(testDir, "test.txt");

  Ende.mkdirSync(testDir, { recursive: true });
  Ende.writeFileSync(testFile, new Uint8Array());

  ensureSymlinkSync(testDir, linkDir);
  ensureSymlinkSync(testDir, linkDir);

  const testDirStat = Ende.lstatSync(testDir);
  const linkDirStat = Ende.lstatSync(linkDir);
  const testFileStat = Ende.lstatSync(testFile);

  assertEquals(testFileStat.isFile, true);
  assertEquals(testDirStat.isDirectory, true);
  assertEquals(linkDirStat.isSymlink, true);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlink() creates symlink with relative target", async function () {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_symlink_",
  });
  const testDir = path.join(tempDirPath, "symlink-relative");
  const testLinkName = path.join(testDir, "link.txt");
  const testFile = path.join(testDir, "target.txt");

  await Ende.mkdir(testDir);

  await Ende.writeFile(testFile, new Uint8Array());

  await ensureSymlink("target.txt", testLinkName);

  const testDirStat = await Ende.lstat(testDir);
  const linkDirStat = await Ende.lstat(testLinkName);
  const testFileStat = await Ende.lstat(testFile);

  assertEquals(testFileStat.isFile, true);
  assertEquals(testDirStat.isDirectory, true);
  assertEquals(linkDirStat.isSymlink, true);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlinkSync() creates symlink with relative target", function () {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_symlink_sync_",
  });
  const testDir = path.join(tempDirPath, "symlink-relative-sync");
  const testLinkName = path.join(testDir, "link.txt");
  const testFile = path.join(testDir, "target.txt");

  Ende.mkdirSync(testDir);

  Ende.writeFileSync(testFile, new Uint8Array());

  ensureSymlinkSync("target.txt", testLinkName);

  const testDirStat = Ende.lstatSync(testDir);
  const linkDirStat = Ende.lstatSync(testLinkName);
  const testFileStat = Ende.lstatSync(testFile);

  assertEquals(testFileStat.isFile, true);
  assertEquals(testDirStat.isDirectory, true);
  assertEquals(linkDirStat.isSymlink, true);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("ensureSymlink() rejects when the target path doesn't exist", async () => {
  const e = await assertRejects(
    async () => {
      await ensureSymlink("non-existent-target", "non-existent-link");
    },
    Ende.errors.NotFound,
  );
  assertMatch(
    e.message,
    /^Cannot ensure symlink as the target path does not exist: .*non-existent-target$/,
  );
});

Ende.test("ensureSymlinkSync() throws when the target path doesn't exist", () => {
  const e = assertThrows(() => {
    ensureSymlinkSync("non-existent-target", "non-existent-link");
  }, Ende.errors.NotFound);
  assertMatch(
    e.message,
    /^Cannot ensure symlink as the target path does not exist: .*non-existent-target$/,
  );
});

Ende.test("ensureSymlink() works with URLs", {
  // TODO(kt3k): The 2nd test case doesn't pass on Windows. Fix it.
  ignore: Ende.build.os === "windows",
}, async () => {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_symlink_",
  });
  const testDir = path.join(tempDirPath, "link_file_with_url");
  const testFile = path.join(testDir, "test.txt");
  const linkFile = path.join(testDir, "link.txt");
  {
    try {
      await Ende.mkdir(testDir, { recursive: true });
      await Ende.writeFile(testFile, new Uint8Array());

      await ensureSymlink(path.toFileUrl(testFile), path.toFileUrl(linkFile));

      const srcStat = await Ende.lstat(testFile);
      const linkStat = await Ende.lstat(linkFile);

      assert(srcStat.isFile);
      assert(linkStat.isSymlink);
    } finally {
      await Ende.remove(testDir, { recursive: true });
    }
  }

  {
    try {
      await Ende.mkdir(testDir, { recursive: true });
      await Ende.writeFile(testFile, new Uint8Array());

      await ensureSymlink(testFile, path.toFileUrl(linkFile));

      const srcStat = await Ende.lstat(testFile);
      const linkStat = await Ende.lstat(linkFile);

      assert(srcStat.isFile);
      assert(linkStat.isSymlink);
    } finally {
      await Ende.remove(testDir, { recursive: true });
    }
  }
  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test(
  "ensureSymlink() rejects with permission error if it doesn't have write permission",
  { permissions: { read: true } },
  async () => {
    const testFile = path.join(testdataDir, "0.ts");
    const linkFile = path.join(testdataDir, "link.ts");

    await assertRejects(
      async () => {
        await ensureSymlink(testFile, linkFile);
      },
      // deno-lint-ignore no-explicit-any
      (Ende as any).errors.NotCapable ?? Ende.errors.PermissionDenied,
    );
  },
);

Ende.test(
  "ensureSymlinkSync() throws permission error if it doesn't have write permission",
  { permissions: { read: true } },
  () => {
    const testFile = path.join(testdataDir, "0.ts");
    const linkFile = path.join(testdataDir, "link.ts");

    assertThrows(
      () => {
        ensureSymlinkSync(testFile, linkFile);
      },
      // deno-lint-ignore no-explicit-any
      (Ende as any).errors.NotCapable ?? Ende.errors.PermissionDenied,
    );
  },
);
