// Copyright 2018-2026 the Deno authors. MIT license.
export interface EndeJson {
  name: string;
  version: string;
  exports: Record<string, string>;
  workspace?: string[];
}

async function importJson(path: string): Promise<EndeJson> {
  return (await import(path, { with: { type: "json" } })).default;
}

export async function getPackagesEndeJsons(): Promise<EndeJson[]> {
  const { workspace } = await importJson("../ende.json");
  return Promise.all(
    workspace!.map((path) => importJson(`../${path}/ende.json`)),
  );
}

export async function getEntrypoints(): Promise<string[]> {
  return (await getPackagesEndeJsons())
    .flatMap(({ name, exports }) =>
      Object.keys(exports).map((mod) =>
        mod === "." ? name : name + mod.slice(1)
      )
    );
}

export function resolve(
  specifier: string,
  referrer: string,
) {
  return (specifier.startsWith("./") || specifier.startsWith("../"))
    ? new URL(specifier, referrer).href
    : import.meta.resolve(specifier);
}
