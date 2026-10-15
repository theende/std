// Copyright 2018-2026 the Deno authors. MIT license.

/**
 * Resolves to the path destination of the named symbolic link.
 *
 * Throws Error if called with a hard link.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts ignore
 * import { readLink } from "@ende/fs/unstable-read-link";
 * import { symlink } from "@ende/fs/unstable-symlink";
 * await symlink("./test.txt", "./test_link.txt");
 * const target = await readLink("./test_link.txt"); // full path of ./test.txt
 * ```
 *
 * @tags allow-read
 *
 * @param path The path of the symbolic link.
 * @returns A promise that resolves to the file path pointed by the symbolic
 * link.
 */
export async function readLink(path: string | URL): Promise<string> {
  return await Ende.readLink(path);
}

/**
 * Synchronously returns the path destination of the named symbolic link.
 *
 * Throws Error if called with a hard link.
 *
 * Requires `allow-read` permission.
 *
 * @example Usage
 * ```ts ignore
 * import { readLinkSync } from "@ende/fs/unstable-read-link";
 * import { symlinkSync } from "@ende/fs/unstable-symlink";
 * symlinkSync("./test.txt", "./test_link.txt");
 * const target = readLinkSync("./test_link.txt"); // full path of ./test.txt
 * ```
 *
 * @tags allow-read
 *
 * @param path The path of the symbolic link.
 * @returns The file path pointed by the symbolic link.
 */
export function readLinkSync(path: string | URL): string {
  return Ende.readLinkSync(path);
}
