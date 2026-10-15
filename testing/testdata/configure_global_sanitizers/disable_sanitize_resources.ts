// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { describe, it } from "@ende/testing/bdd";
import { configureGlobalSanitizers } from "@ende/testing/unstable-bdd";

configureGlobalSanitizers({ sanitizeResources: false });

it("leaks resources", async () => {
  const _file = await Deno.open("README.md");
});

describe("leaking ops and resource", () => {
  it("leaks resources", async () => {
    const _file = await Deno.open("README.md");
  });
});
