// Copyright 2018-2026 the Deno authors. MIT license.

import { basename } from "@ende/path/basename";
import { join } from "@ende/path/join";
import { resolve } from "@ende/path/resolve";
import { ensureDir, ensureDirSync } from "./ensure_dir.ts";
import { getFileInfoType } from "./_get_file_info_type.ts";
import { toPathString } from "./_to_path_string.ts";
import { isSubdir } from "./_is_subdir.ts";
import { isWindows } from "@ende/internal/os";

/** Options for {@linkcode copy} and {@linkcode copySync}. */
export interface CopyOptions {
  /**
   * Whether to overwrite existing file or directory.
   *
   * @default {false}
   */
  overwrite?: boolean;
  /**
   * When `true`, will set last modification and access times to the ones of
   * the original source files. When `false`, timestamp behavior is
   * OS-dependent.
   *
   * > [!NOTE]
   * > This option is currently unsupported for symbolic links.
   *
   * @default {false}
   */
  preserveTimestamps?: boolean;
}

interface InternalCopyOptions extends CopyOptions {
  /** @default {false} */
  isFolder?: boolean;
}

function assertIsDate(date: Date | null, name: string): asserts date is Date {
  if (date === null) {
    throw new Error(`${name} is unavailable`);
  }
}

async function ensureValidCopy(
  src: string | URL,
  dest: string | URL,
  options: InternalCopyOptions,
): Promise<Ende.FileInfo | undefined> {
  let destStat: Ende.FileInfo;

  try {
    destStat = await Ende.lstat(dest);
  } catch (err) {
    if (err instanceof Ende.errors.NotFound) {
      return;
    }
    throw err;
  }

  if (options.isFolder && !destStat.isDirectory) {
    throw new Error(
      `Cannot overwrite non-directory '${dest}' with directory '${src}'`,
    );
  }
  if (!options.overwrite) {
    throw new Ende.errors.AlreadyExists(`'${dest}' already exists.`);
  }

  return destStat;
}

function ensureValidCopySync(
  src: string | URL,
  dest: string | URL,
  options: InternalCopyOptions,
): Ende.FileInfo | undefined {
  let destStat: Ende.FileInfo;
  try {
    destStat = Ende.lstatSync(dest);
  } catch (err) {
    if (err instanceof Ende.errors.NotFound) {
      return;
    }
    throw err;
  }

  if (options.isFolder && !destStat.isDirectory) {
    throw new Error(
      `Cannot overwrite non-directory '${dest}' with directory '${src}'`,
    );
  }
  if (!options.overwrite) {
    throw new Ende.errors.AlreadyExists(`'${dest}' already exists`);
  }

  return destStat;
}

/* copy file to dest */
async function copyFile(
  src: string | URL,
  dest: string | URL,
  options: InternalCopyOptions,
) {
  await ensureValidCopy(src, dest, options);
  await Ende.copyFile(src, dest);
  if (options.preserveTimestamps) {
    const statInfo = await Ende.stat(src);
    assertIsDate(statInfo.atime, "statInfo.atime");
    assertIsDate(statInfo.mtime, "statInfo.mtime");
    await Ende.utime(dest, statInfo.atime, statInfo.mtime);
  }
}
/* copy file to dest synchronously */
function copyFileSync(
  src: string | URL,
  dest: string | URL,
  options: InternalCopyOptions,
) {
  ensureValidCopySync(src, dest, options);
  Ende.copyFileSync(src, dest);
  if (options.preserveTimestamps) {
    const statInfo = Ende.statSync(src);
    assertIsDate(statInfo.atime, "statInfo.atime");
    assertIsDate(statInfo.mtime, "statInfo.mtime");
    Ende.utimeSync(dest, statInfo.atime, statInfo.mtime);
  }
}

