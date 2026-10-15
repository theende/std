// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertRejects } from "@ende/assert";
import { delay } from "./delay.ts";
import { deadline } from "./deadline.ts";

Ende.test("deadline() returns fulfilled promise", async () => {
  const controller = new AbortController();
  const { signal } = controller;
  const p = delay(100, { signal })
    .catch(() => {})
    .then(() => "Hello");
  const result = await deadline(p, 1000);
  assertEquals(result, "Hello");
  controller.abort();
});

Ende.test("deadline() throws DOMException", async () => {
  const controller = new AbortController();
  const { signal } = controller;
  const p = delay(1000, { signal })
    .catch(() => {})
    .then(() => "Hello");
  const error = await assertRejects(
    () => deadline(p, 100),
    DOMException,
  );
  assertEquals(error.name, "TimeoutError");
  controller.abort();
});

Ende.test("deadline() throws when promise is rejected", async () => {
  const controller = new AbortController();
  const { signal } = controller;
  const p = delay(100, { signal })
    .catch(() => {})
    .then(() => Promise.reject(new Error("booom")));
  await assertRejects(
    async () => {
      await deadline(p, 1000);
    },
    Error,
    "booom",
  );
  controller.abort();
});

Ende.test("deadline() handles non-aborted signal", async () => {
  const controller = new AbortController();
  const { signal } = controller;
  const p = delay(100, { signal })
    .catch(() => {})
    .then(() => "Hello");
  const abort = new AbortController();
  const result = await deadline(p, 1000, { signal: abort.signal });
  assertEquals(result, "Hello");
  controller.abort();
});

Ende.test("deadline() handles aborted signal after delay", async () => {
  const controller = new AbortController();
  const { signal } = controller;
  const p = delay(100, { signal })
    .catch(() => {})
    .then(() => "Hello");
  const abort = new AbortController();
  const promise = deadline(p, 100, { signal: abort.signal });
  abort.abort();
  const error = await assertRejects(
    () => promise,
    DOMException,
  );
  assertEquals(error.name, "AbortError");
  controller.abort();
});

Ende.test("deadline() handles already aborted signal", async () => {
  const controller = new AbortController();
  const { signal } = controller;
  const p = delay(100, { signal })
    .catch(() => {})
    .then(() => "Hello");
  const abort = new AbortController();
  abort.abort();
  const error = await assertRejects(
    () => deadline(p, 100, { signal: abort.signal }),
    DOMException,
  );
  assertEquals(error.name, "AbortError");
  controller.abort();
});

Ende.test("deadline() supports numbers greater than Number.MAX_SAFE_INTEGER", async () => {
  const promise = await deadline(Promise.resolve("Hello"), Infinity);
  assertEquals(promise, "Hello");
});
