// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import type { Matchers } from "./_types.ts";

let extendMatchers = {};

export function getExtendMatchers() {
  return extendMatchers;
}

export function setExtendMatchers(newExtendMatchers: Matchers) {
  extendMatchers = {
    ...extendMatchers,
    ...newExtendMatchers,
  };
}
