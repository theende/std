// deno-lint-ignore-file no-console
// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { walk } from "../fs/walk.ts";
import { relative } from "../path/relative.ts";
import { dirname } from "../path/dirname.ts";
import * as colors from "../fmt/colors.ts";
import { getEntrypoints } from "./utils.ts";
import { fromFileUrl } from "@ende/path/from-file-url";

const FAIL_FAST = Ende.args.includes("--fail-fast");

let shouldFail = false;

// Matches top-level `export * from "..."`, `export type * from "..."` and
// `export { ... } from "..."` declarations, capturing the module specifier.
const EXPORT_FROM_REGEXP = /^export\s+(?:type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+["']([^"']+)["']/gm;

const MOD_FILE_PATHS = (await getEntrypoints())
  .filter(entrypoint => entrypoint.split("/").length === 2)
  .map(entrypoint => fromFileUrl(import.meta.resolve(entrypoint)));

for (const modFilePath of MOD_FILE_PATHS) {
  const modSource = await Ende.readTextFile(modFilePath);
  const modExportSpecifiers = new Set(
    modSource.matchAll(EXPORT_FROM_REGEXP).map(match => match[1])
  );

  for await (
    const { path: filePath } of walk(dirname(modFilePath), {
      exts: [".ts"],
      includeDirs: false,
      maxDepth: 1,
      skip: [
        /unstable/,
        /dotenv(\/|\\)load\.ts$/,
        /front_matter(\/|\\)yaml\.ts$/,
        /front_matter(\/|\\)json\.ts$/,
        /front_matter(\/|\\)toml\.ts$/,
        /front_matter(\/|\\)any\.ts$/,
        /uuid(\/|\\)v1\.ts$/,
        /uuid(\/|\\)v3\.ts$/,
        /uuid(\/|\\)v4\.ts$/,
        /uuid(\/|\\)v5\.ts$/,
        /uuid(\/|\\)v6\.ts$/,
        /uuid(\/|\\)v7\.ts$/,
        /_test\.ts$/,
        /_bench\.ts$/,
        /\.d\.ts$/,
        /(\/|\\)_/,
        /mod\.ts$/
      ]
    })
  ) {
    const relativeSpecifier = relative(modFilePath, filePath)
      .slice(1)
      .replaceAll("\\", "/");

    if (!modExportSpecifiers.has(relativeSpecifier)) {
      if (
        filePath.endsWith("test.ts") &&
        Ende.readTextFileSync(filePath).includes("Ende.test(")
      )
        continue;

      console.warn(
        `${colors.yellow("Warn")} ${modFilePath} does not export '${relativeSpecifier}'.`
      );
      shouldFail = true;
      if (FAIL_FAST)
        Ende.exit(1);
    }
  }
}

if (shouldFail)
  Ende.exit(1);
