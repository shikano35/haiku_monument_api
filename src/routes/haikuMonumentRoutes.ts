import { Hono } from 'hono';
import * as haikuMonumentController from '../controllers/haikuMonumentController';

const router = new Hono();

router.get('/', haikuMonumentController.getAllHaikuMonuments);
router.get('/:id', haikuMonumentController.getHaikuMonumentById);
router.post('/', haikuMonumentController.createHaikuMonument);
router.put('/:id', haikuMonumentController.updateHaikuMonument);
router.delete('/:id', haikuMonumentController.deleteHaikuMonument);

export default router;
