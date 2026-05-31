import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder } from "../controller/orders.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// 1. สั่งซื้อสินค้า
router.post('/', authenticateToken, createOrder);
// 2. ดึงรายการสั่งซื้อสินค้าทั้งหมด
router.get('/', authenticateToken, getOrders);
// 3. ดึงรายการสั่งซื้อสินค้าของผู้ใช้
router.get('/my-orders', authenticateToken, getOrderById);
// 4. อัปเดตสถานะการสั่งซื้อ
router.put('/:id', authenticateToken, updateOrderStatus);
// 5. ยกเลิกรายการสั่งซื้อสินค้า
router.put('/:id/cancel', authenticateToken, cancelOrder);

export default router;