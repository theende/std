// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals } from "@ende/assert/equals";
import { consolidateCommon, truncateDiff } from "./truncate_build_message.ts";
import type { CommonDiffResult } from "@ende/internal/types";

Ende.test("consolidateDiff()", () => {
  assertEquals(
    truncateDiff(
      [
        { type: "added", value: "foo" },
        { type: "common", value: "[" },
        { type: "common", value: '  "bar-->",' },
        { type: "common", value: '  "bar",' },
        { type: "common", value: '  "bar",' },
        { type: "common", value: '  "<--bar",' },
        { type: "common", value: "]" },
        { type: "removed", value: "foo" },
      ],
      false,
      2,
    ),
    [
      { type: "added", value: "foo" },
      { type: "common", value: "[" },
      { type: "common", value: '  "bar-->",' },
      { type: "truncation", value: "  ... 2 unchanged lines ..." },
      { type: "common", value: '  "<--bar",' },
      { type: "common", value: "]" },
      { type: "removed", value: "foo" },
    ],
  );
});

Ende.test("consolidateCommon()", async (t) => {
  const commons = [
    { type: "common", value: "[" },
    { type: "common", value: '  "bar-->",' },
    { type: "common", value: '  "bar",' },
    { type: "common", value: '  "bar",' },
    { type: "common", value: '  "bar",' },
    { type: "common", value: '  "<--bar",' },
    { type: "common", value: "]" },
  ] as const;

  const contextLength = 2;

  const cases: {
    location: "start" | "middle" | "end";
    expected: ReadonlyArray<CommonDiffResult<string>>;
  }[] = [
    {
      location: "start",
      expected: [
        { type: "common", value: "[" },
        { type: "truncation", value: "  ... 4 unchanged lines ..." },
        { type: "common", value: '  "<--bar",' },
        { type: "common", value: "]" },
      ],
    },
    {
      location: "middle",
      expected: [
        { type: "common", value: "[" },
        { type: "common", value: '  "bar-->",' },
        { type: "truncation", value: "  ... 3 unchanged lines ..." },
        { type: "common", value: '  "<--bar",' },
        { type: "common", value: "]" },
      ],
    },
    {
      location: "end",
      expected: [
        { type: "common", value: "[" },
        { type: "common", value: '  "bar-->",' },
        { type: "truncation", value: "  ... 4 unchanged lines ..." },
        { type: "common", value: "]" },
      ],
    },
  ];

  for (const { location: extremity, expected } of cases) {
    await t.step(extremity, () => {
      assertEquals(
        consolidateCommon(commons, extremity, false, contextLength),
        expected,
      );
    });
  }
});
