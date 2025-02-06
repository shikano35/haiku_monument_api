import { Hono } from 'hono';
import * as authorsController from '../controllers/authorsController';

const router = new Hono();

router.get('/', authorsController.getAllAuthors);
router.get('/:id', authorsController.getAuthorById);
router.post('/', authorsController.createAuthor);
router.put('/:id', authorsController.updateAuthor);
router.delete('/:id', authorsController.deleteAuthor);

export default router;
