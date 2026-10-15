// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import type { ReadFileOptions } from "./unstable_types.ts";

/**
 * Reads and resolves to the entire contents of a file as an array of bytes.
 * `TextDecoder` can be used to transform the bytes to string if required.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts no-assert
 * import { readFile } from "@ende/fs/unstable-read-file";
 * const decoder = new TextDecoder("utf-8");
 * const data = await readFile("README.md");
 * console.log(decoder.decode(data));
 * ```
 *
 * @tags allow-read
 *
 * @param path The path to the file.
 * @param options Options when reading a file. See {@linkcode ReadFileOptions}.
 * @returns A promise that resolves to a `Uint8Array` of the file contents.
 */
export async function readFile(
  path: string | URL,
  options?: ReadFileOptions,
): Promise<Uint8Array> {
  return await Ende.readFile(path, { ...options });
}

/**
 * Synchronously reads and returns the entire contents of a file as an array
 * of bytes. `TextDecoder` can be used to transform the bytes to string if
 * required.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts no-assert
 * import { readFileSync } from "@ende/fs/unstable-read-file";
 * const decoder = new TextDecoder("utf-8");
 * const data = readFileSync("README.md");
 * console.log(decoder.decode(data));
 * ```
 *
 * @tags allow-read
 *
 * @param path The path to the file.
 * @returns A `Uint8Array` of bytes representing the file contents.
 */
export function readFileSync(path: string | URL): Uint8Array {
  return Ende.readFileSync(path);
}
