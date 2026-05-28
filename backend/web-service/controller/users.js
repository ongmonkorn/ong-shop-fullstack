// backend/web-service/controller/users.js
import { Router } from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

// 📝 1. ฟังก์ชันสมัครสมาชิก
const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExist = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานไปแล้ว' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const queryText = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role';
        const result = await db.query(queryText, [email, hashedPassword]);

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
};

// 🔑 2. ฟังก์ชันเข้าสู่ระบบ
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
};

// 👤 3. ฟังก์ชันดึงข้อมูลโปรไฟล์ 
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'ไม่พบสิทธิ์การเข้าถึง กรุณาล็อกอินใหม่' });
        }

        const userId = req.user.id;
        const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งานนี้' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบโปรไฟล์' });
    }
};
// 4. ฟังก์ชันแสดงรายชื่อผู้ใช้ทั้งหมด
const getUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, email, role FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน' });
    }
}
// 5. ฟังก์ชันดึงข้อมูลผู้ใช้ by id
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งานนี้' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน' });
    }
}
// 6. ฟังก์ชันแก้ไขข้อมูลผู้ใช้
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;
        const result = await db.query('UPDATE users SET email = $1, role = $2 WHERE id = $3 RETURNING id, email, role', [email, role, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งานนี้' });
        }
        res.json({ message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้' });
    }
}
// 7. ฟังก์ชันลบข้อมูลผู้ใช้
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, email, role', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งานนี้' });
        }
        res.json({ message: 'ลบข้อมูลผู้ใช้สำเร็จ', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้' });
    }
}
// 8. ฟังก์ชันเปลี่ยนรหัสผ่าน
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await db.query('UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email, role', [hashedPassword, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งานนี้' });
        }
        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
    }
}
// 9. ฟังก์ชันเพิ่มข้อมูลผู้ใช้
const addUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await db.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role', [email, hashedPassword, role]);
        res.json({ message: 'เพิ่มผู้ใช้สำเร็จ', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้' });
    }
}
// 🚀 มัดรวมส่งออกไปทีเดียวที่นี่ (สะอาด เรียบร้อย ไม่ซ้ำซ้อนแล้วครับ)
export { register, login, getUsers, getUserById, getProfile, updateProfile, deleteUser, changePassword, addUser };