import { Router } from 'express';
import home from './home.route';
import orders from './orders.route';
import points from './points.route';

const router = Router();

router.use('/', home);
router.use('/orders', orders);
router.use('/points', points);

export default router;