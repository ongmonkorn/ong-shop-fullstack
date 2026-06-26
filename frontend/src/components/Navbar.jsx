// src/components/Navbar.jsx
import React, { useState } from 'react'; // ➕ เพิ่ม useState เข้ามาจัดการเปิด-ปิด Dropdown ครับน้า
import { Link, useNavigate } from 'react-router-dom'; // ➕ เพิ่ม useNavigate เพื่อให้กดเมนูแล้ววิ่งไปหน้าต่างๆ ได้

export default function Navbar({ cartCount, onCartClick }) {
  const navigate = useNavigate();
  
  // 🔘 State สำหรับควบคุมการเปิด/ปิด Dropdown ของโปรไฟล์
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ดึงข้อมูลผู้ใช้จาก localStorage มาเช็กสถานะการล็อกอิน
  const userJson = localStorage.getItem('ong_shop_user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = localStorage.getItem('user_role');

  const handleLogout = () => {
    localStorage.removeItem('ong_shop_token');
    localStorage.removeItem('ong_shop_user');
    localStorage.removeItem('user_role'); 
    window.location.reload(); // รีโหลดเพื่อให้หน้าจอเคลียร์สถานะ
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
        
        {/* 🏪 โลโก้ร้าน */}
        <Link to="/" className="flex items-center space-x-1.5 shrink-0">
          <span className="text-xl sm:text-2xl">🛒</span>
          <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Ong Shop</span>
        </Link>

        {/* 📱 กล่องรวมปุ่มเมนูฝั่งขวา */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          
          {/* 🛒 ส่วนของ "ตะกร้าสินค้า" (แสดงเฉพาะเมื่อไม่ใช่แอดมิน และล็อกอินแล้ว/ยังไม่ล็อกอินก็เห็นได้) */}
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

          {/* 🚨 ส่วนจัดการสิทธิ์ (Auth Section) */}
          {user ? (
            <div className="relative border-l border-slate-200 pl-2 sm:pl-4">
              
              {/* 🔘 ตัวปุ่ม Profile ทรงกลม มินิมอล */}
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-full hover:bg-slate-50 transition-all duration-200 border border-slate-200 cursor-pointer focus:outline-none"
              >
                {/* วงกลมสัญลักษณ์อักษรแรกของ Email */}
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-sm
                  ${userRole === 'admin' ? 'bg-amber-500' : 'bg-blue-600'}`}>
                  {userRole === 'admin' ? '⚙️' : user?.email?.charAt(0).toUpperCase()}
                </div>
                
                {/* แสดงชื่อย่อบนจอคอม / ซ่อนบนจอมือถือ */}
                <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[100px] truncate">
                  {userRole === 'admin' ? 'แอดมิน' : user.email}
                </span>
                
                {/* ไอคอนลูกศรชี้ลง */}
                <svg 
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 📋 กล่อง Dropdown เมนูย่อยเมื่อกดปุ่ม Profile */}
              {isProfileOpen && (
                <>
                  {/* ฉากหลังดักคลิกเพื่อปิดเมนู */}
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                  
                  {/* ตัวกล่องเมนูสไลด์ลง */}
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fadeIn origin-top-right">
                    
                    {/* หัวแถว: แสดงรายละเอียดผู้ใช้งานปัจจุบัน */}
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {userRole === 'admin' ? '👮 สิทธิ์ผู้ดูแลระบบ' : '👤 สมาชิกล็อกอิน'}
                      </p>
                      <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* รายการลิงก์ภายในเมนู Dropdown */}
                    <div className="p-1 space-y-0.5">
                      {/* เมนูที่ 1: หน้าโปรไฟล์ส่วนตัว (กดได้ทั้งแอดมินและลูกค้า) */}
                      <button
                        onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer font-bold"
                      >
                        👤 โปรไฟล์ส่วนตัว
                      </button>
                      
                      {/* เมนูย่อยตามสิทธิ์ผู้ใช้งาน */}
                      {userRole === 'admin' ? (
                        /* ถ้าเป็น Admin ให้เห็นเมนูหลังบ้านในนี้เลย */
                        <button
                          onClick={() => { navigate('/admin/products'); setIsProfileOpen(false); }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-xl transition-colors cursor-pointer font-bold"
                        >
                          ⚙️ ระบบจัดการร้าน
                        </button>
                      ) : (
                        /* ถ้าเป็นลูกค้าทั่วไป ให้เห็นประวัติคำสั่งซื้อ */
                        <button
                          onClick={() => { navigate('/order-history'); setIsProfileOpen(false); }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer font-bold"
                        >
                          📦 ประวัติคำสั่งซื้อ
                        </button>
                      )}
                    </div>

                    {/* ส่วนท้าย: ปุ่มออกจากระบบ */}
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
            /* ถ้าไม่ได้ล็อกอิน ให้ขึ้นปุ่มเข้าสู่ระบบเหมือนเดิม */
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