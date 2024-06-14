import { SignalError } from "./signal_error.ts";

/**
 * Create a promise which will be rejected with {@linkcode SignalError} when the process traps the `signal`.
 *
 * @param signal Process signal name.
 */
export function asyncSignal(signal: Deno.Signal): Promise<never> & Disposable {
  let handler: () => void;
  const promise = new Promise<never>((_, reject) => {
    handler = () => {
      Deno.removeSignalListener(signal, handler);
      reject(new SignalError(signal));
    };
    Deno.addSignalListener(signal, handler);
  });
  return Object.assign(promise, {
    [Symbol.dispose]() {
      Deno.removeSignalListener(signal, handler);
    },
  });
}
