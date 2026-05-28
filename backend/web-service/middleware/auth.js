// backend/web-service/middleware/auth.js
import jwt from 'jsonwebtoken';

/**
 * Middleware สำหรับตรวจสอบสิทธิ์ความปลอดภัย (JWT Token)
 * ใช้สำหรับดักเส้น API ที่ต้องการความปลอดภัย เช่น /profile หรือ /orders
 */
export const authenticateToken = (req, res, next) => {
    // 1. ดึงข้อมูลส่วนหัว (Headers) ที่ชื่อ Authorization
    const authHeader = req.headers['authorization'];
    
    // 2. แกะเอาเฉพาะตัว Token ออกมา (ตัดคำว่า 'Bearer ' ออกไป)
    const token = authHeader && authHeader.split(' ')[1];

    // 3. ถ้าไม่มี Token แนบมาเลย ให้แจ้งเตือนปฏิเสธสิทธิ์การเข้าถึง
    if (!token) {
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' });
    }

    // 4. นำ Token ไปตรวจสอบกับรหัสลับ (JWT_SECRET) ในไฟล์ .env
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // ถ้า Token ไม่ถูกต้อง, ปลอมแปลง หรือหมดอายุ ให้แจ้งเตือนปฏิเสธสิทธิ์
        if (err) {
            return res.status(403).json({ message: 'สิทธิ์การเข้าถึงไม่ถูกต้อง หรือ Token หมดอายุ' });
        }

        // 5. 💡 ไฮไลต์เด็ด: ถ้าถูกต้อง ให้นำข้อมูลผู้ใช้ (id, role) ไปแปะไว้ที่วัตถุ req.user
        // เพื่อส่งต่อไปให้ฟังก์ชันก์ถัดไป (เช่น getProfile หรือ checkout) นำไปใช้งานต่อได้
        req.user = user;
        
        // 6. ปล่อยผ่านให้วิ่งไปทำงานที่ Controller ต่อไป
        next();
    });
};