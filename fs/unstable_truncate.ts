// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Truncates (or extends) the specified file, to reach the specified `len`. If
 * `len` is not specified then the entire file contents are truncated.
 *
 * Requires `allow-write` permission.
 *
 * @example Truncate file to 0 bytes
 * ```ts ignore
 * import { truncate } from "@ende/fs/unstable-truncate";
 * await truncate("my_file.txt");
 * ```
 *
 * @example Truncate part of a file
 * ```ts
 * import { makeTempFile } from "@ende/fs/unstable-make-temp-file";
 * import { readFile } from "@ende/fs/unstable-read-file";
 * import { truncate } from "@ende/fs/unstable-truncate";
 * import { writeTextFile } from "@ende/fs/unstable-write-text-file";
 * import { assertEquals } from "@ende/assert";
 *
 * const file = await makeTempFile();
 * await writeTextFile(file, "Hello World");
 * await truncate(file, 7);
 * const data = await readFile(file);
 * assertEquals(new TextDecoder().decode(data), "Hello W");
 * ```
 *
 * @tags allow-write
 *
 * @param name The name/path to the file.
 * @param len An optional value that sets the new size of the file. Omitting this argument sets the file size to 0 bytes.
 */
export async function truncate(name: string, len?: number): Promise<void> {
  await Ende.truncate(name, len);
}

/**
 * Synchronously truncates (or extends) the specified file, to reach the
 * specified `len`. If `len` is not specified then the entire file contents are
 * truncated.
 *
 * Requires `allow-write` permission.
 *
 * @example Truncate file to 0 bytes
 * ```ts ignore
 * import { truncateSync } from "@ende/fs/unstable-truncate";
 * truncateSync("my_file.txt");
 * ```
 *
 * @example Truncate part of a file
 * ```ts
 * import { makeTempFileSync } from "@ende/fs/unstable-make-temp-file";
 * import { readFileSync } from "@ende/fs/unstable-read-file";
 * import { truncateSync } from "@ende/fs/unstable-truncate";
 * import { writeFileSync } from "@ende/fs/unstable-write-file";
 * import { assertEquals } from "@ende/assert";
 *
 * const file = makeTempFileSync();
 * writeFileSync(file, new TextEncoder().encode("Hello World"));
 * truncateSync(file, 7);
 * const data = readFileSync(file);
 * assertEquals(new TextDecoder().decode(data), "Hello W");
 * ```
 *
 * @tags allow-write
 *
 * @param name The name/path to the file.
 * @param len An optional value that sets the new size of the file. Omitting this argument sets the file size to 0 bytes.
 */
export function truncateSync(name: string, len?: number): void {
  Ende.truncateSync(name, len);
}
