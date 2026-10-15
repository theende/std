// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// TODO(axetroy): Add test for Windows once symlink is implemented for Windows.
import { assertEquals, assertRejects, assertThrows } from "@ende/assert";
import * as path from "@ende/path";
import { ensureLink, ensureLinkSync } from "./ensure_link.ts";

const moduleDir = path.dirname(path.fromFileUrl(import.meta.url));
const testdataDir = path.resolve(moduleDir, "testdata");

Ende.test("ensureLink() rejects if src and dest do not exist", async function() {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_link_"
  });
  const srcDir = path.join(testdataDir, "ensure_link_1");
  const destDir = path.join(tempDirPath, "ensure_link_1_2");
  const testFile = path.join(srcDir, "test.txt");
  const linkFile = path.join(destDir, "link.txt");

  await assertRejects(
    async () => {
      await ensureLink(testFile, linkFile);
    }
  );

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureLinkSync() throws if src and dest do not exist", function() {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_link_sync_"
  });
  const testDir = path.join(tempDirPath, "ensure_link_2");
  const testFile = path.join(testDir, "test.txt");
  const linkFile = path.join(testDir, "link.txt");

  assertThrows(() => {
    ensureLinkSync(testFile, linkFile);
  });

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("ensureLink() ensures dest links to the src", async function() {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_link_"
  });
  const testDir = path.join(tempDirPath, "ensure_link_3");
  const testFile = path.join(testDir, "test.txt");
  const linkFile = path.join(testDir, "link.txt");

  await Ende.mkdir(testDir, { recursive: true });
  await Ende.writeFile(testFile, new Uint8Array());

  await ensureLink(testFile, linkFile);

  const srcStat = await Ende.lstat(testFile);
  const linkStat = await Ende.lstat(linkFile);

  assertEquals(srcStat.isFile, true);
  assertEquals(linkStat.isFile, true);

  // har link success. try to change one of them. they should be change both.

  // let's change origin file.
  await Ende.writeTextFile(testFile, "123");

  const testFileContent1 = await Ende.readTextFile(testFile);
  const linkFileContent1 = await Ende.readTextFile(testFile);

  assertEquals(testFileContent1, "123");
  assertEquals(testFileContent1, linkFileContent1);

  // let's change link file.
  await Ende.writeFile(testFile, new TextEncoder().encode("abc"));

  const testFileContent2 = await Ende.readTextFile(testFile);
  const linkFileContent2 = await Ende.readTextFile(testFile);

  assertEquals(testFileContent2, "abc");
  assertEquals(testFileContent2, linkFileContent2);

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureLinkSync() ensures dest links to the src", function() {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_link_sync_"
  });
  const testDir = path.join(tempDirPath, "ensure_link_4");
  const testFile = path.join(testDir, "test.txt");
  const linkFile = path.join(testDir, "link.txt");

  Ende.mkdirSync(testDir, { recursive: true });
  Ende.writeFileSync(testFile, new Uint8Array());

  ensureLinkSync(testFile, linkFile);

  const srcStat = Ende.lstatSync(testFile);

  const linkStat = Ende.lstatSync(linkFile);

  assertEquals(srcStat.isFile, true);
  assertEquals(linkStat.isFile, true);

  // har link success. try to change one of them. they should be change both.

  // let's change origin file.
  Ende.writeFileSync(testFile, new TextEncoder().encode("123"));

  const testFileContent1 = new TextDecoder().decode(
    Ende.readFileSync(testFile)
  );
  const linkFileContent1 = new TextDecoder().decode(
    Ende.readFileSync(testFile)
  );

  assertEquals(testFileContent1, "123");
  assertEquals(testFileContent1, linkFileContent1);

  // let's change link file.
  Ende.writeFileSync(testFile, new TextEncoder().encode("abc"));

  const testFileContent2 = new TextDecoder().decode(
    Ende.readFileSync(testFile)
  );
  const linkFileContent2 = new TextDecoder().decode(
    Ende.readFileSync(testFile)
  );

  assertEquals(testFileContent2, "abc");
  assertEquals(testFileContent2, linkFileContent2);

  Ende.removeSync(tempDirPath, { recursive: true });
});

Ende.test("ensureLink() rejects if link does not exist", async function() {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_ensure_link_"
  });
  const testDir = path.join(tempDirPath, "ensure_link_origin_3");
  const linkDir = path.join(tempDirPath, "ensure_link_link_3");
  const testFile = path.join(testDir, "test.txt");

  await Ende.mkdir(testDir, { recursive: true });
  await Ende.writeFile(testFile, new Uint8Array());

  await assertRejects(
    async () => {
      await ensureLink(testDir, linkDir);
    }
    // "Operation not permitted (os error 1)" // throw an local matching test
    // "Access is denied. (os error 5)" // throw in CI
  );

  await Ende.remove(tempDirPath, { recursive: true });
});

Ende.test("ensureLinkSync() throws if link does not exist", function() {
  const tempDirPath = Ende.makeTempDirSync({
    prefix: "ende_std_ensure_link_sync_"
  });
  const testDir = path.join(tempDirPath, "ensure_link_origin_3");
  const linkDir = path.join(tempDirPath, "ensure_link_link_3");
  const testFile = path.join(testDir, "test.txt");

  Ende.mkdirSync(testDir, { recursive: true });
  Ende.writeFileSync(testFile, new Uint8Array());

  assertThrows(
    () => {
      ensureLinkSync(testDir, linkDir);
    }
    // "Operation not permitted (os error 1)" // throw an local matching test
    // "Access is denied. (os error 5)" // throw in CI
  );

  Ende.removeSync(tempDirPath, { recursive: true });
});
