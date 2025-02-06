import { Hono } from 'hono';
import locationsRoutes from './routes/locationsRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import authorsRoutes from './routes/authorsRoutes';
import sourcesRoutes from './routes/sourcesRoutes';
import haikuMonumentRoutes from './routes/haikuMonumentRoutes';
import tagsRoutes from './routes/tagsRoutes';
import usersRoutes from './routes/usersRoutes';

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
