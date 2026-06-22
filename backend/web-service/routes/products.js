import { Router } from 'express';
import { products, productById, addProduct, deleteProduct, updateProduct } from '../controller/products.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // 🚨 อิมพอร์ตตัวนี้เพิ่มเข้ามาช่วยหาฐานพิกัดครับน้า

const router = Router();

// 🚨 1. สร้างฐานที่ตั้งล็อกตำแหน่งไฟล์ปัจจุบัน (ระบบ ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚨 2. ตั้งค่าการเซฟไฟล์ด้วยพิกัดล็อกเป้าแม่นยำ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // ใช้ path.resolve ถอยหลังจากตำแหน่งไฟล์นี้เพื่อวิ่งไปหาโฟลเดอร์ frontend ตรงๆ 
        // สังเกตจากโค้ดเดิมของน้า ถอยออก 3 ชั้น จะถึงโฟลเดอร์รวมด้านนอกสุดพอดีครับ
        const dir = path.resolve(__dirname, '../../../frontend/src/assets/imgs');
        
        // ตัวช่วยกันเหนียว: ถ้าวันดีคืนดีโฟลเดอร์เกิดหายไป ให้ระบบสร้างขึ้นมาใหม่ทันที
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- ด้านล่างนี้คือโค้ดเดิมของน้าทั้งหมด ปล่อยไว้เหมือนเดิมได้เลยครับ สวยงามแล้ว ---
router.get('/getproducts', products);
router.get('/', products);
router.get('/:id', productById);
router.post('/add-products', upload.single('image'), addProduct);
router.delete('/delete-products/:id', deleteProduct);
router.put('/update-products/:id', upload.single('image'), updateProduct);

export default router;