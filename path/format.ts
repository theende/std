// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// This module is browser compatible.

import { isWindows } from "@ende/internal/os";
import { format as posixFormat } from "./posix/format.ts";
import { format as windowsFormat } from "./windows/format.ts";
import type { ParsedPath } from "./types.ts";

/**
 * Generate a path from a {@linkcode ParsedPath} object. It does the
 * opposite of {@linkcode https://jsr.io/@ende/path/doc/~/parse | parse()}.
 *
 * @example Usage
 * ```ts
 * import { format } from "@ende/path/format";
 * import { assertEquals } from "@ende/assert";
 *
 * if (Ende.build.os === "windows") {
 *   assertEquals(format({ dir: "C:\\path\\to", base: "script.ts" }), "C:\\path\\to\\script.ts");
 * } else {
 *   assertEquals(format({ dir: "/path/to/dir", base: "script.ts" }), "/path/to/dir/script.ts");
 * }
 * ```
 *
 * @param pathObject Object with path components.
 * @returns The formatted path.
 */
export function format(pathObject: Partial<ParsedPath>): string {
  return isWindows ? windowsFormat(pathObject) : posixFormat(pathObject);
}
