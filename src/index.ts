import { Hono } from 'hono';
import locationsRoutes from './interfaces/routes/locationsRoutes';
import { errorHandler } from './interfaces/middlewares/errorHandler';
import { requestLogger } from './interfaces/middlewares/requestLogger';
import authorsRoutes from './interfaces/routes/authorsRoutes';
import sourcesRoutes from './interfaces/routes/sourcesRoutes';
import haikuMonumentRoutes from './interfaces/routes/haikuMonumentRoutes';
import tagsRoutes from './interfaces/routes/tagsRoutes';
import usersRoutes from './interfaces/routes/usersRoutes';

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.use('*', requestLogger);
app.use('*', errorHandler);

app.route('/locations', locationsRoutes);
app.route('/authors', authorsRoutes);
app.route('/sources', sourcesRoutes);
app.route('/haiku-monuments', haikuMonumentRoutes);
app.route('/tags', tagsRoutes);
app.route('/users', usersRoutes);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
