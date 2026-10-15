// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "../assert/equals.ts";
import { generateRandomString } from "./_test_util.ts";

Ende.test({
  name: "generateRandomString() generates a string of the correct length",
  fn() {
    assertEquals(generateRandomString(0, 0), "");
    assertEquals(generateRandomString(10, 10).length, 10);
  },
});
