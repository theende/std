// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Change owner of a regular file or directory.
 *
 * This functionality is not available on Windows.
 *
 * Requires `allow-write` permission.
 *
 * Throws Error (not implemented) if executed on Windows.
 *
 * @example Usage
 * ```ts ignore
 * import { chown } from "@ende/fs/unstable-chown";
 * await chown("README.md", 1000, 1002);
 * ```
 *
 * @tags allow-write
 *
 * @param path The path to the file/directory.
 * @param uid The user id (UID) of the new owner, or `null` for no change.
 * @param gid The group id (GID) of the new owner, or `null` for no change.
 */
// deno-lint-ignore ende-style-guide/exported-function-args-maximum
export async function chown(
  path: string | URL,
  uid: number | null,
  gid: number | null,
): Promise<void> {
  await Ende.chown(path, uid, gid);
}

/**
 * Synchronously change owner of a regular file or directory.
 *
 * This functionality is not available on Windows.
 *
 * Requires `allow-write` permission.
 *
 * Throws Error (not implemented) if executed on Windows.
 *
 * @example Usage
 * ```ts ignore
 * import { chownSync } from "@ende/fs/unstable-chown";
 * chownSync("README.md", 1000, 1002);
 * ```
 *
 * @tags allow-write
 *
 * @param path The path to the file/directory.
 * @param uid The user id (UID) of the new owner, or `null` for no change.
 * @param gid The group id (GID) of the new owner, or `null` for no change.
 */
// deno-lint-ignore ende-style-guide/exported-function-args-maximum
export function chownSync(
  path: string | URL,
  uid: number | null,
  gid: number | null,
): void {
  Ende.chownSync(path, uid, gid);
}
