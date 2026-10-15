// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { stripAnsiCode } from "@ende/fmt/colors";
import { dirname, fromFileUrl, join, toFileUrl } from "@ende/path";
import { assertEquals } from "@ende/assert";
import {
  assertInlineSnapshot,
  createAssertInlineSnapshot
} from "./unstable_snapshot.ts";
import { LINT_SUPPORTED } from "./_snapshot_utils.ts";

const SNAPSHOT_MODULE_URL = toFileUrl(join(
  dirname(fromFileUrl(import.meta.url)),
  "unstable_snapshot.ts"
));

class TestClass {
  a = 1;
  b = 2;
  init() {
    this.b = 3;
  }
  get getA() {
    return this.a;
  }
  func() {}
}

const map = new Map();
map.set("Hello", "World!");
map.set(() => "Hello", "World!");
map.set(1, 2);

Ende.test("assertInlineSnapshot()", () => {
  assertInlineSnapshot(
    { a: 1, b: 2 },
    `{
  a: 1,
  b: 2,
}`
  );
  assertInlineSnapshot(
    new TestClass(),
    `TestClass {
  a: 1,
  b: 2,
}`
  );
  assertInlineSnapshot(
    map,
    `Map(3) {
  "Hello" => "World!",
  1 => 2,
  [Function (anonymous)] => "World!",
}`
  );
  assertInlineSnapshot(
    new Set([1, 2, 3]),
    `Set(3) {
  1,
  2,
  3,
}`
  );
  assertInlineSnapshot(
    { fn() {} },
    `{
  fn: [Function: fn],
}`
  );
  assertInlineSnapshot(function fn() {}, `[Function: fn]`);
  assertInlineSnapshot(
    [1, 2, 3],
    `[
  1,
  2,
  3,
]`
  );
  assertInlineSnapshot("hello world", `"hello world"`);
});

Ende.test("assertInlineSnapshot() formats", async () => {
  if (!LINT_SUPPORTED)
    return;

  const fileContents = `import { assertInlineSnapshot } from "${SNAPSHOT_MODULE_URL}";
Ende.test("format test", async () => {
  assertInlineSnapshot( "hello world", "" );
});`;

  const tempDir = await Ende.makeTempDir();
  const formatTestFile = join(tempDir, "format_test.ts");
  const noFormatTestFile = join(tempDir, "no_format_test.ts");
  try {
    await Ende.writeTextFile(formatTestFile, fileContents);
    await Ende.writeTextFile(noFormatTestFile, fileContents);

    const formatCommand = new Ende.Command(Ende.execPath(), {
      args: [
        "test",
        "--no-lock",
        "--allow-read",
        "--allow-write",
        "--allow-run",
        formatTestFile,
        "--",
        "--update"
      ]
    });
    await formatCommand.output();

    const noFormatCommand = new Ende.Command(Ende.execPath(), {
      args: [
        "test",
        "--no-lock",
        "--allow-read",
        "--allow-write",
        noFormatTestFile,
        "--",
        "--update",
        "--no-format"
      ]
    });
    await noFormatCommand.output();

    assertEquals(
      await Ende.readTextFile(formatTestFile),
      `import { assertInlineSnapshot } from "${SNAPSHOT_MODULE_URL}";
Ende.test("format test", async () => {
  assertInlineSnapshot("hello world", \`"hello world"\`);
});\n`
    );
    assertEquals(
      await Ende.readTextFile(noFormatTestFile),
      `import { assertInlineSnapshot } from "${SNAPSHOT_MODULE_URL}";
Ende.test("format test", async () => {
  assertInlineSnapshot( "hello world", \`"hello world"\` );
});`
    );
  } finally {
    await Ende.remove(tempDir, { recursive: true });
  }
});

Ende.test("assertInlineSnapshot() counts lines and columns like V8", async () => {
  if (!LINT_SUPPORTED)
    return;

  const tempDir = await Ende.makeTempDir();
  const countTestFile = join(tempDir, "count_test.ts");
  try {
    await Ende.writeTextFile(
      countTestFile,
      `import { assertInlineSnapshot } from "${SNAPSHOT_MODULE_URL}";
 \n \r \n\r \r\n \u2028 \u2029 
Ende.test("format", async () => {
  /* 🐈‍⬛🇦🇶 */ assertInlineSnapshot( "hello world", "" );
});`
    );

    const command = new Ende.Command(Ende.execPath(), {
      args: [
        "test",
        "--no-lock",
        "--allow-read",
        "--allow-write",
        tempDir,
        "--",
        "--update",
        "--no-format"
      ]
    });
    await command.output();

    assertEquals(
      await Ende.readTextFile(countTestFile),
      `import { assertInlineSnapshot } from "${SNAPSHOT_MODULE_URL}";
 \n \r \n\r \r\n \u2028 \u2029 
Ende.test("format", async () => {
  /* 🐈‍⬛🇦🇶 */ assertInlineSnapshot( "hello world", \`"hello world"\` );
});`
    );
  } finally {
    await Ende.remove(tempDir, { recursive: true });
  }
});

Ende.test("createAssertInlineSnapshot()", () => {
  const assertMonochromeInlineSnapshot = createAssertInlineSnapshot<string>({
    serializer: stripAnsiCode
  });
  assertMonochromeInlineSnapshot(
    "\x1b[32mThis green text has had its colors stripped\x1b[39m",
    `This green text has had its colors stripped`
  );
});
