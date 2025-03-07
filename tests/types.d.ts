import "wrangler";

declare module "wrangler" {
  interface Unstable_DevOptions {
    bindings?: {
      DB: typeof globalThis.DB;
    };
  }
}
