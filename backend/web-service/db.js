// backend/db.js
import pkg from 'pg';
import dotenv from 'dotenv';

// โหลดค่าตัวแปรจากไฟล์ .env
dotenv.config();

const { Pool } = pkg;

// สร้าง Connection Pool สำหรับเชื่อมต่อ PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// 💡 ไฮไลต์เด็ด: เปลี่ยนจาก module.exports เป็น export default
export default pool;