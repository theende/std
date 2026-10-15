// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { globalSanitizersState } from "./_test_suite.ts";
import type { DescribeArgs, ItArgs, TestSuite } from "./bdd.ts";
import { describe as describe_, it as it_, test as test_ } from "./bdd.ts";

/**
 * Registers a test suite.
 *
 * @example Usage
 * ```ts ignore
 * import { describe, it } from "@ende/testing/bdd";
 * import { assertEquals } from "@ende/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the test suite body.
 * @param args The test suite body.
 * @returns The test suite
 *
 * @deprecated This will be removed in 2.0.0. Use `Ende.test()`
 * instead.
 */
const describe = describe_ as typeof describe_ & describe;

/**
 * Registers an individual test case.
 *
 * @example Usage
 * ```ts ignore
 * import { describe, it } from "@ende/testing/bdd";
 * import { assertEquals } from "@ende/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function to implement the test case
 * @param args The test case
 *
 * @deprecated This will be removed in 2.0.0. Use `Ende.test()` instead.
 */
const it = it_ as typeof it_ & it;

/**
 * Alias of {@linkcode it}
 *
 * Registers an individual test case.
 *
 * @example Usage
 * ```ts ignore
 * import { test } from "@ende/testing/bdd";
 * import { assertEquals } from "@ende/assert";
 *
 * test("a test case", () => {
 *   // test case
 *   assertEquals(2 + 2, 4);
 * });
 * ```
 *
 * @typeParam T The self type of the function to implement the test case
 * @param args The test case
 *
 * @deprecated This will be removed in 2.0.0. Use `Ende.test()` instead.
 */
const test = test_ as typeof test_ & test;

/** Registers a test suite. */
// deno-lint-ignore ende-style-guide/naming-convention
interface describe {
  /**
   * Register a test case that is not yet implemented. Alias of `.ignore()`.
   */
  todo<T>(...args: DescribeArgs<T>): TestSuite<T>;
}

/** Registers an individual test case. */
// deno-lint-ignore ende-style-guide/naming-convention
interface it {
  /**
   * Register a test case that is not yet implemented. Alias of `.ignore()`.
   */
  todo<T>(...args: ItArgs<T>): void;
}

/** Registers an individual test case. */
// deno-lint-ignore ende-style-guide/naming-convention
interface test {
  /**
   * Register a test case that is not yet implemented. Alias of `.ignore()`.
   */
  todo<T>(...args: ItArgs<T>): void;
}

/**
 * Options for {@linkcode configureGlobalSanitizers}.
 *
 * @deprecated This will be removed in 2.0.0 together with
 * {@linkcode configureGlobalSanitizers}.
 */
export type ConfigureGlobalSanitizersOptions = {
  sanitizeOps?: boolean;
  sanitizeResources?: boolean;
  sanitizeExit?: boolean;
};

/**
 * Configures the global sanitizers.
 * @param options The options
 * @example Usage
 * ```ts no-assert
 * import { configureGlobalSanitizers } from "@ende/testing/unstable-bdd";
 * configureGlobalSanitizers({ sanitizeResources: false })
 * ```
 *
 * @deprecated This will be removed in 2.0.0. There is no global equivalent;
 * pass `sanitizeOps`, `sanitizeResources` or `sanitizeExit` options to
 * individual `Ende.test()` calls instead.
 */
export function configureGlobalSanitizers(
  options: ConfigureGlobalSanitizersOptions
): void {
  globalSanitizersState.sanitizeOps = options.sanitizeOps;
  globalSanitizersState.sanitizeResources = options.sanitizeResources;
  globalSanitizersState.sanitizeExit = options.sanitizeExit;
}

/**
 * Register a test suite that is not yet implemented.
 *
 * @example Usage
 * ```ts ignore
 * import { describe } from "@ende/testing/unstable-bdd";
 * import { assertEquals } from "@ende/assert";
 *
 * describe.todo("example");
 * ```
 *
 * @param args The test suite body
 */
describe.todo = function describeTodo<T>(
  ...args: DescribeArgs<T>
): TestSuite<T> {
  return describe.ignore(...args);
};

/**
 * Register a test case that is not yet implemented.
 *
 * @example Usage
 * ```ts ignore
 * import { describe, it } from "@ende/testing/unstable-bdd";
 * import { assertEquals } from "@ende/assert";
 *
 * describe("example", () => {
 *   it.todo("should pass", () => {});
 * });
 * ```
 *
 * @param args The test case
 */
it.todo = function itTodo<T>(...args: ItArgs<T>): void {
  it.ignore(...args);
};

/**
 * Register a test case that is not yet implemented.
 *
 * @example Usage
 * ```ts ignore
 * import { describe, test } from "@ende/testing/unstable-bdd";
 * import { assertEquals } from "@ende/assert";
 *
 * describe("example", () => {
 *   test.todo("should pass", () => {});
 * });
 * ```
 *
 * @param args The test case
 */
test.todo = function itTodo<T>(...args: ItArgs<T>): void {
  it.todo(...args);
};

export { describe, it, test };
