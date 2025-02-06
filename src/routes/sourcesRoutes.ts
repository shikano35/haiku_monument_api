import { Hono } from 'hono';
import * as sourcesController from '../controllers/sourcesController';

const router = new Hono();

router.get('/', sourcesController.getAllSources);
router.get('/:id', sourcesController.getSourceById);
router.post('/', sourcesController.createSource);
router.put('/:id', sourcesController.updateSource);
router.delete('/:id', sourcesController.deleteSource);

export default router;
