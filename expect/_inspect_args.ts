// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
// deno-lint-ignore-file

export function inspectArgs(args: unknown[]): string {
  return args.map(inspectArg).join(", ");
}

export function inspectArg(arg: unknown): string {
  const { Ende } = globalThis as any;
  return typeof Ende !== "undefined" && Ende.inspect
    ? Ende.inspect(arg)
    : String(arg);
}
