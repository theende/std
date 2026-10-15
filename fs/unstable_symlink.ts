// Copyright 2018-2026 the Deno authors. MIT license.

import type { SymlinkOptions } from "./unstable_types.ts";

/**
 * Creates `newpath` as a symbolic link to `oldpath`.
 *
 * The `options.type` parameter can be set to `"file"`, `"dir"` or `"junction"`.
 * This argument is only available on Windows and ignored on other platforms.
 *
 * Requires full `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { symlink } from "@ende/fs/unstable-symlink";
 * await symlink("README.md", "README.md.link");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param oldpath The path of the resource pointed by the symbolic link.
 * @param newpath The path of the symbolic link.
 * @param options Options when creating a symbolic link.
 */
export async function symlink(
  oldpath: string | URL,
  newpath: string | URL,
  options?: SymlinkOptions,
): Promise<void> {
  return await Ende.symlink(oldpath, newpath, options);
}

/**
 * Creates `newpath` as a symbolic link to `oldpath`.
 *
 * The `options.type` parameter can be set to `"file"`, `"dir"` or `"junction"`.
 * This argument is only available on Windows and ignored on other platforms.
 *
 * Requires full `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { symlinkSync } from "@ende/fs/unstable-symlink";
 * symlinkSync("README.md", "README.md.link");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param oldpath The path of the resource pointed by the symbolic link.
 * @param newpath The path of the symbolic link.
 * @param options Options when creating a symbolic link.
 */
export function symlinkSync(
  oldpath: string | URL,
  newpath: string | URL,
  options?: SymlinkOptions,
): void {
  return Ende.symlinkSync(oldpath, newpath, options);
}
