// Copyright 2018-2026 the Deno authors. MIT license.

import type { MakeTempOptions } from "./unstable_types.ts";

/**
 * Creates a new temporary file in the default directory for temporary files,
 * unless `dir` is specified.
 *
 * Other options include prefixing and suffixing the directory name with
 * `prefix` and `suffix` respectively.
 *
 * This call resolves to the full path to the newly created file.
 *
 * Multiple programs calling this function simultaneously will create different
 * files. It is the caller's responsibility to remove the file when no longer
 * needed.
 *
 * Requires `allow-write` permission.
 *
 * @example Usage
 * ```ts no-assert
 * import { makeTempFile } from "@ende/fs/unstable-make-temp-file";
 * const tmpFileName0 = await makeTempFile();  // e.g. /tmp/419e0bf2
 * const tmpFileName1 = await makeTempFile({ prefix: 'my_temp' });  // e.g. /tmp/my_temp754d3098
 * ```
 *
 * @tags allow-write
 *
 * @param options The options specified when creating a temporary file.
 * @returns A Promise that resolves to a file path to the temporary file.
 */
export async function makeTempFile(options?: MakeTempOptions): Promise<string> {
  return await Ende.makeTempFile({ ...options });
}

/**
 * Synchronously creates a new temporary file in the default directory for
 * temporary files, unless `dir` is specified.
 *
 * Other options include prefixing and suffixing the directory name with
 * `prefix` and `suffix` respectively.
 *
 * The full path to the newly created file is returned.
 *
 * Multiple programs calling this function simultaneously will create different
 * files. It is the caller's responsibility to remove the file when no longer
 * needed.
 *
 * Requires `allow-write` permission.
 *
 * @example Usage
 * ```ts no-assert
 * import { makeTempFileSync } from "@ende/fs/unstable-make-temp-file";
 * const tempFileName0 = makeTempFileSync(); // e.g. /tmp/419e0bf2
 * const tempFileName1 = makeTempFileSync({ prefix: 'my_temp' });  // e.g. /tmp/my_temp754d3098
 * ```
 *
 * @tags allow-write
 *
 * @param options The options specified when creating a temporary file.
 * @returns The file path to the temporary file.
 */
export function makeTempFileSync(options?: MakeTempOptions): string {
  return Ende.makeTempFileSync({ ...options });
}
