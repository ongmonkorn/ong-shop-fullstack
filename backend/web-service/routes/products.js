
import { Router } from 'express';
import { products, productById, addProduct, deleteProduct, updateProduct } from '../controller/products.js';
import multer from 'multer';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';


const router = Router();

const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});


const storage = multerS3({
    s3: s3,
    bucket: 'ong-shop-bucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    publicUrl: (req, file) => process.env.R2_PUBLIC_URL,
    key: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
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