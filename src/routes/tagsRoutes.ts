import { Hono } from 'hono';
import * as tagsController from '../controllers/tagsController';

const router = new Hono();

router.get('/', tagsController.getAllTags);
router.get('/:id', tagsController.getTagById);
router.post('/', tagsController.createTag);
router.put('/:id', tagsController.updateTag);
router.delete('/:id', tagsController.deleteTag);

export default router;
