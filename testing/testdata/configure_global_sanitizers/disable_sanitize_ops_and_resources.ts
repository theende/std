// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { describe, it } from "@ende/testing/bdd";
import { configureGlobalSanitizers } from "@ende/testing/unstable-bdd";

configureGlobalSanitizers({
  sanitizeOps: false,
  sanitizeResources: false
});

it("leaks ops", () => {
  setTimeout(() => {}, 1000);
});

describe("leaks ops", () => {
  it("leaks ops", () => {
    setTimeout(() => {}, 1000);
  });
});
