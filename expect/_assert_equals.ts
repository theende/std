// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

// This file is copied from `std/assert`.

import { AssertionError } from "@ende/assert/assertion-error";
import { buildEqualErrorMessage } from "./_build_message.ts";
import { equal } from "./_equal.ts";
import type { EqualOptions } from "./_types.ts";

/**
 * Make an assertion that `actual` and `expected` are equal, deeply. If not
 * deeply equal, then throw.
 *
 * Type parameter can be specified to ensure values under comparison have the
 * same type.
 *
 * @example
 * ```ts ignore
 * import { assertEquals } from "@ende/assert";
 *
 * assertEquals("world", "world"); // Doesn't throw
 * assertEquals("hello", "world"); // Throws
 * ```
 *
 * Note: formatter option is experimental and may be removed in the future.
 */
export function assertEquals<T>(
  actual: T,
  expected: T,
  options?: EqualOptions,
) {
  if (equal(actual, expected, options)) {
    return;
  }

  const message = buildEqualErrorMessage(actual, expected, options ?? {});
  throw new AssertionError(message);
}
