# async-signal

[![license:MIT](https://img.shields.io/github/license/Milly/deno-async-signal)](LICENSE)
[![jsr](https://jsr.io/badges/@milly/async-signal)](https://jsr.io/@milly/async-signal)
[![Test](https://github.com/Milly/deno-async-signal/actions/workflows/test.yml/badge.svg)](https://github.com/Milly/deno-async-signal/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/Milly/deno-async-signal/graph/badge.svg?token=4OGRY1S7CN)](https://codecov.io/gh/Milly/deno-async-signal)

`async-signal` provides functions for handling process signals asynchronously in [Deno][].

Deno limitation: On Windows only `"SIGINT"` (Ctrl+C) and `"SIGBREAK"` (Ctrl+Break) are supported.

[Deno]: https://deno.com/

```typescript
import { asyncSignal, SignalError } from "@milly/async-signal";
import { delay } from "@std/async";

try {
  // When the block exits, the signal trap is removed.
  using intTrap = asyncSignal("SIGINT");

  // It resolves after 5 seconds or rejecets if Ctrl+C is pressed.
  await Promise.race([intTrap, delay(5000)]);
} catch (err) {
  // `intTrap` rejecets with `SignalError`.
  if (err instanceof SignalError) {
    console.error(`${err.signal} is trapped`);
  }
}
```
