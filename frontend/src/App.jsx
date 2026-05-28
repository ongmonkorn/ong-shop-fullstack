// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer'; // <-- 1. Import CartDrawer เข้ามา
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';

function App() {
  const [products, setProducts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // <-- 2. สถานะ เปิด/ปิด ตะกร้าสินค้า
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('ong_shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('ong_shop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const isExist = prevCart.find((item) => item.id === product.id);
      if (isExist) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('ong_shop_cart');
  };

  // <-- 3. ฟังก์ชันเพิ่ม/ลดจำนวนสินค้าในหน้าตะกร้า
  const updateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + amount;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0) // ถ้าลดจนเหลือ 0 ให้ลบออกจากตะกร้าอัตโนมัติ
    );
  };

  // <-- 4. ฟังก์ชันลบสินค้าออกจากตะกร้าทันที
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router> {/* 💡 1. ครอบระบบด้วย Router เพื่อเปิดใช้ระบบเปลี่ยนหน้า */}
      <div className="min-h-screen bg-slate-50">
        {/* ส่งฟังก์ชันเปิดตะกร้าไปที่ Navbar */}
        <Navbar cartCount={totalItemsInCart} onCartClick={() => setIsCartOpen(true)} />
        <Routes>
          <Route path="/" element={
            <main className="max-w-6xl mx-auto px-4 py-8">
              <header className="mb-8">
                <h1 className="text-3xl font-black text-slate-800">สินค้าทั้งหมด</h1>
                <p className="text-slate-500 mt-1">เลือกซื้อสินค้าที่คุณต้องการ ระบบจะอัปเดตตะกร้าแบบเรียลไทม์</p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} />
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-400 text-lg">⚠️ ไม่พบสินค้าในระบบ หรือกรุณาเช็กว่ารันเซิร์ฟเวอร์หลังบ้าน (พอร์ต 5000) อยู่หรือไม่</p>
                </div>
              )}
            </main>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
        </Routes>

        {/* <-- 5. วาง Component หน้าต่างตะกร้าสินค้าไว้ท้ายสุด */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      </div>
    </Router>
  );
}

export default App;