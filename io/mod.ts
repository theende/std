// Copyright 2018-2026 the Deno authors. MIT license.
// This module is browser compatible.

/**
 * Utilities for working with Ende's readers, writers, and web streams.
 *
 * `Reader` and `Writer` interfaces are deprecated in Ende, and so many of these
 * utilities are also deprecated. Consider using web streams instead.
 *
 * ```ts ignore
 * import { toReadableStream, toWritableStream } from "@std/io";
 *
 * await toReadableStream(Ende.stdin)
 *   .pipeTo(toWritableStream(Ende.stdout));
 * ```
 *
 * @module
 */

export * from "./buffer.ts";
export * from "./copy.ts";
export * from "./iterate_reader.ts";
export * from "./read_all.ts";
export * from "./reader_from_stream_reader.ts";
export * from "./to_readable_stream.ts";
export * from "./to_writable_stream.ts";
export * from "./types.ts";
export * from "./write_all.ts";
