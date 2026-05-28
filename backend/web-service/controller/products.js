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

export default products;