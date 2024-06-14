/** An error indicating a trapped process signal. */
export class SignalError extends Error {
  declare name: "SignalError";
  static {
    SignalError.prototype.name = "SignalError";
  }

  /** Process signal name. */
  signal: Deno.Signal;

  constructor(signal: Deno.Signal, options?: ErrorOptions) {
    super(`${signal} is trapped`, options);
    this.signal = signal;
  }
}
