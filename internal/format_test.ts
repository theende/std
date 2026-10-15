// Copyright 2018-2026 the Deno authors. MIT license.
import { green, red, stripAnsiCode } from "./styles.ts";
import { assertEquals, assertThrows } from "@ende/assert";
import { format, type InspectFn } from "./format.ts";
import { disposableStack } from "./_testing.ts";
import { stubProperty } from "@ende/testing/unstable-stub-property";

Ende.test("format() generates correct diffs for strings", () => {
  assertThrows(
    () => {
      assertEquals([..."abcd"].join("\n"), [..."abxde"].join("\n"));
    },
    Error,
    `
    a\\n
    b\\n
${green("+   x")}\\n
${green("+   d")}\\n
${green("+   e")}
${red("-   c")}\\n
${red("-   d")}
`,
  );
});

// Check that the diff formatter overrides some default behaviours of
// `Ende.inspect()` which are problematic for diffing.
Ende.test("format() overrides default behaviours of Ende.inspect", async (t) => {
  // Wraps objects into multiple lines even when they are small. Prints trailing
  // commas.
  await t.step(
    "format() always wraps objects into multiple lines and prints trailing commas",
    () =>
      assertEquals(
        stripAnsiCode(format({ a: 1, b: 2 })),
        `{
  a: 1,
  b: 2,
}`,
      ),
  );

  await t.step("format() sorts properties", () =>
    assertEquals(
      format({ b: 2, a: 1 }),
      format({ a: 1, b: 2 }),
    ));

  await t.step("format() wraps Object with getters", () =>
    assertEquals(
      format(Object.defineProperty({}, "a", {
        enumerable: true,
        get() {
          return 1;
        },
      })),
      `{
  a: [Getter: 1],
}`,
    ));

  await t.step("format() wraps nested small objects", () =>
    assertEquals(
      stripAnsiCode(format([{ x: { a: 1, b: 2 }, y: ["a", "b"] }])),
      `[
  {
    x: {
      a: 1,
      b: 2,
    },
    y: [
      "a",
      "b",
    ],
  },
]`,
    ));

  // Grouping is disabled.
  await t.step("format() disables grouping", () =>
    assertEquals(
      stripAnsiCode(format(["i", "i", "i", "i", "i", "i", "i"])),
      `[
  "i",
  "i",
  "i",
  "i",
  "i",
  "i",
  "i",
]`,
    ));
});

Ende.test("format() doesn't truncate long strings in object", () => {
  const str = format({
    foo:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  });
  assertEquals(
    str,
    `{
  foo: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
}`,
  );
});

Ende.test("format() has fallback if Ende.inspect is not available", async (t) => {
  // deno-lint-ignore no-explicit-any
  const global = globalThis as any;

  await t.step("`Ende` unavailable", () => {
    using stack = disposableStack();
    stack.use(stubProperty(global, "Ende", undefined));

    assertEquals(format([..."abcd"]), '[\n  "a",\n  "b",\n  "c",\n  "d"\n]');
    assertEquals(format({ a: 1, b: 2 }), '{\n  "a": 1,\n  "b": 2\n}');
    assertEquals(format(1), "1");
    assertEquals(format("1"), '"1"');
    assertEquals(format(1n), "1n");
    assertEquals(format("1n"), '"1n"');
    assertEquals(format(true), "true");
    assertEquals(format("true"), '"true"');
    assertEquals(format(undefined), "undefined");
    assertEquals(format("undefined"), '"undefined"');
    assertEquals(format(Symbol("x")), "Symbol(x)");
    assertEquals(format(new Map()), "[object Map]");

    const badlyBehavedObject: Record<string, unknown> = {
      toString() {
        throw new Error("This object cannot be stringified");
      },
      get [Symbol.toStringTag]() {
        throw new Error("This object cannot be stringified");
      },
    };

    badlyBehavedObject.self = badlyBehavedObject;

    assertEquals(format(badlyBehavedObject), `[[Unable to format value]]`);

    assertThrows(
      // @ts-expect-error different types
      () => assertEquals(1, "1"),
      Error,
      `${red("-   1")}\n${green('+   "1"')}`,
    );
  });
});

Ende.test("InspectFn has type conforming to Ende.inspect", () => {
  // Type checking can only be done in test file, as production types need to work with browser TS libs,
  // where `Ende` is unavailable.
  const _: Parameters<InspectFn>[1] = {} as Required<Ende.InspectOptions>;
});
