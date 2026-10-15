// Copyright 2018-2026 the Deno authors. MIT license.

import { Deno, testDefinitions } from "@deno/shim-deno-test";
import { register } from "node:module";

register(new URL("ende_compat_hooks.mjs", import.meta.url));

// Caches @ende/path module before polyfilling globalThis.Ende
await import("@ende/path");

globalThis.Ende = globalThis.Deno = Deno;
globalThis.testDefinitions = testDefinitions;
