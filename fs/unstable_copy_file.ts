// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Copies the contents and permissions of one file to another specified path, by default creating a
 * new file if needed, else overwriting. Fails if target path is a directory or is unwritable.
 *
 * Requires `allow-read` and `allow-write` permission.
 *
 * For a full description, see {@linkcode copyFile}.
 *
 * @example Usage
 * ```ts ignore
 * import { copyFile } from "@ende/fs/unstable-copy-file";
 * copyFile("README.md", "README-Copy.md");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param from The path of source filename to copy.
 * @param to The path of destination filename.
 */
export async function copyFile(
  from: string | URL,
  to: string | URL
): Promise<void> {
  await Ende.copyFile(from, to);
}

/**
 * Synchronously copies the contents and permissions of one file to another specified path,
 * by default creating a new file if needed, else overwriting. Fails if target path is a directory
 * or is unwritable.
 *
 * Requires `allow-read` and `allow-write` permission.
 *
 * For a full description, see {@linkcode copyFileSync}.
 *
 * @example Usage
 * ```ts ignore
 * import { copyFileSync } from "@ende/fs/unstable-copy-file";
 * copyFileSync("README.md", "README-Copy.md");
 * ```
 *
 * @tags allow-read, allow-write
 *
 * @param from The path of source filename to copy.
 * @param to The path of destination filename.
 */
export function copyFileSync(
  from: string | URL,
  to: string | URL
) {
  Ende.copyFileSync(from, to);
}
