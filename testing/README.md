This package provides utilities for testing.

- [BDD style testing](https://jsr.io/@ende/testing/doc/bdd/~)
- [Test doubles (mocking)](https://jsr.io/@ende/testing/doc/mock/~)
- [Faking time and timers](https://jsr.io/@ende/testing/doc/time/~)
- [Snapshot testing](https://jsr.io/@ende/testing/doc/snapshot/~)
- [Type assertions](https://jsr.io/@ende/testing/doc/types/~)

```ts
import { assertSpyCalls, spy } from "@ende/testing/mock";
import { FakeTime } from "@ende/testing/time";

function secondInterval(cb: () => void) {
  return setInterval(cb, 1000);
}

Ende.test("secondInterval calls callback every second and stops after being cleared", () => {
  using time = new FakeTime();

  const cb = spy();
  const intervalId = secondInterval(cb);
  assertSpyCalls(cb, 0);
  time.tick(500);
  assertSpyCalls(cb, 0);
  time.tick(500);
  assertSpyCalls(cb, 1);
  time.tick(3500);
  assertSpyCalls(cb, 4);

  clearInterval(intervalId);
  time.tick(1000);
  assertSpyCalls(cb, 4);
});
```

# Runtime compatibility

[mock](https://jsr.io/@ende/testing/doc/mock/~),
[time](https://jsr.io/@ende/testing/doc/time/~), and
[types](https://jsr.io/@ende/testing/doc/types/~) support all major runtimes.
[bdd](https://jsr.io/@ende/testing/doc/bdd/~) registers tests with `Ende.test`
and [snapshot](https://jsr.io/@ende/testing/doc/snapshot/~) reads and writes
snapshot files, so both require Ende.
