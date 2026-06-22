import db from '../db.js';

const getCategories = async (req, res) => {
    try {
        // ดึงข้อมูล id และชื่อหมวดหมู่ ออกมาเรียงตามชื่อ
        const result = await db.query('SELECT id, name, slug FROM categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้' });
    }
} 
export { getCategories };