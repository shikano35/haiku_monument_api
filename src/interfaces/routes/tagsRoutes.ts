import { Hono } from 'hono';
import * as TagController from '../controllers/TagController';

const router = new Hono();

router.get('/', TagController.getAllTags);
router.get('/:id', TagController.getTagById);
router.post('/', TagController.createTag);
router.put('/:id', TagController.updateTag);
router.delete('/:id', TagController.deleteTag);

export default router;
