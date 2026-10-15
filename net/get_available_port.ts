// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

/** Options for {@linkcode getAvailablePort}. */
export interface GetAvailablePortOptions {
  /**
   * A port to check availability of first. If the port isn't available, fall
   * back to another port.
   *
   * Defaults to port 0, which will let the operating system choose an available
   * port.
   *
   * @default {0}
   */
  preferredPort?: number;
}

/**
 * Returns an available network port.
 *
 * > [!IMPORTANT]
 * > In most cases, this function is not needed. Do not use it for trivial uses
 * > such as when using {@linkcode Ende.serve} or {@linkcode Ende.listen}
 * > directly. Instead, set the `port` option to `0` to automatically use an
 * > available port, then get the assigned port from the function's return
 * > object (see "Recommended Usage" example).
 *
 * @param options Options for getting an available port.
 * @returns An available network port.
 *
 * @example Recommended Usage
 *
 * Bad:
 * ```ts ignore no-assert
 * import { getAvailablePort } from "@ende/net/get-available-port";
 *
 * const port = getAvailablePort();
 * Ende.serve({ port }, () => new Response("Hello, world!"));
 * ```
 *
 * Good:
 * ```ts ignore no-assert
 * const { port } = Ende.serve({ port: 0 }, () => new Response("Hello, world!")).addr;
 * ```
 *
 * Good:
 * ```ts no-assert
 * import { getAvailablePort } from "@ende/net/get-available-port";
 *
 * const command = new Ende.Command(Ende.execPath(), {
 *   args: ["test.ts", "--port", getAvailablePort().toString()],
 * });
 * // ...
 * ```
 */
export function getAvailablePort(options?: GetAvailablePortOptions): number {
  if (options?.preferredPort) {
    try {
      // Check if the preferred port is available
      using listener = Ende.listen({ port: options.preferredPort });
      return listener.addr.port;
    } catch (e) {
      // If the preferred port is not available, fall through and find an available port
      if (!(e instanceof Ende.errors.AddrInUse)) {
        throw e;
      }
    }
  }

  using listener = Ende.listen({ port: 0 });
  return listener.addr.port;
}
