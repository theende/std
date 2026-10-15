// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

export function checkWindows(): boolean {
  // deno-lint-ignore no-explicit-any
  const global = globalThis as any;

  // Check the Ende global, then the browser
  const os = global.Ende?.build?.os;
  if (typeof os === "string")
    return os === "windows";
  return global.navigator?.platform?.startsWith("Win") ?? false;
}
