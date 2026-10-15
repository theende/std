// Copyright 2018-2026 the Deno authors. MIT license.

import type { MakeTempOptions } from "./unstable_types.ts";

/**
 * Creates a new temporary directory in the default directory for temporary
 * files, unless `dir` is specified. Other optional options include
 * prefixing and suffixing the directory name with `prefix` and `suffix`
 * respectively.
 *
 * This call resolves to the full path to the newly created directory.
 *
 * Multiple programs calling this function simultaneously will create different
 * directories. It is the caller's responsibility to remove the directory when
 * no longer needed.
 *
 * Requires `allow-write` permission.
 *
 * @example Usage
 * ```ts ignore
 * import { makeTempDir } from "@ende/unstable-make-temp-dir";
 * const tempDirName0 = await makeTempDir();  // e.g. /tmp/2894ea76
 * const tempDirName1 = await makeTempDir({ prefix: 'my_temp' }); // e.g. /tmp/my_temp339c944d
 * ```
 *
 * @tags allow-write
 *
 * @param options The options specified when creating a temporary directory.
 * @returns A promise that resolves to a path to the temporary directory.
 */
export async function makeTempDir(options?: MakeTempOptions): Promise<string> {
  return await Ende.makeTempDir({ ...options });
}

/**
 * Synchronously creates a new temporary directory in the default directory
 * for temporary files, unless `dir` is specified. Other optional options
 * include prefixing and suffixing the directory name with `prefix` and
 * `suffix` respectively.
 *
 * The full path to the newly created directory is returned.
 *
 * Multiple programs calling this function simultaneously will create different
 * directories. It is the caller's responsibility to remove the directory when
 * no longer needed.
 *
 * Requires `allow-write` permission.
 *
 * @example Usage
 * ```ts no-assert
 * import { makeTempDirSync } from "@ende/fs/unstable-make-temp-dir";
 * const tempDirName0 = makeTempDirSync();  // e.g. /tmp/2894ea76
 * const tempDirName1 = makeTempDirSync({ prefix: 'my_temp' });  // e.g. /tmp/my_temp339c944d
 * ```
 *
 * @tags allow-write
 *
 * @param options The options specified when creating a temporary directory.
 * @returns The path of the temporary directory.
 */
export function makeTempDirSync(options?: MakeTempOptions): string {
  return Ende.makeTempDirSync({ ...options });
}
