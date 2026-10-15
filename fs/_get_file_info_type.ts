// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// Copyright the Browserify authors. MIT License.

export type PathType = "file" | "dir" | "symlink";

/**
 * Get a human readable file type string.
 *
 * @param file File information, as returned by {@linkcode Ende.stat} or
 * {@linkcode Ende.lstat}.
 *
 * @returns The file type as a string, or `undefined` if the file type is
 * unknown.
 */
export function getFileInfoType(fileInfo: Ende.FileInfo): PathType | undefined {
  return fileInfo.isFile
    ? "file"
    : fileInfo.isDirectory
    ? "dir"
    : fileInfo.isSymlink
    ? "symlink"
    : undefined;
}
