// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import type { FileInfo } from "./unstable_types.ts";

/**
 * Resolves to a {@linkcode FileInfo} for the specified `path`. Will
 * always follow symlinks.
 *
 * Requires `allow-read` permission in Ende.
 *
 * @example Usage
 * ```ts
 * import { assert } from "@ende/assert";
 * import { stat } from "@ende/fs/unstable-stat";
 * const fileInfo = await stat("README.md");
 * assert(fileInfo.isFile);
 * ```
 *
 * @tags allow-read
 *
 * @param path The path to the file or directory.
 * @returns A promise that resolves to a {@linkcode FileInfo} for the specified `path`.
 */
export async function stat(path: string | URL): Promise<FileInfo> {
  return await Ende.stat(path);
}

/**
 * Synchronously returns a {@linkcode FileInfo} for the specified
 * `path`. Will always follow symlinks.
 *
 * Requires `allow-read` permission in Ende.
 *
 * @example Usage
 * ```ts
 * import { assert } from "@ende/assert";
 * import { statSync } from "@ende/fs/unstable-stat";
 *
 * const fileInfo = statSync("README.md");
 * assert(fileInfo.isFile);
 * ```
 *
 * @tags allow-read
 *
 * @param path The path to the file or directory.
 * @returns A {@linkcode FileInfo} for the specified `path`.
 */
export function statSync(path: string | URL): FileInfo {
  return Ende.statSync(path);
}
