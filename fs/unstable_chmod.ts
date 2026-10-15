// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Changes the permission of a specific file/directory of specified path.
 * Ignores the process's umask.
 *
 * Requires `allow-write` permission.
 *
 * The mode is a sequence of 3 octal numbers. The first/left-most number
 * specifies the permissions for the owner. The second number specifies the
 * permissions for the group. The last/right-most number specifies the
 * permissions for others. For example, with a mode of 0o764, the owner (7)
 * can read/write/execute, the group (6) can read/write and everyone else (4)
 * can read only.
 *
 * | Number | Description |
 * | ------ | ----------- |
 * | 7      | read, write, and execute |
 * | 6      | read and write |
 * | 5      | read and execute |
 * | 4      | read only |
 * | 3      | write and execute |
 * | 2      | write only |
 * | 1      | execute only |
 * | 0      | no permission |
 *
 * NOTE: This API currently throws on Windows.
 *
 * @example Usage
 * ```ts ignore
 * import { chmod } from "@ende/fs/unstable-chmod";
 *
 * await chmod("README.md", 0o444);
 * ```
 *
 * @tags allow-write
 *
 * @param path The path to the file or directory.
 * @param mode A sequence of 3 octal numbers representing file permissions.
 */
export async function chmod(path: string | URL, mode: number) {
  await Ende.chmod(path, mode);
}

/**
 * Synchronously changes the permission of a specific file/directory of
 * specified path. Ignores the process's umask.
 *
 * Requires `allow-write` permission.
 *
 * For a full description, see {@linkcode chmod}.
 *
 * NOTE: This API currently throws on Windows.
 *
 * @example Usage
 * ```ts ignore
 * import { chmodSync } from "@ende/fs/unstable-chmod";
 *
 * chmodSync("README.md", 0o666);
 * ```
 *
 * @tags allow-write
 *
 * @param path The path to the file or directory.
 * @param mode A sequence of 3 octal numbers representing permissions. See {@linkcode chmod}.
 */
export function chmodSync(path: string | URL, mode: number) {
  Ende.chmodSync(path, mode);
}
