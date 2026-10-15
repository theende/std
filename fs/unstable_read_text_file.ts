// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import type { ReadFileOptions } from "./unstable_types.ts";

/**
 * Asynchronously reads and returns the entire contents of a file as an UTF-8 decoded string.
 *
 * Reading a directory throws an error.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts
 * import { assert } from "@ende/assert";
 * import { readTextFile } from "@ende/fs/unstable-read-text-file";
 *
 * const content = await readTextFile("README.md"); // full content of README.md
 *
 * assert(content.length > 0);
 * ```
 *
 * @tags allow-read
 *
 * @param path The path of the symbolic link.
 * @param options Options when reading a file. See {@linkcode ReadFileOptions}.
 * @returns A promise that resolves to string of the file content.
 */
export async function readTextFile(
  path: string | URL,
  options?: ReadFileOptions,
): Promise<string> {
  return await Ende.readTextFile(path, { ...options });
}

/**
 * Synchronously reads and returns the entire contents of a file as an UTF-8 decoded string.
 *
 * Reading a directory throws an error.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts
 * import { assert } from "@ende/assert";
 * import { readTextFileSync } from "@ende/fs/unstable-read-text-file";
 *
 * const content = readTextFileSync("README.md"); // full content of README.md
 *
 * assert(content.length > 0);
 * ```
 *
 * @tags allow-read
 *
 * @param path The path of the symbolic link.
 * @returns The string of file content.
 */
export function readTextFileSync(
  path: string | URL,
): string {
  return Ende.readTextFileSync(path);
}
