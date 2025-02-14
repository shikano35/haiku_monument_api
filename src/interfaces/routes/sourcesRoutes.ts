import { Hono } from 'hono';
import * as SourceController from '../controllers/SourceController';

const router = new Hono();

router.get('/:sourceId/haiku-monuments', SourceController.getHaikuMonumentsBySource);

router.get('/', SourceController.getAllSources);
router.get('/:id', SourceController.getSourceById);
router.post('/', SourceController.createSource);
router.put('/:id', SourceController.updateSource);
router.delete('/:id', SourceController.deleteSource);

export default router;
