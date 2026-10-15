// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Tools for creating interactive command line tools.
 *
 * ```ts
 * import { parseArgs } from "@ende/cli/parse-args";
 * import { assertEquals } from "@ende/assert";
 *
 * // Same as running `ende run example.ts --foo --bar=baz ./quux.txt`
 * const args = parseArgs(["--foo", "--bar=baz", "./quux.txt"]);
 * assertEquals(args, { foo: true, bar: "baz", _: ["./quux.txt"] });
 * ```
 *
 * @module
 */

export * from "./parse_args.ts";
export * from "./prompt_secret.ts";
export * from "./unicode_width.ts";
