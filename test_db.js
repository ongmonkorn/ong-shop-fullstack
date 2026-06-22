import db from './backend/db.js';

async function test() {
  try {
    const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("Tables:", res.rows);
    
    // Check columns of products table
    const cols = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products'");
    console.log("Products columns:", cols.rows);

    // Check categories table
    const cats = await db.query("SELECT * FROM categories");
    console.log("Categories:", cats.rows);
  } catch (err) {
    console.error("Error connecting to database:", err);
  } finally {
    await db.end();
  }
}

test();