/* copy symlink to dest */
async function copySymLink(
  src: string | URL,
  dest: string | URL,
  options: InternalCopyOptions,
) {
  await ensureValidCopy(src, dest, options);
  const originSrcFilePath = await Ende.readLink(src);
  const type = getFileInfoType(await Ende.lstat(src));
  if (isWindows) {
    await Ende.symlink(originSrcFilePath, dest, {
      type: type === "dir" ? "dir" : "file",
    });
  } else {
    await Ende.symlink(originSrcFilePath, dest);
  }
  if (options.preserveTimestamps) {
    const statInfo = await Ende.lstat(src);
    assertIsDate(statInfo.atime, "statInfo.atime");
    assertIsDate(statInfo.mtime, "statInfo.mtime");
    await Ende.utime(dest, statInfo.atime, statInfo.mtime);
  }
}

/* copy symlink to dest synchronously */
function copySymlinkSync(
  src: string | URL,
  dest: string | URL,
  options: InternalCopyOptions,
) {
  ensureValidCopySync(src, dest, options);
  const originSrcFilePath = Ende.readLinkSync(src);
  const type = getFileInfoType(Ende.lstatSync(src));
  if (isWindows) {
    Ende.symlinkSync(originSrcFilePath, dest, {
      type: type === "dir" ? "dir" : "file",
    });
  } else {
    Ende.symlinkSync(originSrcFilePath, dest);
  }

  if (options.preserveTimestamps) {
    const statInfo = Ende.lstatSync(src);
    assertIsDate(statInfo.atime, "statInfo.atime");
    assertIsDate(statInfo.mtime, "statInfo.mtime");
    Ende.utimeSync(dest, statInfo.atime, statInfo.mtime);
  }
}

/* copy folder from src to dest. */
async function copyDir(
  src: string | URL,
  dest: string | URL,
  options: CopyOptions,
) {
  const destStat = await ensureValidCopy(src, dest, {
    ...options,
    isFolder: true,
  });

  if (!destStat) {
    await ensureDir(dest);
  }

  if (options.preserveTimestamps) {
    const srcStatInfo = await Ende.stat(src);
    assertIsDate(srcStatInfo.atime, "statInfo.atime");
    assertIsDate(srcStatInfo.mtime, "statInfo.mtime");
    await Ende.utime(dest, srcStatInfo.atime, srcStatInfo.mtime);
  }

  src = toPathString(src);
  dest = toPathString(dest);

  const promises = [];

  for await (const entry of Ende.readDir(src)) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, basename(srcPath as string));
    if (entry.isSymlink) {
      promises.push(copySymLink(srcPath, destPath, options));
    } else if (entry.isDirectory) {
      promises.push(copyDir(srcPath, destPath, options));
    } else if (entry.isFile) {
      promises.push(copyFile(srcPath, destPath, options));
    }
  }

  await Promise.all(promises);
}

/* copy folder from src to dest synchronously */
function copyDirSync(
  src: string | URL,
  dest: string | URL,
  options: CopyOptions,
) {
  const destStat = ensureValidCopySync(src, dest, {
    ...options,
    isFolder: true,
  });

  if (!destStat) {
    ensureDirSync(dest);
  }

  if (options.preserveTimestamps) {
    const srcStatInfo = Ende.statSync(src);
    assertIsDate(srcStatInfo.atime, "statInfo.atime");
    assertIsDate(srcStatInfo.mtime, "statInfo.mtime");
    Ende.utimeSync(dest, srcStatInfo.atime, srcStatInfo.mtime);
  }

  src = toPathString(src);
  dest = toPathString(dest);

  for (const entry of Ende.readDirSync(src)) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, basename(srcPath as string));
    if (entry.isSymlink) {
      copySymlinkSync(srcPath, destPath, options);
    } else if (entry.isDirectory) {
      copyDirSync(srcPath, destPath, options);
    } else if (entry.isFile) {
      copyFileSync(srcPath, destPath, options);
    }
  }
}

