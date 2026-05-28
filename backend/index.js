// index.js
import router from './web-service/routes';

const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Middleware ดักการเรียก API ที่ต้องล็อกอิน ---   
const authenticateToken = (req, res, next) => {
    // ดึง Token จาก Header 'Authorization' (รูปแบบ: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' });
    }

    // ตรวจสอบความถูกต้องของ Token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
        req.user = user; // ฝังข้อมูล user (id, role) เข้าไปใน req เพื่อให้ API เส้นถัดไปนำไปใช้ได้
        next();
    });
};
// --- PUBLIC APIs (สำหรับลูกค้าทุกคน) ---



// 2. ดึงรายละเอียดสินค้าเฉพาะชิ้น
app.get('/api/products/:id', async (req, res) => {
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
});

// --- ADMIN APIs (สำหรับจัดการระบบ) ---

// 3. เพิ่มสินค้าใหม่ (Create)
app.post('/api/products', async (req, res) => {
    const { name, description, price, stock, image_url, category_id } = req.body;
    try {
        const queryText = `
      INSERT INTO products (name, description, price, stock, image_url, category_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const values = [name, description, price, stock, image_url, category_id];
        const result = await db.query(queryText, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถเพิ่มสินค้าได้ ตรวจสอบข้อมูลอีกครั้ง' });
    }
});

// 4. แก้ไขข้อมูลสินค้า (Update)
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, image_url, category_id } = req.body;
    try {
        const queryText = `
      UPDATE products 
      SET name = $1, description = $2, price = $3, stock = $4, image_url = $5, category_id = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
        const values = [name, description, price, stock, image_url, category_id, id];
        const result = await db.query(queryText, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้าที่ต้องการอัปเดต' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
    }
});

// 5. ลบสินค้า (Delete)
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'ลบสินค้าเรียบร้อยแล้ว' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถลบสินค้าได้' });
    }
});

//  ดึงรายการ User ทั้งหมด 
app.get('/api/users', async (req, res) => {
    try {
        const queryText = `
      SELECT u.* 
      FROM users u
    `;
        const result = await db.query(queryText);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล User' });
    }
});
//  เพิ่ม User 
app.post('/api/users', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // 1. 🔍 เงื่อนไขที่ 1: ตรวจสอบก่อนว่ามี Email นี้อยู่ในระบบแล้วหรือยัง
        const checkEmailQuery = 'SELECT id FROM users WHERE email = $1';
        const emailCheckResult = await db.query(checkEmailQuery, [email]);

        // ถ้าพบว่ามีข้อมูลส่งกลับมา ( rows.length > 0 ) แปลว่า Email นี้ถูกใช้ไปแล้ว
        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({
                message: 'Email นี้ถูกใช้งานไปแล้วในระบบ'
            });
        }

        // 2. 📝 หากไม่ซ้ำ ให้ทำการบันทึกข้อมูลตามปกติ
        const queryText = `
          INSERT INTO users (email, password, role)
          VALUES ($1, $2, $3)
          RETURNING id, email, role;
        `;
        const values = [email, password, role];
        const result = await db.query(queryText, values)

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    }
});

// 4. แก้ไขข้อมูล user (Update)
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, password, role } = req.body;
    try {
        const queryText = `
      UPDATE users 
      SET email = $1, password = $2, role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, email, role;
    `;
        const values = [email, password, role, id];
        const result = await db.query(queryText, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ User ที่ต้องการอัปเดต' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
    }
});

// 5. ลบ users (Delete)
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'ลบ User เรียบร้อยแล้ว' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถลบ User ได้' });
    }
});

// 1. ดึงรายการ categories ทั้งหมด
app.get('/api/categories', async (req, res) => {
    try {
        const queryText = `
      SELECT * 
      FROM categories
    `;
        const result = await db.query(queryText);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล categories' });
    }
});

// 2. ดึงรายละเอียด categories เฉพาะชิ้น
app.get('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ categories นี้' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

// 3. เพิ่ม categories ใหม่ (Create)
app.post('/api/categories', async (req, res) => {
    const { name, slug } = req.body;
    try {
        const queryText = `
      INSERT INTO categories (name, slug)
      VALUES ($1, $2)
      RETURNING *
    `;
        const values = [name, slug];
        const result = await db.query(queryText, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถเพิ่ม categories ได้ ตรวจสอบข้อมูลอีกครั้ง' });
    }
});

// 4. แก้ไขข้อมูล categories (Update)
app.put('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name, slug } = req.body;
    try {
        const queryText = `
      UPDATE categories 
      SET name = $1, slug = $2
      WHERE id = $3
      RETURNING *
    `;
        const values = [name, slug, id];
        const result = await db.query(queryText, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบ categories ที่ต้องการอัปเดต' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
    }
});

// 5. ลบ categories (Delete)
app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'ลบ categories เรียบร้อยแล้ว' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'ไม่สามารถลบ categories ได้' });
    }
});

// backend/index.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. API สมัครสมาชิก (Register)
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        // เช็กว่าอีเมลซ้ำไหม
        const userExist = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานไปแล้ว' });
        }

        // 🔒 แฮชรหัสผ่านด้วย bcrypt ก่อนบันทึก (ความปลอดภัยระดับสูง)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // บันทึกลงฐานข้อมูล
        const queryText = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role';
        const result = await db.query(queryText, [email, hashedPassword]);

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
});

// 2. API เข้าสู่ระบบ (Login)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // ค้นหา User จากอีเมล
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = result.rows[0];

        // 🔑 ตรวจสอบรหัสผ่านที่ส่งมา กับรหัสผ่านที่แฮชไว้ใน DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // 🎫 สร้าง JWT Token โดยฝัง id และ role ของ user ไว้ข้างใน (หมดอายุใน 1 วัน)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // ส่ง Token และข้อมูลผู้ใช้กลับไปให้หน้าบ้าน
        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
});

// backend/index.js

app.post('/api/orders', authenticateToken, async (req, res) => {
    // รับข้อมูลเพิ่มเติมจากหน้าบ้าน
    const { cartItems, totalPrice, shippingAddress, phoneNumber, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'ไม่มีสินค้าในตะกร้า' });
    }

    try {
        // ใช้ Transaction เพื่อความปลอดภัยของข้อมูล
        await db.query('BEGIN');

        // 1. บันทึกลงตารางหลัก orders (เพิ่มคอลัมน์ที่อยู่ เบอร์โทร วิธีชำระเงิน)
        const orderQuery = `
      INSERT INTO orders (user_id, total_price, shipping_address, phone_number, payment_method) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `;
        const orderResult = await db.query(orderQuery, [userId, totalPrice, shippingAddress, phoneNumber, paymentMethod]);
        const orderId = orderResult.rows[0].id;

        // 2. วนลูปบันทึกสินค้าลงตารางย่อย order_items
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
});
app.get('/', (req, res) => {
    res.send('API is running');
});
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


