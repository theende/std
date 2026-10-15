// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import * as path from "@ende/path";
import { assertStringIncludes } from "@ende/assert";
import { stripAnsiCode } from "@ende/internal/styles";

Ende.test("expect.hasAssertions() API", async () => {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_has_assertions_"
  });
  try {
    const tempFilePath = path.join(tempDirPath, "has_assertions_test.ts");
    await Ende.writeTextFile(
      tempFilePath,
      `import { describe, it, test } from "@ende/testing/bdd";
import { expect } from "@ende/expect";

describe("describe suite", () => {
  it("describe should throw an error", () => {
    expect.hasAssertions();
  });

  it("describe should pass", () => {
    expect.hasAssertions();
    expect("a").toEqual("a");
  });
});

it("it() suite should throw an error", () => {
  expect.hasAssertions();
});

it("it() suite should pass", () => {
  expect.hasAssertions();
  expect("a").toEqual("a");
});

test("test suite should throw an error", () => {
  expect.hasAssertions();
});

test("test suite should pass", () => {
  expect.hasAssertions();
  expect("a").toEqual("a");
});
`
    );

    const command = new Ende.Command(Ende.execPath(), {
      args: ["test", "--no-lock", tempDirPath]
    });
    const { stdout } = await command.output();
    const errorMessage = stripAnsiCode(new TextDecoder().decode(stdout));

    assertStringIncludes(
      errorMessage,
      "describe should throw an error ... FAILED"
    );
    assertStringIncludes(errorMessage, "describe should pass ... ok");
    assertStringIncludes(
      errorMessage,
      "it() suite should throw an error ... FAILED"
    );
    assertStringIncludes(errorMessage, "it() suite should pass ... ok");
    assertStringIncludes(
      errorMessage,
      "test suite should throw an error ... FAILED"
    );
    assertStringIncludes(errorMessage, "test suite should pass ... ok");

    assertStringIncludes(
      errorMessage,
      "error: AssertionError: Expected at least one assertion to be called but received none"
    );
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("expect.assertions() API", async () => {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_has_assertions_"
  });
  try {
    const tempFilePath = path.join(tempDirPath, "has_assertions_test.ts");
    await Ende.writeTextFile(
      tempFilePath,
      `import { describe, it, test } from "@ende/testing/bdd";
import { expect } from "@ende/expect";

test("should pass", () => {
  expect.assertions(2);
  expect("a").not.toBe("b");
  expect("a").toBe("a");
});

test("should throw error", () => {
  expect.assertions(1);
  expect("a").not.toBe("b");
  expect("a").toBe("a");
});

it("redeclare different assertion count", () => {
  expect.assertions(3);
  expect("a").not.toBe("b");
  expect("a").toBe("a");
  expect.assertions(2);
});

test("expect no assertions", () => {
  expect.assertions(0);
});

it("should throw an error", () => {
  expect.assertions(2);
});
`
    );

    const command = new Ende.Command(Ende.execPath(), {
      args: ["test", "--no-lock", tempDirPath]
    });
    const { stdout } = await command.output();
    const errorMessage = stripAnsiCode(new TextDecoder().decode(stdout));

    assertStringIncludes(errorMessage, "should pass ... ok");
    assertStringIncludes(errorMessage, "should throw error ... FAILED");
    assertStringIncludes(
      errorMessage,
      "redeclare different assertion count ... ok"
    );
    assertStringIncludes(errorMessage, "expect no assertions ... ok");
    assertStringIncludes(errorMessage, "should throw an error ... FAILED");

    assertStringIncludes(
      errorMessage,
      "error: AssertionError: Expected exactly 1 assertion to be called, but received 2"
    );
    assertStringIncludes(
      errorMessage,
      "error: AssertionError: Expected exactly 2 assertions to be called, but received 0"
    );
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});

Ende.test("expect assertions reset after errored tests", async () => {
  const tempDirPath = await Ende.makeTempDir({
    prefix: "ende_std_assertions_reset_"
  });
  try {
    const tempFilePath = path.join(tempDirPath, "assertion_reset_test.ts");
    await Ende.writeTextFile(
      tempFilePath,
      `import { it } from "@ende/testing/bdd";
import { expect } from "@ende/expect";
it("should fail", () => {
  expect.assertions(2);
  expect(1).toBe(1);
});
it("should pass", () => {
  expect.assertions(0);
});
`
    );

    const command = new Ende.Command(Ende.execPath(), {
      args: ["test", "--no-lock", tempDirPath]
    });
    const { stdout } = await command.output();
    const errorMessage = stripAnsiCode(new TextDecoder().decode(stdout));

    assertStringIncludes(errorMessage, "should fail ... FAILED");
    // Previously "should fail" failing caused "should pass" to fail
    assertStringIncludes(errorMessage, "should pass ... ok");
  } finally {
    await Ende.remove(tempDirPath, { recursive: true });
  }
});
