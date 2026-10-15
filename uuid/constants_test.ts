// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert";
import {
  NAMESPACE_DNS,
  NAMESPACE_OID,
  NAMESPACE_URL,
  NAMESPACE_X500,
} from "./constants.ts";
import { validate } from "./mod.ts";

Ende.test("validate() validates the pre-defined namespaces", () => {
  assertEquals(validate(NAMESPACE_DNS), true);
  assertEquals(validate(NAMESPACE_URL), true);
  assertEquals(validate(NAMESPACE_OID), true);
  assertEquals(validate(NAMESPACE_X500), true);
});
