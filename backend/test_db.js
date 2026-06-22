import db from './db.js';

async function test() {
  try {
    // Attempting to insert a product without stock
    console.log("Attempting to insert a product without stock...");
    const res = await db.query(`
      INSERT INTO products (name, price, description, image_url, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, ['Test Product Missing Stock', 99.99, 'Test description', 'test.jpg', 1]);
    console.log("Inserted:", res.rows[0]);
  } catch (err) {
    console.error("Insert failed:", err.message);
  } finally {
    await db.end();
  }
}

test();
