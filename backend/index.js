// index.js (ฝั่ง Backend)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './web-service/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ทุก API Route จากไฟล์ web-service จะขึ้นต้นด้วย /api เช่น http://localhost:5000/api/products
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});