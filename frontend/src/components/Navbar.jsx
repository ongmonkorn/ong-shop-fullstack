// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ cartCount, onCartClick }) {
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // 🔍 State สำหรับเปิดช่องค้นหาบนมือถือ

  const userJson = localStorage.getItem('ong_shop_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = localStorage.getItem('user_role');

  const handleLogout = () => {
    localStorage.removeItem('ong_shop_token');
    localStorage.removeItem('ong_shop_user');
    localStorage.removeItem('user_role');
    window.location.reload();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between relative">

        {/* ========================================================================================= */}
        {/* 🔍 [SECTION 1] ช่องค้นหาแบบแผ่เต็มจอสำหรับมือถือ (จะเด้งทับ Navbar ปกติตอนกดปุ่มแว่นขยายบนจอเล็ก) */}
        {/* ========================================================================================= */}
        {isMobileSearchOpen && (
          <div className="absolute inset-0 bg-white px-3 flex items-center z-50 animate-fadeIn md:hidden">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="ค้นหาสินค้าใน Ong Shop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              {/* ปุ่มกดปิดหน้าค้นหาเพื่อกลับสู่ Navbar ปกติ */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
            </form>
          </div>
        )}

        {/* 🏪 โลโก้ร้าน (จะถูกซ่อนอัตโนมัติถ้าพื้นที่จอมือถือเล็กมากและเปิดเสิร์ชอยู่) */}
        <Link to="/" className="flex items-center space-x-1.5 shrink-0">
          <span className="text-xl sm:text-2xl">🛒</span>
          <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Ong Shop</span>
        </Link>

        {/* ========================================================================================= */}
        {/* 🔍 [SECTION 2] ช่องค้นหาเวอร์ชันหน้าจอคอมพิวเตอร์ (md:flex ขยายตัวตรงกลาง / ซ่อนบนมือถือ) */}
        {/* ========================================================================================= */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative max-w-md w-full mx-4"
        >
          <span className="absolute left-3.5 text-slate-400 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาสินค้าที่คุณต้องการ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner/5"
          />
        </form>

        {/* 📱 กล่องรวมปุ่มเมนูฝั่งขวา */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">

          {/* 🔍 ปุ่มแว่นขยายสำหรับเปิดเสิร์ชบนจอมือถือ (hidden บนจอคอม) */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex md:hidden items-center justify-center w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm transition-colors cursor-pointer text-slate-700"
          >
            🔍
          </button>

          {/* 🛒 ส่วนของ "ตะกร้าสินค้า" */}
          {userRole !== 'admin' && (
            <button
              onClick={onCartClick}
              className="relative bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors flex items-center space-x-1 sm:space-x-2 shrink-0 cursor-pointer focus:outline-none"
            >
              <span>🛍️</span>
              <span className="hidden sm:inline">ตะกร้าสินค้า</span>
              {cartCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* 🚨 ส่วนจัดการสิทธิ์โปรไฟล์ Dropdown */}
          {user ? (
            <div className="relative border-l border-slate-200 pl-1.5 sm:pl-3">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full hover:bg-slate-50 transition-all duration-200 border border-slate-200 cursor-pointer focus:outline-none"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white font-black flex items-center justify-center text-xs shadow-sm
                  ${userRole === 'admin' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                  {userRole === 'admin' ? '⚙️' : user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[80px] truncate">
                  {userRole === 'admin' ? 'แอดมิน' : user.email}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 📋 รายการ Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn origin-top-right">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {userRole === 'admin' ? '👮 สิทธิ์ผู้ดูแลระบบ' : '👤 สมาชิกล็อกอิน'}
                      </p>
                      <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer font-bold"
                      >
                        👤 โปรไฟล์ส่วนตัว
                      </button>
                      {userRole === 'admin' ? (
                        <button
                          onClick={() => { navigate('/admin/products'); setIsProfileOpen(false); }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-xl transition-colors cursor-pointer font-bold"
                        >
                          ⚙️ ระบบจัดการร้าน
                        </button>
                      ) : (
                        <button
                          onClick={() => { navigate('/order-history'); setIsProfileOpen(false); }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer font-bold"
                        >
                          📦 ประวัติคำสั่งซื้อ
                        </button>
                      )}
                    </div>
                    <div className="p-1 border-t border-slate-100 mt-1">
                      <button
                        onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer font-bold"
                      >
                        🚪 ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="border-l border-slate-200 pl-2 sm:pl-4 shrink-0">
              <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer">
                เข้าสู่ระบบ
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}