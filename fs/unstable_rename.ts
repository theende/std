// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Renames (moves) `oldpath` to `newpath`. Paths may be files or directories.
 * If `newpath` already exists and is not a directory, `rename()` replaces it.
 * OS-specific restrictions may apply when `oldpath` and `newpath` are in
 * different directories.
 *
 * On Unix-like OSes, this operation does not follow symlinks at either path.
 *
 * It varies between platforms when the operation throws errors, and if so
 * what they are. It's always an error to rename anything to a non-empty
 * directory.
 *
 * Requires `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { rename } from "@ende/fs/unstable-rename";
 * await rename("old/path", "new/path");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param oldpath The current name/path of the file/directory.
 * @param newpath The updated name/path of the file/directory.
 */
export async function rename(
  oldpath: string | URL,
  newpath: string | URL
): Promise<void> {
  await Ende.rename(oldpath, newpath);
}

/**
 * Synchronously renames (moves) `oldpath` to `newpath`. Paths may be files or
 * directories. If `newpath` already exists and is not a directory,
 * `renameSync()` replaces it. OS-specific restrictions may apply when
 * `oldpath` and `newpath` are in different directories.
 *
 * On Unix-like OSes, this operation does not follow symlinks at either path.
 *
 * It varies between platforms when the operation throws errors, and if so what
 * they are. It's always an error to rename anything to a non-empty directory.
 *
 * Requires `allow-read` and `allow-write` permissions.
 *
 * @example Usage
 * ```ts ignore
 * import { renameSync } from "@ende/fs/unstable-rename";
 * renameSync("old/path", "new/path");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param oldpath The current name/path of the file/directory.
 * @param newpath The updated name/path of the file/directory.
 */
export function renameSync(oldpath: string | URL, newpath: string | URL): void {
  Ende.renameSync(oldpath, newpath);
}
