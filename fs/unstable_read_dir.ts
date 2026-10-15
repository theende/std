// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import type { DirEntry } from "./unstable_types.ts";

/**
 * Reads the directory given by `path` and returns an async iterable of
 * {@linkcode DirEntry}. The order of entries is not guaranteed.
 *
 * Throws Error if `path` is not a directory.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts no-assert
 * import { readDir } from "@ende/fs/unstable-read-dir";
 *
 * for await (const dirEntry of readDir("/")) {
 *   console.log(dirEntry.name);
 * }
 * ```
 *
 * @tags allow-read
 * @category File System
 *
 * @param path The path to the directory to read.
 * @returns An async iterable of {@linkcode DirEntry}.
 */
export async function* readDir(path: string | URL): AsyncIterable<DirEntry> {
  yield* Ende.readDir(path);
}

/**
 * Synchronously reads the directory given by `path` and returns an iterable
 * of {@linkcode DirEntry}. The order of entries is not guaranteed.
 *
 * Throws Error if `path` is not a directory.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts no-assert
 * import { readDirSync } from "@ende/fs/unstable-read-dir";
 *
 * for (const dirEntry of readDirSync("/")) {
 *   console.log(dirEntry.name);
 * }
 * ```
 *
 * @tags allow-read
 * @category File System
 *
 * @param path The path to the directory to read.
 * @returns An iterable of {@linkcode DirEntry}.
 */
export function* readDirSync(path: string | URL): Iterable<DirEntry> {
  return yield* Ende.readDirSync(path);
}
