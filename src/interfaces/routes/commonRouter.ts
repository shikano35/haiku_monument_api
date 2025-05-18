import { OpenAPIHono } from "@hono/zod-openapi";
import type { Env } from "../../types/env";

export function createRouter() {
  const router = new OpenAPIHono<{ Bindings: Env }>();
  return router;
}
