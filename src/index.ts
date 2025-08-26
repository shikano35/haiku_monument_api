import { OpenAPIHono } from "@hono/zod-openapi";
import { Hono } from "hono";
import { corsMiddleware } from "./interfaces/middlewares/corsMiddleware";
import { errorHandler } from "./interfaces/middlewares/errorHandler";
import { requestLogger } from "./interfaces/middlewares/requestLogger";
import { securityHeaders } from "./interfaces/middlewares/securityHeaders";
import locationsRoutes from "./interfaces/routes/locationsRoutes";
import monumentsRoutes from "./interfaces/routes/monumentsRoutes";
import inscriptionsRoutes from "./interfaces/routes/inscriptionsRoutes";
import poemsRoutes from "./interfaces/routes/poemsRoutes";
import poetsRoutes from "./interfaces/routes/poetsRoutes";
import sourcesRoutes from "./interfaces/routes/sourcesRoutes";
import type { Env } from "./types/env";
import { swaggerUI } from "@hono/swagger-ui";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "句碑 API",
    version: "2.0.0",
    description: `このAPIは句碑の情報を提供します。

APIの概要については、[句碑APIドキュメント](https://developers.kuhi.jp)をご参照ください。`,
  },
  servers: [
    {
      url: "https://api.kuhi.jp",
      description: "Production server",
    },
  ],
  tags: [
    { name: "monuments", description: "句碑に関するAPI" },
    { name: "inscriptions", description: "碑文に関するAPI" },
    { name: "poems", description: "俳句に関するAPI" },
    { name: "poets", description: "俳人に関するAPI" },
    { name: "locations", description: "句碑の設置場所に関するAPI" },
    { name: "sources", description: "句碑の出典・参考文献に関するAPI" },
  ],
  paths: {},
};

const app = new OpenAPIHono<{ Bindings: Env }>();

app.use("*", corsMiddleware);
app.use("*", requestLogger);
app.use("*", errorHandler);
app.use("*", securityHeaders);

app.route("/monuments", monumentsRoutes);
app.route("/inscriptions", inscriptionsRoutes);
app.route("/poems", poemsRoutes);
app.route("/poets", poetsRoutes);
app.route("/locations", locationsRoutes);
app.route("/sources", sourcesRoutes);

app.doc("/docs/json", openApiSpec);

const docsApp = new Hono<{ Bindings: Env }>();
docsApp.get("/docs", swaggerUI({ url: "/docs/json" }));

app.use("/docs", async (c, next) => {
  return await docsApp.fetch(c.req.raw, c.env);
});

app.all("*", (ctx) => ctx.json({ error: "Not Found" }, 404));

export default {
  fetch: app.fetch,
};
