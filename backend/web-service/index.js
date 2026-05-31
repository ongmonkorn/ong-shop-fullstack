// web-service.js
import { Router } from 'express';
import db from './db.js';
import products from './routes/products.js';
import users from './routes/users.js';
import orders from './routes/orders.js';

const router = Router();

router.use('/', products);
router.use('/auth', users);
router.use('/orders', orders);


export default router;