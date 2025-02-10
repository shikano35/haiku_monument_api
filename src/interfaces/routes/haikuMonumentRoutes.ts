import { Hono } from 'hono';
import * as HaikuMonumentController from '../controllers/HaikuMonumentController';

const router = new Hono();

router.get('/', HaikuMonumentController.getAllHaikuMonuments);
router.get('/:id', HaikuMonumentController.getHaikuMonumentById);
router.post('/', HaikuMonumentController.createHaikuMonument);
router.put('/:id', HaikuMonumentController.updateHaikuMonument);
router.delete('/:id', HaikuMonumentController.deleteHaikuMonument);

export default router;