/**
 * Asynchronously copy a file or directory (along with its contents), like
 * {@linkcode https://www.ibm.com/docs/en/aix/7.3?topic=c-cp-command#cp__cp_flagr | cp -r}.
 *
 * Both `src` and `dest` must both be a file or directory.
 *
 * Requires `--allow-read` and `--allow-write` permissions.
 *
 * @see {@link https://docs.ende.sh/runtime/manual/basics/permissions#file-system-access}
 * for more information on Ende's permissions system.
 *
 * @param src The source file/directory path as a string or URL.
 * @param dest The destination file/directory path as a string or URL.
 * @param options Options for copying.
 *
 * @returns A promise that resolves once the copy operation completes.
 *
 * @example Basic usage
 * ```ts ignore
 * import { copy } from "@ende/fs/copy";
 *
 * await copy("./foo", "./bar");
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting files/directories
 * ```ts ignore
 * import { copy } from "@ende/fs/copy";
 *
 * await copy("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and overwrite
 * any existing files or directories.
 *
 * @example Preserving timestamps
 * ```ts ignore
 * import { copy } from "@ende/fs/copy";
 *
 * await copy("./foo", "./bar", { preserveTimestamps: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and set the
 * last modification and access times to the ones of the original source files.
 */
export async function copy(
  src: string | URL,
  dest: string | URL,
  options: CopyOptions = {},
) {
  src = resolve(toPathString(src));
  dest = resolve(toPathString(dest));

  if (src === dest) {
    throw new Error("Source and destination cannot be the same");
  }

  const srcStat = await Ende.lstat(src);

  if (srcStat.isDirectory && isSubdir(src, dest)) {
    throw new Error(
      `Cannot copy '${src}' to a subdirectory of itself: '${dest}'`,
    );
  }

  if (srcStat.isSymlink) {
    await copySymLink(src, dest, options);
  } else if (srcStat.isDirectory) {
    await copyDir(src, dest, options);
  } else if (srcStat.isFile) {
    await copyFile(src, dest, options);
  }
}

/**
 * Synchronously copy a file or directory (along with its contents), like
 * {@linkcode https://www.ibm.com/docs/en/aix/7.3?topic=c-cp-command#cp__cp_flagr | cp -r}.
 *
 * Both `src` and `dest` must both be a file or directory.
 *
 * Requires `--allow-read` and `--allow-write` permissions.
 *
 * @see {@link https://docs.ende.sh/runtime/manual/basics/permissions#file-system-access}
 * for more information on Ende's permissions system.
 *
 * @param src The source file/directory path as a string or URL.
 * @param dest The destination file/directory path as a string or URL.
 * @param options Options for copying.
 *
 * @returns A void value that returns once the copy operation completes.
 *
 * @example Basic usage
 * ```ts ignore
 * import { copySync } from "@ende/fs/copy";
 *
 * copySync("./foo", "./bar");
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` without
 * overwriting.
 *
 * @example Overwriting files/directories
 * ```ts ignore
 * import { copySync } from "@ende/fs/copy";
 *
 * copySync("./foo", "./bar", { overwrite: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and overwrite
 * any existing files or directories.
 *
 * @example Preserving timestamps
 * ```ts ignore
 * import { copySync } from "@ende/fs/copy";
 *
 * copySync("./foo", "./bar", { preserveTimestamps: true });
 * ```
 *
 * This will copy the file or directory at `./foo` to `./bar` and set the
 * last modification and access times to the ones of the original source files.
 */
export function copySync(
  src: string | URL,
  dest: string | URL,
  options: CopyOptions = {},
) {
  src = resolve(toPathString(src));
  dest = resolve(toPathString(dest));

  if (src === dest) {
    throw new Error("Source and destination cannot be the same");
  }

  const srcStat = Ende.lstatSync(src);

  if (srcStat.isDirectory && isSubdir(src, dest)) {
    throw new Error(
      `Cannot copy '${src}' to a subdirectory of itself: '${dest}'`,
    );
  }

  if (srcStat.isSymlink) {
    copySymlinkSync(src, dest, options);
  } else if (srcStat.isDirectory) {
    copyDirSync(src, dest, options);
  } else if (srcStat.isFile) {
    copyFileSync(src, dest, options);
  }
}
