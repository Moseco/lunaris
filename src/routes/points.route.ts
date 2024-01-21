import { Router } from 'express';
import * as controller from '../controllers/points.controller';
import { customerValidator } from '../middlewares/customer.validator.middleware';
import { pointsChangeValidator } from '../middlewares/points_change.validator.middleware';
import { pointsModifierValidator } from '../middlewares/points_modifier.validator.middleware';

const router = Router();

router.get('/get', customerValidator, controller.getPoints);
router.post('/change', pointsChangeValidator, controller.changePoints);
router.post('/set_modifier', pointsModifierValidator, controller.setModifier);

export default router;