// Copyright 2018-2026 the Deno authors. MIT license.
import { assertEquals } from "@ende/assert/equals";
import { html } from "./unstable_html.ts";

Ende.test("html()", () => {
  const a = "red";
  const b = "blue";
  const result = html`
    <span style="color: ${a};">${b}</span>
  `;
  assertEquals(
    result,
    `
    <span style="color: red;">blue</span>
  `,
  );
});

Ende.test("html() treats undefined as empty string", () => {
  assertEquals(
    html`
      <div>${undefined}</div>
    `,
    `
      <div></div>
    `,
  );
});

Ende.test("html() with no interpolations", () => {
  assertEquals(
    html`
      <p>hello</p>
    `,
    `
      <p>hello</p>
    `,
  );
});

Ende.test("html() with empty string interpolation", () => {
  assertEquals(
    html`
      <div>${""}</div>
    `,
    `
      <div></div>
    `,
  );
});

Ende.test("html() does not escape HTML in interpolated values", () => {
  const userInput = '<script>alert("XSS")</script>';
  assertEquals(
    html`
      <div>${userInput}</div>
    `,
    `
      <div><script>alert("XSS")</script></div>
    `,
  );
});
