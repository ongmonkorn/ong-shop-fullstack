// web-service.js
import { Router } from 'express';
import db from '../db.js';
import products from './routes/products.js';
import users from './routes/users.js';
import { authenticateToken } from './middleware/auth.js';

const router = Router();

router.use('/', products);
router.use('/auth', users);



// ----------------------------------------------------
// 2. 📝 เพิ่มเส้น API สั่งซื้อสินค้า (Checkout) ย้ายมาไว้ที่นี่เพื่อความจำเพาะ
// ----------------------------------------------------
router.post('/orders', authenticateToken, async (req, res) => {
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
});

// // 📝 1. API สมัครสมาชิก (ย้ายมาอยู่ใน router ยุคใหม่)
// router.post('/auth/register', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const userExist = await db.query('SELECT id FROM users WHERE email = $1', [email]);
//         if (userExist.rows.length > 0) {
//             return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานไปแล้ว' });
//         }

//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         const queryText = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role';
//         const result = await db.query(queryText, [email, hashedPassword]);

//         res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: result.rows[0] });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
//     }
// });

// // 🔑 2. API เข้าสู่ระบบ (ย้ายมาอยู่ใน router ยุคใหม่)
// router.post('/auth/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
//         if (result.rows.length === 0) {
//             return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
//         }

//         const user = result.rows[0];
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
//         }

//         const token = jwt.sign(
//             { id: user.id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         res.json({
//             message: 'เข้าสู่ระบบสำเร็จ',
//             token,
//             user: { id: user.id, email: user.email, role: user.role }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
//     }
// });

export default router;