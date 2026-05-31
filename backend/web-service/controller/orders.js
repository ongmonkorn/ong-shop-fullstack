import { Router } from 'express';
import db from '../db.js';

const router = Router();
// 1. สร้างใบสั่งซื้อ
const createOrder = async (req, res) => {
    const { cartItems, totalPrice, shippingAddress, phoneNumber, paymentMethod } = req.body;
    const userId = req.user.id;

    try {
        await db.query('BEGIN'); // เริ่ม Transaction เพื่อความปลอดภัย

        const orderQuery = `
      INSERT INTO orders (user_id, total_price, shipping_address, phone_number, payment_method) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `;
        const orderResult = await db.query(orderQuery, [userId, totalPrice, shippingAddress, phoneNumber, paymentMethod]);
        const orderId = orderResult.rows[0].id;

        for (const item of cartItems) {
            const itemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price) 
        VALUES ($1, $2, $3, $4)
      `;
            await db.query(itemQuery, [orderId, item.id, item.quantity, item.price]);
        }

        await db.query('COMMIT');
        res.status(201).json({ message: 'สร้างใบสั่งซื้อสำเร็จ', orderId });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ' });
    }
}
// 2. ดึงรายการสั่งซื้อสินค้าทั้งหมด
const getOrders = async (req, res) => {
    try {
        const queryText = `
      SELECT o.*, u.email 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
        const result = await db.query(queryText);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
}
// 3. ดึงรายการสั่งซื้อสินค้าของผู้ใช้
const getOrderById = async (req, res) => {
    const id = req.user.id;
    try {
        const queryText = `
      SELECT o.*, 
                   json_agg(json_build_object(
                       'item_id', oi.id,
                       'product_id', oi.product_id,
                       'product_name', p.name,
                       'image_url', p.image_url,
                       'quantity', oi.quantity,
                       'price', oi.price
                   )) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
    `;
        const result = await db.query(queryText, [id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
}
// 4. อัปเดตสถานะการสั่งซื้อ
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const queryText = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *  
    `;
        const result = await db.query(queryText, [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบใบสั่งซื้อที่ต้องการแก้ไข' });
        }
        res.json({ message: 'อัปเดตสถานะการสั่งซื้อสำเร็จ', order: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการสั่งซื้อ' });
    }
}
// 5. ยกเลิกรายการสั่งซื้อสินค้า
const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const queryText = `
      UPDATE orders
      SET status = 'cancelled'
      WHERE id = $1 AND user_id = $2
      RETURNING *  
    `;
        const result = await db.query(queryText, [id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบใบสั่งซื้อที่ต้องการยกเลิก หรือคุณไม่สามารถยกเลิกใบสั่งซื้อนี้ได้' });
        }
        res.json({ message: 'ยกเลิกใบสั่งซื้อสำเร็จ', order: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยกเลิกใบสั่งซื้อ' });
    }
}
export { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder };