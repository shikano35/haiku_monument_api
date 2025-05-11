import { corsMiddleware } from './interfaces/middlewares/corsMiddleware';
import { errorHandler } from './interfaces/middlewares/errorHandler';
import { requestLogger } from './interfaces/middlewares/requestLogger';
import locationsRoutes from './interfaces/routes/locationsRoutes';
import poetsRoutes from './interfaces/routes/poetsRoutes';
import sourcesRoutes from './interfaces/routes/sourcesRoutes';
import haikuMonumentRoutes from './interfaces/routes/haikuMonumentRoutes';
import type { Env } from './types/env';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { securityHeaders } from './interfaces/middlewares/securityHeaders';

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "句碑 API",
    version: "1.0.1",
    description: `このAPIは句碑の情報を提供します。

APIの概要については、[句碑APIドキュメント](https://developers.kuhiapi.com)をご参照ください。`,
  },
  servers: [
    {
      url: "https://api.kuhiapi.com",
      description: "Production server",
    },
  ],
  tags: [
    { name: "haiku-monuments", description: "句碑に関するAPI" },
    { name: "poets", description: "俳人に関するAPI" },
    { name: "locations", description: "句碑の設置場所に関するAPI" },
    { name: "sources", description: "句碑の出典に関するAPI" },
  ],
  paths: {}
};

const app = new OpenAPIHono<{ Bindings: Env }>();

app.use('*', corsMiddleware);
app.use('*', requestLogger);
app.use('*', errorHandler);
app.use('*', securityHeaders);

app.route('/locations', locationsRoutes);
app.route('/poets', poetsRoutes);
app.route('/sources', sourcesRoutes);
app.route('/haiku-monuments', haikuMonumentRoutes);

app.doc('/docs/json', openApiSpec);
app.get('/docs', swaggerUI({ url: '/docs/json' }));

app.all('*', (ctx) => ctx.json({ error: 'Not Found' }, 404));

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;