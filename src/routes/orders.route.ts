import { Router } from 'express';
import * as controller from '../controllers/orders.controller';
import { orderValidator } from '../middlewares/order.validator.middleware';

const router = Router();

router.post('/new', orderValidator, controller.newOrder);

export default router;