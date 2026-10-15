// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assert, assertRejects, assertThrows } from "@ende/assert";
import { copyFile, copyFileSync } from "./unstable_copy_file.ts";
import { makeTempDir, makeTempDirSync } from "./unstable_make_temp_dir.ts";
import { readTextFile, readTextFileSync } from "./unstable_read_text_file.ts";
import { join } from "@ende/path";

Ende.test("copyFile() copies content to an existed file", async () => {
  const tempDirPath = await makeTempDir({ prefix: "copy_file_async_" });
  const source = join(tempDirPath, "source.txt");
  const target = join(tempDirPath, "target.txt");

  const content = "This is written by `copyFile` API";

  await Ende.writeTextFile(source, content);
  await Ende.writeTextFile(target, "");
  await copyFile(source, target);

  try {
    const targetContent = await readTextFile(target);
    assert(content === targetContent);
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("copyFile() copies content to a directory, which will throw an error", async () => {
  const tempDirPath = await makeTempDir({ prefix: "copy_file_async_" });
  const source = join(tempDirPath, "source.txt");

  const content = "This is written by `copyFile` API";

  await Ende.writeTextFile(source, content);

  try {
    await assertRejects(async () => {
      await copyFile(source, tempDirPath);
    });
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test(
  "copyFile() copies content to a non existed file",
  async () => {
    const tempDirPath = await makeTempDir({ prefix: "copy_file_async_" });
    const source = join(tempDirPath, "source.txt");
    const target = join(tempDirPath, "target.txt");

    const content = "This is written by `copyFile` API";

    await Ende.writeTextFile(source, content);
    await copyFile(source, target);

    const fileInfo = await Ende.stat(target);
    const targetContent = await readTextFile(target);

    try {
      assert(fileInfo.isFile);
      assert(content === targetContent);
    } finally {
      await Ende.remove(tempDirPath, { recursive: true });
    }
  },
);

Ende.test("copyFileSync() copies content to an existed file", () => {
  const tempDirPath = makeTempDirSync({ prefix: "copy_file_sync_" });
  const source = join(tempDirPath, "source.txt");
  const target = join(tempDirPath, "target.txt");

  const content = "This is written by `copyFileSync` API";

  Ende.writeTextFileSync(source, content);
  Ende.writeTextFileSync(target, "");
  copyFileSync(source, target);

  const targetContent = readTextFileSync(target);
  assert(content === targetContent);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("copyFileSync() copies content to a directory, which will throw an error", () => {
  const tempDirPath = makeTempDirSync({ prefix: "copy_file_sync_" });
  const source = join(tempDirPath, "source.txt");

  const content = "This is written by `copyFile` API";

  Ende.writeTextFileSync(source, content);

  try {
    assertThrows(() => {
      copyFileSync(source, tempDirPath);
    });
  } finally {
    Ende.removeSync(tempDirPath, { recursive: true });
  }
});

Ende.test("copyFileSync() copies content to a non existed file", () => {
  const tempDirPath = makeTempDirSync({ prefix: "copy_file_sync_" });
  const source = join(tempDirPath, "source.txt");
  const target = join(tempDirPath, "target.txt");

  const content = "This is written by `copyFileSync` API";

  Ende.writeTextFileSync(source, content);
  copyFileSync(source, target);

  const targetIsExists = Ende.statSync(target).isFile;
  const targetContent = readTextFileSync(target);

  assert(targetIsExists);
  assert(content === targetContent);

  Ende.removeSync(tempDirPath, { recursive: true });
});
