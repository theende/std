// Copyright 2018-2026 the Deno authors. MIT license.

import {
  assertEquals,
  assertObjectMatch,
  assertStrictEquals,
} from "@ende/assert";
import { assertSpyCall, assertSpyCalls, type Spy, spy, stub } from "./mock.ts";
import { TestSuiteInternal } from "./_test_suite.ts";

export class TestContext implements Ende.TestContext {
  name: string;
  origin: string;
  steps: TestContext[];
  spies: {
    step: Spy;
  };

  constructor(name: string) {
    this.name = name;
    this.origin = "origin";
    this.spies = {
      step: spy(this, "step"),
    };
    this.steps = [];
  }

  async step(t: Ende.TestStepDefinition): Promise<boolean>;
  async step(
    name: string,
    fn: (t: Ende.TestContext) => void | Promise<void>,
  ): Promise<boolean>;
  async step(
    fn: (t: Ende.TestContext) => void | Promise<void>,
  ): Promise<boolean>;
  async step(
    tOrNameOrFn:
      | Ende.TestStepDefinition
      | string
      | ((t: Ende.TestContext) => void | Promise<void>),
    fn?: (t: Ende.TestContext) => void | Promise<void>,
  ): Promise<boolean> {
    let ignore = false;
    if (typeof tOrNameOrFn === "function") {
      ignore = false;
      fn = tOrNameOrFn;
    } else if (typeof tOrNameOrFn === "object") {
      ignore = tOrNameOrFn.ignore ?? false;
      fn = tOrNameOrFn.fn;
    }

    const name = typeof tOrNameOrFn === "string"
      ? tOrNameOrFn
      : tOrNameOrFn.name;
    const context = new TestContext(name);
    this.steps.push(context);
    if (!ignore) {
      await fn!(context);
    }
    return !ignore;
  }

  // `Ende.TestContext.assertSnapshot` was added in a newer Ende release. It is
  // not used by these tests, but the method must exist for the class to satisfy
  // the interface. `unknown` is used instead of `Ende.TestSnapshotOptions` so
  // this stays valid on older Ende versions that lack that type.
  assertSnapshot(_actual: unknown, _options?: unknown): Promise<void> {
    throw new Error(
      "Mock TestContext does not implement assertSnapshot",
    );
  }
}

async function assertDescribeOptions(
  expectedOptions: Omit<Ende.TestDefinition, "name" | "fn">,
  cb: (fns: readonly [Spy, Spy]) => void,
) {
  using test = stub(Ende, "test");
  const fns = [spy(), spy()] as const;
  try {
    cb(fns);

    assertSpyCall(test, 0);
    const call = test.calls[0];
    const options = call?.args[0] as Ende.TestDefinition;
    assertEquals(
      Object.keys(options).sort(),
      ["name", "fn", ...Object.keys(expectedOptions)].sort(),
    );
    assertObjectMatch(options, {
      name: "example",
      ...expectedOptions,
    });

    assertSpyCalls(fns[0], 0);
    assertSpyCalls(fns[1], 0);

    const context = new TestContext("example");
    const result = options.fn(context);

    assertStrictEquals(Promise.resolve(result), result);
    assertEquals(await result, undefined);
    assertSpyCalls(context.spies.step, 0);
    assertSpyCalls(fns[0], 0);
    assertSpyCalls(fns[1], 0);
  } finally {
    TestSuiteInternal.reset();
  }
}

export async function assertMinimumDescribeOptions(
  cb: (fn: readonly [Spy, Spy]) => void,
) {
  await assertDescribeOptions({ ignore: true }, cb);
}

async function assertItOptions(
  expectedOptions: Omit<Ende.TestDefinition, "name" | "fn">,
  cb: (fn: Spy) => void,
) {
  using test = stub(Ende, "test");
  const fn = spy();
  try {
    cb(fn);

    assertSpyCalls(fn, 0);
    assertSpyCall(test, 0);
    const call = test.calls[0];
    const options = call?.args[0] as Ende.TestDefinition;
    assertEquals(
      Object.keys(options).sort(),
      ["name", "fn", ...Object.keys(expectedOptions)].sort(),
    );
    assertObjectMatch(options, {
      name: "example",
      ...expectedOptions,
    });

    const context = new TestContext("example");
    const result = options.fn(context);
    assertStrictEquals(Promise.resolve(result), result);
    assertEquals(await result, undefined);
    assertSpyCalls(context.spies.step, 0);
    assertSpyCall(fn, 0, {
      self: {},
      args: [context],
      returned: undefined,
    });
    assertSpyCalls(fn, 1);
  } finally {
    TestSuiteInternal.reset();
  }
}

export async function assertMinimumItOptions(
  cb: (fn: Spy) => void,
) {
  await assertItOptions({ ignore: true }, cb);
}
