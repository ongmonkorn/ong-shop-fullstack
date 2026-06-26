// src/components/CartDrawer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to resolve dynamic image paths in Vite
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return new URL(`../assets/imgs/${url}`, import.meta.url).href;
};

export default function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart }) {
  const navigate = useNavigate(); // <-- 2. เรียกใช้งานเซตตัวแปรนำทาง
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const token = localStorage.getItem('ong_shop_token');
    
    // เช็กสิทธิ์ก่อน ถ้ายังไม่ล็อกอินให้ไปหน้าล็อกอิน
    if (!token) {
      alert('🔒 กรุณาเข้าสู่ระบบก่อนชำระเงินครับ');
      onClose(); // ปิด Drawer
      navigate('/auth'); 
      return;
    }

    // ถ้าล็อกอินแล้ว ให้ปิดหน้าต่างตะกร้า แล้วพาไปหน้าสร้างใบสั่งซื้อ (Checkout)
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-[100] overflow-hidden">
    {/* ฉากหลังโปร่งแสงหม่นๆ */}
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
    
    {/* 📱 ตัวกล่องตะกร้า: บนมือถือให้ w-full (เต็มจอ) / บนจอใหญ่ (sm:) ให้ล็อกไว้ที่ความกว้าง max-w-md */}
    <div className="absolute inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl flex flex-col h-full animate-slideIn">
      
      {/* ส่วนหัวตะกร้า: ปรับลด Padding บนมือถือเหลือ p-4 เพื่อเพิ่มพื้นที่แสดงไอเทมสินค้า */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">ตะกร้าของคุณ</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl sm:text-3xl p-1 cursor-pointer">&times;</button>
      </div>

      {/* ส่วนรายการสินค้า: โหลด Scrollbar แนวตั้ง / p-4 สำหรับมือถือ คล่องตัวขึ้น */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {cart.length === 0 ? (
          <p className="text-center text-slate-400 mt-10 text-sm sm:text-base">ตะกร้าว่างเปล่า... ลองเลือกซื้อสินค้าดูนะ</p>
        ) : (
          cart.map(item => (
            // 📱 รายการสินค้า: ใส่ space-X-3 บนมือถือ เพื่อไม่ให้ภาพกับข้อความห่างกันเกินไป
            <div key={item.id} className="flex space-x-3 sm:space-x-4 border-b border-slate-50 pb-4 last:border-0">
              {/* รูปภาพสินค้า: ย่อขนาดเหลือ w-16 h-16 บนจอมือถือเล็กๆ จะได้ไม่เบียดตัวหนังสือครับน้า */}
              <img src={item.image_url} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-100 shrink-0" alt={item.name} />
              
              <div className="flex-1 min-w-0"> {/* min-w-0 ช่วยป้องกันชื่อสินค้ายาวเกินจนดันปุ่มล้นจอ */}
                <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{item.name}</h4>
                <p className="text-blue-600 font-bold text-sm sm:text-base">฿{Number(item.price).toLocaleString()}</p>
                
                {/* 📱 ปุ่มบวก-ลบ-เพิ่มจำนวน และ ปุ่มลบออก */}
                <div className="flex items-center space-x-2 sm:space-x-3 mt-2">
                  {/* ปุ่มลดจำนวน (ขยายขนาดกดง่ายขึ้นนิดนึงบนมือถือ) */}
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-sm font-bold cursor-pointer">-</button>
                  <span className="font-semibold text-sm sm:text-base min-w-[16px] text-center">{item.quantity}</span>
                  {/* ปุ่มเพิ่มจำนวน */}
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-sm font-bold cursor-pointer">+</button>
                  
                  {/* ปุ่มลบออกทางขวาสุด */}
                  <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 text-xs sm:text-sm hover:underline cursor-pointer p-1">ลบออก</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ส่วนสรุปราคารวมและปุ่มไปต่อ: ล็อกให้อยู่ล่างสุดเสมอด้วย shrink-0 */}
      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 shrink-0 mb-safe"> {/* mb-safe ดักท้ายเผื่อหน้าจอมือถือไอโฟนที่มีขีดล่าง */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <span className="text-slate-500 text-sm sm:text-base">ราคารวมทั้งหมด</span>
          {/* ปรับขนาดฟอนต์ราคารวมให้สมดุลบนมือถือตัวไม่โตคับจอเกินไป */}
          <span className="text-2xl sm:text-3xl font-black text-slate-900">฿{totalPrice.toLocaleString()}</span>
        </div>
        <button 
          onClick={handleCheckout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300 disabled:shadow-none cursor-pointer text-sm sm:text-base" 
          disabled={cart.length === 0}
        >
          ไปหน้าชำระเงิน
        </button>
      </div>
    </div>
  </div>
);
}