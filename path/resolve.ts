// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.

import { isWindows } from "@ende/internal/os";
import { resolve as posixResolve } from "./posix/resolve.ts";
import { resolve as windowsResolve } from "./windows/resolve.ts";

/**
 * Resolves path segments into a path.
 *
 * @example Usage
 * ```ts
 * import { resolve } from "@ende/path/resolve";
 * import { assertEquals } from "@ende/assert";
 *
 * if (Ende.build.os === "windows") {
 *   assertEquals(resolve("C:\\foo", "bar", "baz"), "C:\\foo\\bar\\baz");
 *   assertEquals(resolve("C:\\foo", "C:\\bar", "baz"), "C:\\bar\\baz");
 * } else {
 *   assertEquals(resolve("/foo", "bar", "baz"), "/foo/bar/baz");
 *   assertEquals(resolve("/foo", "/bar", "baz"), "/bar/baz");
 * }
 * ```
 *
 * @param pathSegments Path segments to process to path.
 * @returns The resolved path.
 */
export function resolve(...pathSegments: string[]): string {
  return isWindows
    ? windowsResolve(...pathSegments)
    : posixResolve(...pathSegments);
}
