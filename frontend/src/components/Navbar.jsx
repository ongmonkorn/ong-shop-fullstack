// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ cartCount, onCartClick }) {
  // ดึงข้อมูลผู้ใช้จาก localStorage มาเช็กสถานะการล็อกอิน
  const userJson = localStorage.getItem('ong_shop_user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('ong_shop_token');
    localStorage.removeItem('ong_shop_user');
    window.location.reload(); // รีโหลดเพื่อให้หน้าจอเคลียร์สถานะ
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl">🛒</span>
          <span className="text-xl font-black text-slate-800 tracking-tight">Ong Shop</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCartClick}
            className="relative bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2 rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <span>ตะกร้าสินค้า</span>
            {cartCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* 💡 ส่วนเช็กการแสดงผลปุ่ม Auth */}
          {user ? (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:inline">👤 {user.email}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}