// Copyright 2018-2026 the Deno authors. MIT license.

/**
 * Creates `newpath` as a hard link to `oldpath`.
 *
 * Requires `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { link } from "@ende/fs/unstable-link";
 * await link("old/name", "new/name");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param oldpath The path of the resource pointed by the hard link.
 * @param newpath The path of the hard link.
 */
export async function link(oldpath: string, newpath: string): Promise<void> {
  await Ende.link(oldpath, newpath);
}

/**
 * Synchronously creates `newpath` as a hard link to `oldpath`.
 *
 * Requires `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { linkSync } from "@ende/fs/unstable-link";
 * linkSync("old/name", "new/name");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param oldpath The path of the resource pointed by the hard link.
 * @param newpath The path of the hard link.
 */
export function linkSync(oldpath: string, newpath: string): void {
  Ende.linkSync(oldpath, newpath);
}
