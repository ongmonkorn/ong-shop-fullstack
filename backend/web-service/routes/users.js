// backend/web-service/routes/users.js
import { Router } from 'express';
import { register, login, getUsers, getUserById, getProfile, updateProfile, changePassword, addUser, deleteUser } from '../controller/users.js';
import { authenticateToken } from '../middleware/auth.js'; // 🚨 ดึง Middleware ของคุณเข้ามา (เช็กตำแหน่งพาธไฟล์ให้ถูกนะครับ)

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get('/profile', authenticateToken, getProfile);
router.put('/users/:id', updateProfile);
router.put('/users/change-password/:id', changePassword);
router.post('/users/add-user', addUser);
router.delete('/users/:id', deleteUser); 

export default router;