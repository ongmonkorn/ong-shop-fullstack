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
        res.status(500).json({ message: 'เรียกข้อมูลสินค้าไม่สำเร็จ' });
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


// ในไฟล์ controller/products.js -> ฟังก์ชัน addProduct
const addProduct = async (req, res) => {
    try {
        const { name, price, description, category_id, stock } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาเลือกรูปภาพสินค้าด้วยครับ' });
        }

        // 🚨 🛠️ แก้ไขบรรทัดนี้: ดึงค่าลิงก์เต็มที่พ่วง R2_PUBLIC_URL มาเรียบร้อยแล้วผ่าน .location ครับน้า
        const filename = `${process.env.R2_PUBLIC_URL}/${req.file.key}`;

        // คำสั่ง SQL ยิงเข้าฐานข้อมูล Neon คราวนี้ลิงก์ยาวตัวเต็มจะวิ่งเข้าไปนอนในเบสแน่นอนครับ
        const result = await db.query(
            `INSERT INTO products (name, price, description, image_url, category_id, stock) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [name, Number(price), description, filename, Number(category_id), Number(stock)]
        );

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

// ในไฟล์ controller/products.js -> ฟังก์ชัน updateProduct
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category_id, old_image } = req.body;

        // 🚨 🛠️ แก้ไขตรงนี้: สลับมาดึง .location แทนพาร์ทแบบเก่าครับน้าอง
        let imageName = old_image;
        if (req.file) {
            imageName = `${process.env.R2_PUBLIC_URL}/${req.file.key}`; // ลิงก์เต็มจาก Cloudflare R2 บินมาลงตรงนี้เลยครับ
        }

        const result = await db.query(
            `UPDATE products 
             SET name=$1, description=$2, price=$3, stock=$4, category_id=$5, image_url=$6 
             WHERE id=$7`,
            [name, description, Number(price), Number(stock), Number(category_id), imageName, Number(id)]
        );

        return res.status(200).json({ success: true, message: 'แก้ไขข้อมูลสินค้าสำเร็จ' });

    } catch (error) {
        console.error("Error inside updateProduct:", error);
        return res.status(500).json({ message: error.message });
    }
};

export { products, productById, addProduct, deleteProduct, updateProduct }
