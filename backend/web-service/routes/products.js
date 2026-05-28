import { Router } from 'express';
import { products, productById, addProduct, deleteProduct, updateProduct } from '../controller/products.js';

const router = Router();
// 1. ดึงรายการสินค้าทั้งหมด
router.get('/products', products);
// 2. ดึงรายละเอียดสินค้าเฉพาะชิ้น
router.get('/products/:id', productById);
// 3. เพิ่มสินค้า
router.post('/products', addProduct);
// 4. ลบสินค้า
router.delete('/products/:id', deleteProduct);
// 5. แก้ไขสินค้า
router.put('/products/:id', updateProduct);
export default router;