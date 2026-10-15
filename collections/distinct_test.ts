// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals } from "@ende/assert";
import { distinct } from "./distinct.ts";

function distinctTest<I>(
  input: Array<I>,
  expected: Array<I>,
  message?: string,
) {
  const actual = distinct(input);
  assertEquals(actual, expected, message);
}

Ende.test({
  name: "distinct() handles identities on empty array",
  fn() {
    distinctTest([], []);
  },
});

Ende.test({
  name: "distinct() removes duplicates and preserves order",
  fn() {
    distinctTest(
      [true, "asdf", 4, "asdf", true],
      [true, "asdf", 4],
    );
    distinctTest(
      [null, undefined, null, "foo", undefined],
      [null, undefined, "foo"],
    );
    distinctTest(
      [true, "asdf", 4, "asdf", true],
      [true, "asdf", 4],
    );
  },
});

Ende.test({
  name: "distinct() does not check for deep equality",
  fn() {
    const objects = [{ foo: "bar" }, { foo: "bar" }];
    distinctTest(objects, objects);

    const arrays = [[], []];
    distinctTest(arrays, arrays);

    const nans = [NaN, NaN];
    distinctTest(nans, [nans[0]]);

    const noops = [() => {}, () => {}];
    distinctTest(noops, noops);

    const sets = [new Set(), new Set()];
    distinctTest(sets, sets);
  },
});
