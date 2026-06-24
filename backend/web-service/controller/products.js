import { Router } from 'express';
import db from '../db.js';

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
        res.status(500).json({ message: 'ควยยยยยย' });
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
    try {
        // 💡 คราวนี้ req.body จะแตกตัวแปรออกมาได้สบายๆ ไม่ขึ้น undefined แล้วครับ
        const { name, price, description, category_id, stock } = req.body;

        // ตรวจสอบว่ามีไฟล์รูปถูกส่งมาด้วยไหม
        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาเลือกรูปภาพสินค้าด้วยครับ' });
        }

        const filename = req.file.filename; // ได้ชื่อไฟล์ เช่น 1717800000.jpg

        // น้าเอาค่าเหล่านี้ไปเขียนคำสั่ง SQL บันทึกลงฐานข้อมูล (db.query) ต่อได้เลยครับ...
        // ตัวอย่าง:
        const result = await db.query('INSERT INTO products (name, price, description, image_url, category_id, stock) VALUES ($1, $2, $3, $4, $5, $6)', [name, price, description, filename, category_id, stock]);

        res.status(201).json({ message: "เพิ่มสินค้าสำเร็จ", filename, product: result.rows[0] });

    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
};

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
// backend/web-service/controller/products.js

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category_id, old_image } = req.body;

        // 🚨 1. จุดดักจับชื่อไฟล์ภาพ:
        // ถ้ามีการอัปโหลดรูปใหม่เข้ามา (req.file จะมีค่า) -> ให้ใช้ชื่อไฟล์ใหม่ที่ Multer ตั้งให้
        // แต่ถ้าแอดมินไม่ได้กดเปลี่ยนรูปเลย (req.file จะไม่มีค่า) -> ให้ใช้ชื่อรูปเดิม (old_image) ที่หน้าบ้านส่งมาค้ำไว้
        let imageName = old_image;
        if (req.file) {
            imageName = req.file.filename;
        }

        // 🚨 2. ตอนเขียนคำสั่ง SQL UPDATE ต้องเอาตัวแปร imageName ใส่เข้าไปในคอลัมน์รูปภาพด้วยครับน้า
        // ตัวอย่าง:
        const result = await db.query(
            `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, category_id=$5, image_url=$6 WHERE id=$7`,
            [name, description, price, stock, category_id, imageName, id]
        );

        return res.status(200).json({ success: true, message: 'แก้ไขข้อมูลสินค้าสำเร็จ' });

    } catch (error) {
        console.error("Error inside updateProduct:", error);
        return res.status(500).json({ message: error.message });
    }
};
export { products, productById, addProduct, deleteProduct, updateProduct }
