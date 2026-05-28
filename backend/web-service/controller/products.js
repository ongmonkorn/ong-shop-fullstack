import { Router } from 'express';
import db from '../../db.js';

const router = Router();

const products = async (req, res) => {
    try {
        const queryText = `
          SELECT p.*, c.name AS category_name 
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
        `;
        const result = await db.query(queryText);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
    }
}

const productById = async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
      SELECT p.*, c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
        const result = await db.query(queryText, [id]);


        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้าชิ้นนี้' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
}
const addProduct = async (req, res) => {
    const { name, price, description, image_url, category_id } = req.body;
    try {
        const queryText = `
      INSERT INTO products (name, price, description, image_url, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const result = await db.query(queryText, [name, price, description, image_url, category_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
}
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
      DELETE FROM products
      WHERE id = $1
      RETURNING *  
    `;
        const result = await db.query(queryText, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้าที่ต้องการลบ' });
        }
        res.json({ message: 'ลบสินค้าสำเร็จ', product: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบสินค้า' });
    }
}
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, image_url, category_id } = req.body;
    try {
        const queryText = `
      UPDATE products
      SET name = $1, price = $2, description = $3, image_url = $4, category_id = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *  
    `;
        const result = await db.query(queryText, [name, price, description, image_url, category_id, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้าที่ต้องการแก้ไข' });
        }
        res.json({ message: 'อัปเดตสินค้าสำเร็จ', product: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสินค้า' });
    }
}
export { products, productById, addProduct, deleteProduct, updateProduct }