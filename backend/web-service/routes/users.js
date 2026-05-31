// backend/web-service/routes/users.js
import { Router } from 'express';
import { register, login, getUsers, getUserById, getProfile, updateProfile, changePassword, addUser, deleteUser } from '../controller/users.js';
import { authenticateToken } from '../middleware/auth.js'; // 🚨 ดึง Middleware ของคุณเข้ามา (เช็กตำแหน่งพาธไฟล์ให้ถูกนะครับ)

const router = Router();

// 1. สมัครสมาชิก
router.post('/register', register);
// 2. เข้าสู่ระบบ
router.post('/login', login);
// 3. แสดงรายชื่อผู้ใช้ทั้งหมด
router.get('/users', getUsers);
// 4. แสดงข้อมูลผู้ใช้ by id
router.get('/users/:id', getUserById);
// 5. แสดงข้อมูลโปรไฟล์
router.get('/profile', authenticateToken, getProfile);
// 6. แก้ไขข้อมูลผู้ใช้
router.put('/users/:id', updateProfile);
// 7. เปลี่ยนรหัสผ่าน
router.put('/users/change-password/:id', changePassword);
// 8. เพิ่มผู้ใช้
router.post('/users/add-user', addUser);
// 9. ลบข้อมูลผู้ใช้
router.delete('/users/:id', deleteUser); 

export default router;