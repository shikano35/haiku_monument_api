import "wrangler";

declare module "wrangler" {
  export interface Unstable_DevOptions {
    bindings?: Record<string, unknown>;
  }
}
