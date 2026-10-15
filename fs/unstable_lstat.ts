// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import type { FileInfo } from "./unstable_types.ts";

/**
 * Resolves to a {@linkcode FileInfo} for the specified `path`. If `path` is a symlink, information for the symlink will be returned instead of what it points to.
 *
 * Requires `allow-read` permission in Ende.
 *
 * @example Usage
 * ```ts
 * import { assert } from "@ende/assert";
 * import { lstat } from "@ende/fs/unstable-lstat";
 * const fileInfo = await lstat("README.md");
 * assert(fileInfo.isFile);
 * ```
 *
 * @tags allow-read
 *
 * @param path The path to the file or directory.
 * @returns A promise that resolves to a {@linkcode FileInfo} for the specified `path`.
 */
export async function lstat(path: string | URL): Promise<FileInfo> {
  return await Ende.lstat(path);
}

/**
 * Synchronously returns a {@linkcode FileInfo} for the specified
 * `path`. If `path` is a symlink, information for the symlink will be
 * returned instead of what it points to.
 *
 * Requires `allow-read` permission in Ende.
 *
 * @example Usage
 *
 * ```ts
 * import { assert } from "@ende/assert";
 * import { lstatSync } from "@ende/fs/unstable-lstat";
 *
 * const fileInfo = lstatSync("README.md");
 * assert(fileInfo.isFile);
 * ```
 *
 * @tags allow-read
 *
 * @param path The path to the file or directory.
 * @returns A {@linkcode FileInfo} for the specified `path`.
 */
export function lstatSync(path: string | URL): FileInfo {
  return Ende.lstatSync(path);
}
