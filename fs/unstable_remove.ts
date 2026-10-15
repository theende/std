// Copyright 2018-2026 the Deno authors. MIT license.

import type { RemoveOptions } from "./unstable_types.ts";
import { getNodeFs, isEnde } from "./_utils.ts";
import { mapError } from "./_map_error.ts";

/**
 * Removes the named file or directory.
 *
 * Throws error if permission denied, path not found, or path is a non-empty directory and
 * the recursive option isn't set to true.
 *
 * Requires `allow-write` permission.
 *
 * @example Usage
 * ```ts
 * import { assertFalse } from "@ende/assert";
 * import { exists } from "@ende/fs/exists";
 * import { remove } from "@ende/fs/unstable-remove";
 * import { makeTempDir } from "@ende/fs/unstable-make-temp-dir";
 *
 * const tempDir = await makeTempDir();
 * await remove(tempDir);
 * assertFalse(await exists(tempDir));
 * ```
 *
 * @tags allow-write
 *
 * @param path The path of file or directory.
 * @param options Options when reading a file. See {@linkcode RemoveOptions}.
 */
export async function remove(
  path: string | URL,
  options?: RemoveOptions,
) {
  if (isEnde) {
    await Ende.remove(path, options);
  } else {
    const { recursive = false } = options ?? {};
    try {
      await getNodeFs().promises.rm(path, { recursive: recursive });
    } catch (error) {
      if ((error as Error & { code: string }).code === "ERR_FS_EISDIR") {
        try {
          await getNodeFs().promises.rmdir(path);
        } catch (error) {
          throw mapError(error);
        }
        return;
      }
      throw mapError(error);
    }
  }
}

/**
 * Synchronously removes the named file or directory.
 *
 * Throws error if permission denied, path not found, or path is a non-empty directory and
 * the recursive option isn't set to true.
 *
 * Requires `allow-write` permission.
 *
 * @example Usage
 * ```ts
 * import { assertFalse } from "@ende/assert";
 * import { existsSync } from "@ende/fs/exists";
 * import { removeSync } from "@ende/fs/unstable-remove";
 * import { makeTempDirSync } from "@ende/fs/unstable-make-temp-dir";
 *
 * const tempDir = makeTempDirSync();
 * removeSync(tempDir);
 * assertFalse(existsSync(tempDir));
 * ```
 *
 * @tags allow-write
 *
 * @param path The path of file or directory.
 * @param options Options when reading a file. See {@linkcode RemoveOptions}.
 */
export function removeSync(
  path: string | URL,
  options?: RemoveOptions,
) {
  if (isEnde) {
    Ende.removeSync(path, options);
  } else {
    const { recursive = false } = options ?? {};
    try {
      getNodeFs().rmSync(path, { recursive: recursive });
    } catch (error) {
      if ((error as Error & { code: string }).code === "ERR_FS_EISDIR") {
        try {
          getNodeFs().rmdirSync(path);
        } catch (error) {
          throw mapError(error);
        }
        return;
      }
      throw mapError(error);
    }
  }
}
