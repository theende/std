// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals } from "@ende/assert";
import * as path from "@ende/path";

const moduleDir = path.dirname(path.fromFileUrl(import.meta.url));
const testdataDir = path.resolve(moduleDir, "testdata");

Ende.test({
  name: "load()",
  async fn() {
    const command = new Ende.Command(Ende.execPath(), {
      args: [
        "run",
        "--allow-read",
        "--allow-env",
        "--no-lock",
        path.join(testdataDir, "./app_load.ts"),
      ],
      clearEnv: true,
      cwd: testdataDir,
    });
    const { stdout } = await command.output();

    const decoder = new TextDecoder();
    assertEquals(
      decoder.decode(stdout).trim(),
      "hello world",
    );
  },
});

Ende.test({
  name: "load() works as expected when the multiple files are imported",
  async fn() {
    const command = new Ende.Command(Ende.execPath(), {
      args: [
        "run",
        "--no-lock",
        "--allow-read",
        "--allow-env",
        path.join(testdataDir, "./app_load_parent.ts"),
      ],
      clearEnv: true,
      cwd: testdataDir,
    });
    const { stdout } = await command.output();

    const decoder = new TextDecoder();
    assertEquals(
      decoder.decode(stdout).trim(),
      "hello world",
    );
  },
});
