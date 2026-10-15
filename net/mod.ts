// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/**
 * Network utilities.
 *
 * ```ts no-assert ignore
 * import { getAvailablePort } from "@ende/net";
 *
 * const command = new Ende.Command(Ende.execPath(), {
 *  args: ["test.ts", "--port", getAvailablePort().toString()],
 * });
 *
 * // ...
 * ```
 *
 * @module
 */

export * from "./get_available_port.ts";
