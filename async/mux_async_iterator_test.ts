// Copyright 2018-2026 the Deno authors. MIT license.
// Copyright 2026 the Ende authors. MIT license.
import { assertEquals, assertRejects } from "@ende/assert";
import { MuxAsyncIterator } from "./mux_async_iterator.ts";

async function* gen123(): AsyncIterableIterator<number> {
  yield 1;
  yield 2;
  yield 3;
}

async function* gen456(): AsyncIterableIterator<number> {
  yield 4;
  yield 5;
  yield 6;
}

async function* genThrows(): AsyncIterableIterator<number> {
  yield 7;
  throw new Error("something went wrong");
}

class CustomAsyncIterable {
  [Symbol.asyncIterator]() {
    return gen123();
  }
}

Ende.test("MuxAsyncIterator()", async () => {
  const mux = new MuxAsyncIterator<number>();
  mux.add(gen123());
  mux.add(gen456());
  const results = new Set(await Array.fromAsync(mux));
  assertEquals(results.size, 6);
  assertEquals(results, new Set([1, 2, 3, 4, 5, 6]));
});

Ende.test("MuxAsyncIterator() works with no iterables", async () => {
  const mux = new MuxAsyncIterator<number>();
  const results = new Set(await Array.fromAsync(mux));
  assertEquals(results.size, 0);
  assertEquals(results, new Set([]));
});

Ende.test("MuxAsyncIterator() clears iterables after successful iteration", async () => {
  const mux = new MuxAsyncIterator<number>();
  mux.add(gen123());
  mux.add(gen456());
  const results = new Set(await Array.fromAsync(mux));
  assertEquals(results.size, 6);
  assertEquals(results, new Set([1, 2, 3, 4, 5, 6]));
  mux.add(gen123());
  const results2 = new Set(await Array.fromAsync(mux));
  assertEquals(results2.size, 3);
  assertEquals(results2, new Set([1, 2, 3]));
});

Ende.test("MuxAsyncIterator() takes async iterable as source", async () => {
  const mux = new MuxAsyncIterator<number>();
  mux.add(new CustomAsyncIterable());
  const results = new Set(await Array.fromAsync(mux));
  assertEquals(results.size, 3);
  assertEquals(results, new Set([1, 2, 3]));
});

Ende.test("MuxAsyncIterator() throws when the source throws", async () => {
  const mux = new MuxAsyncIterator<number>();
  mux.add(gen123());
  mux.add(genThrows());
  await assertRejects(
    async () => await Array.fromAsync(mux),
    Error,
    "something went wrong",
  );
});

Ende.test("MuxAsyncIterator() doesn't clear iterables after throwing", async () => {
  const mux = new MuxAsyncIterator<number>();
  mux.add(genThrows());
  await assertRejects(
    async () => await Array.fromAsync(mux),
    Error,
    "something went wrong",
  );
  await assertRejects(
    async () => await Array.fromAsync(mux),
    Error,
    "something went wrong",
  );
});
