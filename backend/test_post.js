async function testPost() {
  try {
    const payload = {
      name: "สินค้าทดสอบชิ้นใหม่",
      price: 1500,
      description: "รายละเอียดสำหรับการทดสอบ",
      image_url: "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", // Mock Base64
      category_id: 1,
      stock: 45
    };
    
    const res = await fetch('http://localhost:5000/api/products/add-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log("POST Response Status:", res.status);
    const data = await res.json();
    console.log("POST Response Data:", data);
  } catch (err) {
    console.error("POST Test Failed:", err);
  }
}

testPost();
