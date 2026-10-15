// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows
} from "@ende/assert";
import * as path from "@ende/path";
import { move, moveSync } from "./move.ts";
import { ensureFile, ensureFileSync } from "./ensure_file.ts";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { existsSync } from "./exists.ts";

Ende.test("move() rejects if src dir does not exist", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const srcDir = path.join(tempDirPath, "move_test_src_1");
  const destDir = path.join(tempDirPath, "move_test_dest_1");
  // if src directory not exist
  await assertRejects(
    async () => {
      await move(srcDir, destDir);
    }
  );

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("move() creates dest dir if it does not exist", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const srcDir = path.join(tempDirPath, "move_test_src_2");
  const destDir = path.join(tempDirPath, "move_test_dest_2");

  await Ende.mkdir(srcDir, { recursive: true });

  // if dest directory not exist
  await assertRejects(
    async () => {
      await move(srcDir, destDir);
      throw new Error("should not throw error");
    },
    Error,
    "should not throw error"
  );

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test(
  "move() creates dest dir if it does not exist and overwrite option is set to true",
  async function() {
    const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
    const srcDir = path.join(tempDirPath, "move_test_src_2");
    const destDir = path.join(tempDirPath, "move_test_dest_2");

    await Ende.mkdir(srcDir, { recursive: true });

    // if dest directory not exist
    await assertRejects(
      async () => {
        await move(srcDir, destDir, { overwrite: true });
        throw new Error("should not throw error");
      },
      Error,
      "should not throw error"
    );

    await Ende.remove(tempDirPath, { recursive: true });
  }
);

Ende.test("move() rejects if src file does not exist", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const srcFile = path.join(tempDirPath, "move_test_src_3", "test.txt");
  const destFile = path.join(tempDirPath, "move_test_dest_3", "test.txt");

  // if src directory not exist
  await assertRejects(
    async () => {
      await move(srcFile, destFile);
    }
  );

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("move() moves file and can overwrite content", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const srcDir = path.join(tempDirPath, "move_test_src_4");
  const destDir = path.join(tempDirPath, "move_test_dest_4");
  const srcFile = path.join(srcDir, "test.txt");
  const destFile = path.join(destDir, "test.txt");
  const srcContent = new TextEncoder().encode("src");
  const destContent = new TextEncoder().encode("dest");

  // make sure files exists
  await Promise.all([ensureFile(srcFile), ensureFile(destFile)]);

  // write file content
  await Promise.all([
    Ende.writeFile(srcFile, srcContent),
    Ende.writeFile(destFile, destContent)
  ]);

  // make sure the test file have been created
  assertEquals(await Ende.readTextFile(srcFile), "src");
  assertEquals(await Ende.readTextFile(destFile), "dest");

  // move it without override
  await assertRejects(
    async () => {
      await move(srcFile, destFile);
    },
    Error,
    "dest already exists"
  );

  // move again with overwrite
  await assertRejects(
    async () => {
      await move(srcFile, destFile, { overwrite: true });
      throw new Error("should not throw error");
    },
    Error,
    "should not throw error"
  );

  await assertRejects(async () => await Ende.lstat(srcFile));
  assertEquals(await Ende.readTextFile(destFile), "src");

  // clean up
  await Promise.all([
    Ende.remove(srcDir, { recursive: true }),
    Ende.remove(destDir, { recursive: true })
  ]);
  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("move() moves dir", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const srcDir = path.join(tempDirPath, "move_test_src_5");
  const destDir = path.join(tempDirPath, "move_test_dest_5");
  const srcFile = path.join(srcDir, "test.txt");
  const destFile = path.join(destDir, "test.txt");
  const srcContent = new TextEncoder().encode("src");

  await Ende.mkdir(srcDir, { recursive: true });
  assert(await Ende.lstat(srcDir));
  await Ende.writeFile(srcFile, srcContent);

  await move(srcDir, destDir);

  await assertRejects(async () => await Ende.lstat(srcDir));
  assert(await Ende.lstat(destDir));
  assert(await Ende.lstat(destFile));

  const destFileContent = await Ende.readTextFile(destFile);
  assertEquals(destFileContent, "src");

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test(
  "move() moves files if src and dest exist and can overwrite content",
  async function() {
    const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
    const srcDir = path.join(tempDirPath, "move_test_src_6");
    const destDir = path.join(tempDirPath, "move_test_dest_6");
    const srcFile = path.join(srcDir, "test.txt");
    const destFile = path.join(destDir, "test.txt");
    const srcContent = new TextEncoder().encode("src");
    const destContent = new TextEncoder().encode("dest");

    await Promise.all([
      Ende.mkdir(srcDir, { recursive: true }),
      Ende.mkdir(destDir, { recursive: true })
    ]);
    assert(await Ende.lstat(srcDir));
    assert(await Ende.lstat(destDir));
    await Promise.all([
      Ende.writeFile(srcFile, srcContent),
      Ende.writeFile(destFile, destContent)
    ]);

    await move(srcDir, destDir, { overwrite: true });

    await assertRejects(async () => await Ende.lstat(srcDir));
    assert(await Ende.lstat(destDir));
    assert(await Ende.lstat(destFile));

    const destFileContent = await Ende.readTextFile(destFile);
    assertEquals(destFileContent, "src");

    await Ende.remove(tempDirPath, { recursive: true });
  }
);

Ende.test("move() rejects when dest is its own sub dir", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const srcDir = path.join(tempDirPath, "move_test_src_7");
  const destDir = path.join(srcDir, "nest");

  await ensureDir(destDir);

  await assertRejects(
    async () => {
      await move(srcDir, destDir);
    },
    Error,
    `Cannot move '${srcDir}' to a subdirectory of itself, '${destDir}'.`
  );

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("moveSync() throws if src dir does not exist", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcDir = path.join(tempDirPath, "move_sync_test_src_1");
  const destDir = path.join(tempDirPath, "move_sync_test_dest_1");
  // if src directory not exist
  assertThrows(() => {
    moveSync(srcDir, destDir);
  });
  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() creates dest dir if it does not exist", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcDir = path.join(tempDirPath, "move_sync_test_src_2");
  const destDir = path.join(tempDirPath, "move_sync_test_dest_2");

  Ende.mkdirSync(srcDir, { recursive: true });

  // if dest directory not exist
  assertThrows(
    () => {
      moveSync(srcDir, destDir);
      throw new Error("should not throw error");
    },
    Error,
    "should not throw error"
  );

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() creates dest dir if it does not exist and overwrite option is set to true", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcDir = path.join(tempDirPath, "move_sync_test_src_2");
  const destDir = path.join(tempDirPath, "move_sync_test_dest_2");

  Ende.mkdirSync(srcDir, { recursive: true });

  // if dest directory not exist width overwrite
  assertThrows(
    () => {
      moveSync(srcDir, destDir, { overwrite: true });
      throw new Error("should not throw error");
    },
    Error,
    "should not throw error"
  );

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() throws if src file does not exist", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcFile = path.join(tempDirPath, "move_sync_test_src_3", "test.txt");
  const destFile = path.join(tempDirPath, "move_sync_test_dest_3", "test.txt");

  // if src directory not exist
  assertThrows(() => {
    moveSync(srcFile, destFile);
  });
  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() moves file and can overwrite content", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcDir = path.join(tempDirPath, "move_sync_test_src_4");
  const destDir = path.join(tempDirPath, "move_sync_test_dest_4");
  const srcFile = path.join(srcDir, "test.txt");
  const destFile = path.join(destDir, "test.txt");
  const srcContent = new TextEncoder().encode("src");
  const destContent = new TextEncoder().encode("dest");

  // make sure files exists
  ensureFileSync(srcFile);
  ensureFileSync(destFile);

  // write file content
  Ende.writeFileSync(srcFile, srcContent);
  Ende.writeFileSync(destFile, destContent);

  // make sure the test file have been created
  assertEquals(new TextDecoder().decode(Ende.readFileSync(srcFile)), "src");
  assertEquals(new TextDecoder().decode(Ende.readFileSync(destFile)), "dest");

  // move it without override
  assertThrows(
    () => {
      moveSync(srcFile, destFile);
    },
    Error,
    "dest already exists"
  );

  // move again with overwrite
  assertThrows(
    () => {
      moveSync(srcFile, destFile, { overwrite: true });
      throw new Error("should not throw error");
    },
    Error,
    "should not throw error"
  );

  assertEquals(existsSync(srcFile), false);
  assertEquals(new TextDecoder().decode(Ende.readFileSync(destFile)), "src");

  // clean up
  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() moves dir", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcDir = path.join(tempDirPath, "move_sync_test_src_5");
  const destDir = path.join(tempDirPath, "move_sync_test_dest_5");
  const srcFile = path.join(srcDir, "test.txt");
  const destFile = path.join(destDir, "test.txt");
  const srcContent = new TextEncoder().encode("src");

  Ende.mkdirSync(srcDir, { recursive: true });
  assertEquals(existsSync(srcDir), true);
  Ende.writeFileSync(srcFile, srcContent);

  moveSync(srcDir, destDir);

  assertEquals(existsSync(srcDir), false);
  assertEquals(existsSync(destDir), true);
  assertEquals(existsSync(destFile), true);

  const destFileContent = new TextDecoder().decode(Ende.readFileSync(destFile));
  assertEquals(destFileContent, "src");

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() moves files if src and dest exist and can overwrite content", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcDir = path.join(tempDirPath, "move_sync_test_src_6");
  const destDir = path.join(tempDirPath, "move_sync_test_dest_6");
  const srcFile = path.join(srcDir, "test.txt");
  const destFile = path.join(destDir, "test.txt");
  const srcContent = new TextEncoder().encode("src");
  const destContent = new TextEncoder().encode("dest");

  Ende.mkdirSync(srcDir, { recursive: true });
  Ende.mkdirSync(destDir, { recursive: true });
  assertEquals(existsSync(srcDir), true);
  assertEquals(existsSync(destDir), true);
  Ende.writeFileSync(srcFile, srcContent);
  Ende.writeFileSync(destFile, destContent);

  moveSync(srcDir, destDir, { overwrite: true });

  assertEquals(existsSync(srcDir), false);
  assertEquals(existsSync(destDir), true);
  assertEquals(existsSync(destFile), true);

  const destFileContent = new TextDecoder().decode(Ende.readFileSync(destFile));
  assertEquals(destFileContent, "src");

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() throws when dest is its own sub dir", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const srcDir = path.join(tempDirPath, "move_sync_test_src_7");
  const destDir = path.join(srcDir, "nest");

  ensureDirSync(destDir);

  assertThrows(
    () => {
      moveSync(srcDir, destDir, { overwrite: true });
    },
    Error,
    `Cannot move '${srcDir}' to a subdirectory of itself, '${destDir}'.`
  );
  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("move() accepts overwrite option set to true for file content", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const dir = path.join(tempDirPath, "move_same_file_1");
  const file = path.join(dir, "test.txt");
  const url = path.toFileUrl(file);
  const content = new TextEncoder().encode("test");

  // Make sure test file exists
  await ensureFile(file);
  await Ende.writeFile(file, content);
  assert(await Ende.lstat(dir));

  // Test varying pairs of `string` and `URL` params.
  const pairs = [
    [file, file],
    [file, url],
    [url, file],
    [url, url]
  ] as const;

  for (const p of pairs) {
    const src = p[0];
    const dest = p[1];

    await move(src, dest, { overwrite: true });
    assertEquals(await Ende.readTextFile(src), "test");
  }

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("move() accepts overwrite option set to true for directories", async function() {
  const tempDirPath = await Ende.makeTempDir({ prefix: "ende_std_move_" });
  const dir = path.join(tempDirPath, "move_same_dir_1");
  const url = path.toFileUrl(dir);

  // Make sure test dir exists
  await ensureDir(dir);
  assert(await Ende.lstat(dir));

  // Test varying pairs of `string` and `URL params.
  const pairs = [
    [dir, dir],
    [dir, url],
    [url, dir],
    [url, url]
  ] as const;

  for (const p of pairs) {
    const src = p[0];
    const dest = p[1];

    await assertRejects(
      async () => {
        await move(src, dest);
      },
      Ende.errors.NotSupported,
      `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`
    );
  }

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("moveSync() accepts overwrite option set to true for file content", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const dir = path.join(tempDirPath, "move_sync_same_file_1");
  const file = path.join(dir, "test.txt");
  const url = path.toFileUrl(file);
  const content = new TextEncoder().encode("test");

  // Make sure test file exists
  ensureFileSync(file);
  Ende.writeFileSync(file, content);
  assert(Ende.lstatSync(dir));

  // Test varying pairs of `string` and `URL` params.
  const pairs = [
    [file, file],
    [file, url],
    [url, file],
    [url, url]
  ] as const;

  for (const p of pairs) {
    const src = p[0];
    const dest = p[1];

    moveSync(src, dest, { overwrite: true });
    assertEquals(Ende.readTextFileSync(src), "test");
  }

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("moveSync() accepts overwrite option set to true for directories", function() {
  const tempDirPath = Ende.makeTempDirSync({ prefix: "ende_std_move_sync_" });
  const dir = path.join(tempDirPath, "move_sync_same_dir_1");
  const url = path.toFileUrl(dir);

  // Make sure test dir exists
  ensureDirSync(dir);
  assert(Ende.lstatSync(dir));

  // Test varying pairs of `string` and `URL params.
  const pairs = [
    [dir, dir],
    [dir, url],
    [url, dir],
    [url, url]
  ] as const;

  for (const p of pairs) {
    const src = p[0];
    const dest = p[1];

    assertThrows(
      () => {
        moveSync(src, dest);
      },
      Ende.errors.NotSupported,
      `Cannot move '${src}' to a subdirectory of itself, '${dest}'.`
    );
  }

  Ende.removeSync(tempDirPath, { recursive: true });
});
