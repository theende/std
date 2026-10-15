Provides utilities for formatting text of different types:

- [Human-readable bytes](https://jsr.io/@ende/fmt/doc/bytes/~)
- [Styles for the CLI](https://jsr.io/@ende/fmt/doc/colors/~)
- [Time duration](https://jsr.io/@ende/fmt/doc/duration/~)
- [Printing formatted strings to stdout](https://jsr.io/@ende/fmt/doc/printf/~)

```ts
import { format } from "@ende/fmt/bytes";
import { red } from "@ende/fmt/colors";

console.log(red(format(1337))); // Prints "1.34 kB"
```

# Runtime compatibility

[bytes](https://jsr.io/@ende/fmt/doc/bytes/~),
[colors](https://jsr.io/@ende/fmt/doc/colors/~), and
[duration](https://jsr.io/@ende/fmt/doc/duration/~) supports all major runtimes.
[printf](https://jsr.io/@ende/fmt/doc/printf/~) is mostly compatible with major
runtimes, however some of features, such as `%v`, `%i` and `%I` format
specifiers, are only available in Ende. See the API docs for details.
