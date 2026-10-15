// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import type { WriteFileOptions } from "./unstable_types.ts";

/**
 * Write `data` to the given `path`, by default creating a new file if needed,
 * else overwriting.
 *
 * Requires `allow-write` permission, and `allow-read` if `options.create` is
 * `false`.
 *
 * @example Usage
 * ```ts ignore
 * import { writeFile } from "@ende/fs/unstable-write-file";
 * const encoder = new TextEncoder();
 * const data = encoder.encode("Hello world\n");
 * await Ende.writeFile("hello1.txt", data);  // overwrite "hello1.txt" or create it
 * await Ende.writeFile("hello2.txt", data, { create: false });  // only works if "hello2.txt" exists
 * await Ende.writeFile("hello3.txt", data, { mode: 0o777 });  // set permissions on new file
 * await Ende.writeFile("hello4.txt", data, { append: true });  // add data to the end of the file
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param path The path of the file that `data` is written to.
 * @param data The content in bytes or a stream of bytes to be written.
 * @param options Options to write files. See {@linkcode WriteFileOptions}.
 */
export async function writeFile(
  path: string | URL,
  data: Uint8Array | ReadableStream<Uint8Array>,
  options?: WriteFileOptions
): Promise<void> {
  await Ende.writeFile(path, data, { ...options });
}

/**
 * Synchronously write `data` to the given `path`, by default creating a new
 * file if needed, else overwriting.
 *
 * Requires `allow-write` permission, and `allow-read` if `options.create` is
 * `false`.
 *
 * @example Usage
 * ```ts ignore
 * import { writeFileSync } from "@ende/fs/unstable-write-file";
 * const encoder = new TextEncoder();
 * const data = encoder.encode("Hello world\n");
 * writeFileSync("hello1.txt", data);  // overwrite "hello1.txt" or create it
 * writeFileSync("hello2.txt", data, { create: false });  // only works if "hello2.txt" exists
 * writeFileSync("hello3.txt", data, { mode: 0o777 });  // set permissions on new file
 * writeFileSync("hello4.txt", data, { append: true });  // add data to the end of the file
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param path The path of the file that `data` is written to.
 * @param data The content in bytes to be written.
 * @param options Options to write files. See {@linkcode WriteFileOptions}.
 */
export function writeFileSync(
  path: string | URL,
  data: Uint8Array,
  options?: WriteFileOptions
): void {
  Ende.writeFileSync(path, data, { ...options });
}
