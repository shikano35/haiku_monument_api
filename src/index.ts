import { Hono } from 'hono';
import { corsMiddleware } from './interfaces/middlewares/corsMiddleware';
import { errorHandler } from './interfaces/middlewares/errorHandler';
import { requestLogger } from './interfaces/middlewares/requestLogger';
import locationsRoutes from './interfaces/routes/locationsRoutes';
import authorsRoutes from './interfaces/routes/authorsRoutes';
import sourcesRoutes from './interfaces/routes/sourcesRoutes';
import haikuMonumentRoutes from './interfaces/routes/haikuMonumentRoutes';
import usersRoutes from './interfaces/routes/usersRoutes';

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', corsMiddleware);
app.use('*', requestLogger);
app.use('*', errorHandler);

app.route('/locations', locationsRoutes);
app.route('/authors', authorsRoutes);
app.route('/sources', sourcesRoutes);
app.route('/haiku-monuments', haikuMonumentRoutes);
app.route('/users', usersRoutes);

app.all('*', (ctx) => ctx.json({ error: 'Not Found' }, 404));

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
