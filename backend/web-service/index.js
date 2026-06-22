// web-service.js
import { Router } from 'express';
import db from './db.js';
import products from './routes/products.js';
import users from './routes/users.js';
import orders from './routes/orders.js';
import categories from './routes/categories.js';
import cors from 'cors';
import express from 'express';

const router = Router();
const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

router.use('/products', products);
router.use('/auth', users);
router.use('/orders', orders);
router.use('/categories', categories);

export default router;