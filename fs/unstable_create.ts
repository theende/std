// Copyright 2018-2026 the Deno authors. MIT license.

import type { FsFile } from "./unstable_types.ts";

/**
 * Creates a file if none exists or truncates an existing file and resolves to
 * an instance of {@linkcode FsFile}.
 *
 * Requires `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { create } from "@ende/fs/unstable-create";
 * const file = await create("/foo/bar.txt");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param path The path to the newly created file.
 * @returns A promise that resolves to a {@linkcode FsFile} instance.
 */
export async function create(path: string | URL): Promise<FsFile> {
  return await Ende.create(path);
}

/**
 * Creates a file if none exists or truncates an existing file and returns
 * an instance of {@linkcode FsFile}.
 *
 * Requires `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { createSync } from "@ende/fs/unstable-create";
 * const file = createSync("/foo/bar.txt");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param path The path to the newly created file.
 * @returns A {@linkcode FsFile} instance.
 */
export function createSync(path: string | URL): FsFile {
  return Ende.createSync(path);
}
