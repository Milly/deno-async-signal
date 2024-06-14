import { assertEquals, assertInstanceOf, assertRejects } from "@std/assert";
import { assertSpyCallArgs, assertSpyCalls, stub } from "@std/testing/mock";
import { delay } from "@std/async/delay";
import { promiseState } from "@lambdalisue/async";
import { asyncSignal } from "./async_signal.ts";
import { SignalError } from "./signal_error.ts";

Deno.test("asyncSignal()", async (t) => {
  {
    using deno_addSignalListener = stub(Deno, "addSignalListener");
    using deno_removeSignalListener = stub(Deno, "removeSignalListener");

    const promise = asyncSignal("SIGINT");

    await t.step("returns a `Promise & Disposable`", () => {
      assertInstanceOf(promise, Promise);
      assertInstanceOf(promise[Symbol.dispose], Function);
    });

    await t.step("adds signal listener", () => {
      assertSpyCalls(deno_addSignalListener, 1);
      assertEquals(deno_addSignalListener.calls[0].args[0], "SIGINT");
      const signalHandler = deno_addSignalListener.calls[0].args[1];
      assertInstanceOf(signalHandler, Function);
    });

    await t.step("removes signal listener if disposed", () => {
      const signalHandler = deno_addSignalListener.calls[0].args[1];

      promise[Symbol.dispose]();

      assertSpyCalls(deno_removeSignalListener, 1);
      assertSpyCallArgs(deno_removeSignalListener, 0, [
        "SIGINT",
        signalHandler,
      ]);
    });
  }

  {
    using deno_addSignalListener = stub(Deno, "addSignalListener");
    using deno_removeSignalListener = stub(Deno, "removeSignalListener");

    using promise = asyncSignal("SIGINT");
    await delay(0);

    await t.step("pendings if the `signal` is not trapped", async () => {
      assertEquals(await promiseState(promise), "pending");
    });

    const signalHandler = deno_addSignalListener.calls[0].args[1];
    signalHandler();

    await t.step("rejects when the `signal` is trapped", async () => {
      assertEquals(await promiseState(promise), "rejected");
      await assertRejects(() => promise, SignalError, "SIGINT");
    });

    await t.step("removes signal listener when the `signal` is trapped", () => {
      assertSpyCalls(deno_removeSignalListener, 1);
      assertSpyCallArgs(deno_removeSignalListener, 0, [
        "SIGINT",
        signalHandler,
      ]);
    });
  }
});
