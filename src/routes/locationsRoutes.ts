import { Hono } from 'hono';
import * as locationsController from '../controllers/locationsController';

const router = new Hono();

router.get('/', locationsController.getAllLocations);
router.get('/:id', locationsController.getLocationById);
router.post('/', locationsController.createLocation);
router.put('/:id', locationsController.updateLocation);
router.delete('/:id', locationsController.deleteLocation);

export default router;
