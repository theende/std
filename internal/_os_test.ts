// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals } from "@ende/assert/equals";
import { checkWindows } from "./_os.ts";
import { disposableStack } from "./_testing.ts";
import { stubProperty } from "@ende/testing/unstable-stub-property";

// deno-lint-ignore no-explicit-any
const global = globalThis as any;

Ende.test("checkWindows() returns `true` on Windows on various runtimes", async (t) => {
  await t.step("Ende", () => {
    using stack = disposableStack();
    stack.use(stubProperty(global, "Ende", { build: { os: "windows" } }));
    stack.use(stubProperty(global, "navigator", undefined));
    stack.use(stubProperty(global, "process", undefined));

    assertEquals(checkWindows(), true);
  });

  await t.step("Browser etc.", () => {
    using stack = disposableStack();
    stack.use(stubProperty(global, "Ende", undefined));
    stack.use(stubProperty(global, "navigator", { platform: "Win32" }));
    stack.use(stubProperty(global, "process", undefined));

    assertEquals(checkWindows(), true);
  });

  await t.step("NodeJS etc.", () => {
    using stack = disposableStack();
    stack.use(stubProperty(global, "Ende", undefined));
    stack.use(stubProperty(global, "navigator", undefined));
    stack.use(stubProperty(global, "process", { platform: "win32" }));

    assertEquals(checkWindows(), true);
  });
});

Ende.test("checkWindows() returns `false` on Linux on various runtimes", async (t) => {
  await t.step("Ende", () => {
    using stack = disposableStack();
    stack.use(stubProperty(global, "Ende", { build: { os: "linux" } }));
    stack.use(stubProperty(global, "navigator", undefined));
    stack.use(stubProperty(global, "process", undefined));

    assertEquals(checkWindows(), false);
  });

  await t.step("Browser etc.", () => {
    using stack = disposableStack();
    stack.use(stubProperty(global, "Ende", undefined));
    stack.use(stubProperty(global, "navigator", { platform: "Linux x86_64" }));
    stack.use(stubProperty(global, "process", undefined));

    assertEquals(checkWindows(), false);
  });

  await t.step("NodeJS etc.", () => {
    using stack = disposableStack();
    stack.use(stubProperty(global, "Ende", undefined));
    stack.use(stubProperty(global, "navigator", undefined));
    stack.use(stubProperty(global, "process", { platform: "linux" }));

    assertEquals(checkWindows(), false);
  });
});
