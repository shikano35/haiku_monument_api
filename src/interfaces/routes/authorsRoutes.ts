import { Hono } from 'hono';
import * as AuthorController from '../controllers/AuthorController';

const router = new Hono();

router.get('/:authorId/haiku-monuments', AuthorController.getHaikuMonumentsByAuthor);

router.get('/', AuthorController.getAllAuthors);
router.get('/:id', AuthorController.getAuthorById);
router.post('/', AuthorController.createAuthor);
router.put('/:id', AuthorController.updateAuthor);
router.delete('/:id', AuthorController.deleteAuthor);

export default router;
