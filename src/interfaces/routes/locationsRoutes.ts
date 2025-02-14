import { Hono } from 'hono';
import * as LocationController from '../controllers/LocationController';

const router = new Hono();

router.get('/:locationId/haiku-monuments', LocationController.getHaikuMonumentsByLocation);

router.get('/', LocationController.getAllLocations);
router.get('/:id', LocationController.getLocationById);
router.post('/', LocationController.createLocation);
router.put('/:id', LocationController.updateLocation);
router.delete('/:id', LocationController.deleteLocation);

export default router;
