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
    <div className="fixed inset-0 z-100 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-800">ตะกร้าของคุณ</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <p className="text-center text-slate-400 mt-10">ตะกร้าว่างเปล่า... ลองเลือกซื้อสินค้าดูนะ</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex space-x-4 border-b border-slate-50 pb-4">
                <img src={getImageUrl(item.image_url)} className="w-20 h-20 object-cover rounded-lg bg-slate-100" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <p className="text-blue-600 font-bold">฿{Number(item.price).toLocaleString()}</p>
                  
                  <div className="flex items-center space-x-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">-</button>
                    <span className="font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 text-sm hover:underline">ลบออก</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-500">ราคารวมทั้งหมด</span>
            <span className="text-3xl font-black text-slate-900">฿{totalPrice.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:shadow-none cursor-pointer" 
            disabled={cart.length === 0}
          >
            ไปหน้าชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
}