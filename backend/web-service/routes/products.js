import { Router } from 'express';
// import db from '../../db.js';
import products from '../controller/products.js';

const router = Router();


// ----------------------------------------------------
// 1. 🛍️ ดึงรายการสินค้าทั้งหมด (โค้ดดั้งเดิมของคุณ มี LEFT JOIN ครบถ้วน สวยงามมากครับ)
// ----------------------------------------------------
router.get('/products', products);

export default router;