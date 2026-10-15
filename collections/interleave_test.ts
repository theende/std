// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.

import { assertEquals } from "@ende/assert";
import { interleave } from "./interleave.ts";

Ende.test({
  name: "interleave() handles no arguments",
  fn() {
    assertEquals(interleave(), []);
  }
});

Ende.test({
  name: "interleave() handles single array",
  fn() {
    assertEquals(interleave([1, 2, 3]), [1, 2, 3]);
  }
});

Ende.test({
  name: "interleave() handles two equal-length arrays",
  fn() {
    assertEquals(
      interleave([1, 2, 3], ["a", "b", "c"]),
      [1, "a", 2, "b", 3, "c"]
    );
  }
});

Ende.test({
  name: "interleave() handles first array shorter",
  fn() {
    assertEquals(
      interleave([1], ["a", "b", "c"]),
      [1, "a", "b", "c"]
    );
  }
});

Ende.test({
  name: "interleave() handles multiple unequal-length arrays",
  fn() {
    assertEquals(
      interleave([1, 2, 3], ["a", "b"], [true]),
      [1, "a", true, 2, "b", 3]
    );
  }
});

Ende.test({
  name: "interleave() handles empty arrays in input",
  fn() {
    assertEquals(interleave([], [1, 2, 3]), [1, 2, 3]);
    assertEquals(interleave([1, 2], [], [3, 4]), [1, 3, 2, 4]);
    assertEquals(interleave([], [], []), []);
  }
});

Ende.test({
  name: "interleave() handles no mutation",
  fn() {
    const a = [1, 2, 3];
    const b = ["x", "y"];
    interleave(a, b);

    assertEquals(a, [1, 2, 3]);
    assertEquals(b, ["x", "y"]);
  }
});

Ende.test({
  name: "interleave() handles sparse arrays",
  fn() {
    // deno-lint-ignore no-sparse-arrays
    const sparse = [1, , 3];
    assertEquals(
      interleave(sparse, ["a", "b", "c"]),
      [1, "a", undefined, "b", 3, "c"]
    );
  }
});

Ende.test({
  name: "interleave() handles second array longer",
  fn() {
    assertEquals(
      interleave([1, 2, 3], ["a"]),
      [1, "a", 2, 3]
    );
  }
});

Ende.test({
  name: "interleave() handles three equal-length arrays",
  fn() {
    assertEquals(
      interleave([1, 2], ["a", "b"], [true, false]),
      [1, "a", true, 2, "b", false]
    );
  }
});

Ende.test({
  name: "interleave() handles four equal-length arrays",
  fn() {
    assertEquals(
      interleave([1, 2], ["a", "b"], [true, false], [10, 20]),
      [1, "a", true, 10, 2, "b", false, 20]
    );
  }
});

Ende.test({
  name: "interleave() handles non-array iterables",
  fn() {
    function* numbers() {
      yield 1;
      yield 2;
      yield 3;
    }
    assertEquals(
      interleave(numbers(), ["a", "b", "c"]),
      [1, "a", 2, "b", 3, "c"]
    );
  }
});

Ende.test({
  name: "interleave() handles Set iterables",
  fn() {
    assertEquals(
      interleave(new Set([1, 2, 3]), ["a", "b", "c"]),
      [1, "a", 2, "b", 3, "c"]
    );
  }
});
