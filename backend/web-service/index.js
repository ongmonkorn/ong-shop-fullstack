// web-service.js
import { Router } from 'express';
import db from './db.js';
import products from './routes/products.js';
import users from './routes/users.js';
import orders from './routes/orders.js';
import categories from './routes/categories.js';
import cors from 'cors';
import express from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';


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