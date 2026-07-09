// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom'; // ➕ เพิ่ม useSearchParams เข้ามาครับน้า
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import ProductAdd from './pages/ProductAdd';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductsEdit from './pages/admin/ProductEdit';

// 🔍 สร้าง Component ย่อยด้านในเพื่อให้ใช้ฟังก์ชัน useSearchParams() ได้อย่างถูกต้องครับน้า
function MainProductList({ products, addToCart }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || ''; // ดักฟังคำค้นหาจาก URL (เช่น ?search=เสื้อ)

  // 🔍 ทำการกรองสินค้าแบบเรียลไทม์ผ่านชื่อสินค้า
  const filteredProducts = products.filter((product) => {
    const productName = product.name ? product.name.toLowerCase() : '';
    const searchTarget = searchQuery.toLowerCase();
    return productName.includes(searchTarget);
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* 🔍 ถ้ามีการค้นหา ให้แสดงแถบสถานะแจ้งว่ากำลังหาอะไรอยู่ */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm animate-fadeIn">
          <p className="text-slate-600 text-sm">
            ผลการค้นหาสำหรับ: <span className="font-bold text-blue-600">"{searchQuery}"</span>
            ({filteredProducts.length} ชิ้น)
          </p>
          <button
            onClick={() => window.location.href = '/'} // กดยกเลิก เพื่อล้างตัวเสิร์ชกลับหน้าแรกโล่งๆ
            className="text-xs font-bold text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
          >
            ❌ ล้างการค้นหา
          </button>
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800">
          {searchQuery ? '📦 ผลการค้นหา' : 'สินค้าทั้งหมด'}
        </h1>
        <p className="text-slate-500 mt-1">เลือกซื้อสินค้าที่คุณต้องการ ระบบจะอัปเดตตะกร้าแบบเรียลไทม์</p>
      </header>

      {/* แสดงรายการสินค้าที่กรองเสร็จแล้ว */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      ) : (
        /* 🔍 ดักกรณีหาของไม่เจอ */
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-4xl">🔍</span>
          <p className="text-slate-500 text-lg font-bold mt-3">ไม่พบสินค้าที่ตรงกับคำว่า "{searchQuery}"</p>
          <p className="text-slate-400 text-xs mt-1">ลองพิมพ์ตัวสะกดใหม่อีกครั้งนะครับน้า</p>
        </div>
      )}
    </main>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('ong_shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/products/getproducts`)
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
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar cartCount={totalItemsInCart} onCartClick={() => setIsCartOpen(true)} />

        <Routes>
          {/* 🔍 ปรับตรงนี้: ดึงก้อนแสดงสินค้าขึ้นไปครอบด้วย Component ดักเสิร์ชด้านบน */}
          <Route path="/" element={<MainProductList products={products} addToCart={addToCart} />} />

          <Route path="/auth" element={<Auth />} />
          <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-product" element={<ProductAdd />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/product-edit/:id" element={<AdminProductsEdit />} />
        </Routes>

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