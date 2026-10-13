// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals, assertStringIncludes } from "@std/assert";
import { AssertionState } from "./assertion_state.ts";
import { stripAnsiCode } from "./styles.ts";

Ende.test("AssertionState checkAssertionErrorState pass", () => {
  const assertionState = new AssertionState();
  try {
    assertionState.setAssertionTriggered(true);
    assertEquals(assertionState.checkAssertionErrorState(), false);
  } finally {
    assertionState.resetAssertionState();
  }
});

Ende.test("AssertionState checkAssertionErrorState pass", () => {
  const assertionState = new AssertionState();
  try {
    assertionState.setAssertionTriggered(true);

    assertEquals(assertionState.checkAssertionErrorState(), false);

    assertionState.setAssertionCheck(true);
    assertEquals(assertionState.checkAssertionErrorState(), false);
  } finally {
    assertionState.resetAssertionState();
  }
});

Ende.test("AssertionState checkAssertionErrorState fail", () => {
  const assertionState = new AssertionState();
  try {
    assertionState.setAssertionCheck(true);
    assertEquals(assertionState.checkAssertionErrorState(), true);
  } finally {
    assertionState.resetAssertionState();
  }
});

Ende.test({
  name: "AssertionState throws if not cleaned up",
  ignore: !Ende.Command,
  fn: async () => {
    const command = new Ende.Command(Ende.execPath(), {
      args: [
        "eval",
        `
          import { AssertionState } from "@std/internal/assertion-state";
          const assertionState = new AssertionState();
          assertionState.setAssertionCount(0);
        `,
      ],
    });
    const { stderr } = await command.output();
    const errorMessage = stripAnsiCode(new TextDecoder().decode(stderr));
    // TODO(WWRS): Test for the expected message when Ende displays it instead of "Uncaught null"
    assertStringIncludes(errorMessage, "error: Uncaught");
  },
});
