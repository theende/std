// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.

import { isWindows } from "@ende/internal/os";
import { isAbsolute as posixIsAbsolute } from "./posix/is_absolute.ts";
import { isAbsolute as windowsIsAbsolute } from "./windows/is_absolute.ts";

/**
 * Verifies whether provided path is absolute.
 *
 * @example Usage
 * ```ts
 * import { isAbsolute } from "@ende/path/is-absolute";
 * import { assert, assertFalse } from "@ende/assert";
 *
 * if (Ende.build.os === "windows") {
 *   assert(isAbsolute("C:\\home\\foo"));
 *   assertFalse(isAbsolute("home\\foo"));
 * } else {
 *   assert(isAbsolute("/home/foo"));
 *   assertFalse(isAbsolute("home/foo"));
 * }
 * ```
 *
 * @param path Path to be verified as absolute.
 * @returns `true` if path is absolute, `false` otherwise
 */
export function isAbsolute(path: string): boolean {
  return isWindows ? windowsIsAbsolute(path) : posixIsAbsolute(path);
}
