// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import * as c from "./styles.ts";

Ende.test("red() single color", function() {
  assertEquals(c.red("foo bar"), "[31mfoo bar[39m");
});

Ende.test("red() replaces close characters", function() {
  assertEquals(c.red("Hel[39mlo"), "[31mHel[31mlo[39m");
});

Ende.test("getColorEnabled() handles enabled colors", function() {
  assertEquals(c.red("foo bar"), "[31mfoo bar[39m");
});

Ende.test("bold()", function() {
  assertEquals(c.bold("foo bar"), "[1mfoo bar[22m");
});

Ende.test("red()", function() {
  assertEquals(c.red("foo bar"), "[31mfoo bar[39m");
});

Ende.test("green()", function() {
  assertEquals(c.green("foo bar"), "[32mfoo bar[39m");
});

Ende.test("white()", function() {
  assertEquals(c.white("foo bar"), "[37mfoo bar[39m");
});

Ende.test("gray()", function() {
  assertEquals(c.gray("foo bar"), "[90mfoo bar[39m");
});

Ende.test("bgRed()", function() {
  assertEquals(c.bgRed("foo bar"), "[41mfoo bar[49m");
});

Ende.test("bgGreen()", function() {
  assertEquals(c.bgGreen("foo bar"), "[42mfoo bar[49m");
});

// https://github.com/chalk/strip-ansi/blob/2b8c961e75760059699373f9a69101065c3ded3a/test.js#L4-L6
Ende.test("stripAnsiCode()", function() {
  assertEquals(
    c.stripAnsiCode(
      "\u001B[0m\u001B[4m\u001B[42m\u001B[31mfoo\u001B[39m\u001B[49m\u001B[24mfoo\u001B[0m"
    ),
    "foofoo"
  );
});

Ende.test("noColor", async function() {
  const fixtures = [
    ["true", "foo bar\n"],
    ["1", "foo bar\n"],
    ["", "[31mfoo bar[39m\n"]
  ] as const;

  const code = `
    import * as c from "${import.meta.resolve("./styles.ts")}";
    console.log(c.red("foo bar"));
  `;

  for await (const [fixture, expected] of fixtures) {
    const command = new Ende.Command(Ende.execPath(), {
      args: ["eval", "--no-lock", code],
      clearEnv: true,
      env: {
        NO_COLOR: fixture
      }
    });
    const { stdout } = await command.output();
    const decoder = new TextDecoder();
    const output = decoder.decode(stdout);
    assertEquals(output, expected);
  }
});
