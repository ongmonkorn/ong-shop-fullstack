// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout({ cart, clearCart }) {
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('โอนเงินผ่านธนาคาร');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('ong_shop_token');

        if (cart.length === 0) {
            alert('ไม่มีสินค้าในตะกร้าสำหรับการสั่งซื้อ');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    cartItems: cart,
                    totalPrice,
                    shippingAddress: address,
                    phoneNumber: phone,
                    paymentMethod
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            alert(`🎉 สร้างใบสั่งซื้อสำเร็จ!\nรหัสคำสั่งซื้อของคุณคือ: #ORD${data.orderId}`);
            clearCart(); // เรียกฟังก์ชันล้างตะกร้าใน App.jsx
            navigate('/'); // พากลับหน้าแรก
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-xl mx-auto mt-20 text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-5xl block mb-4">📥</span>
                <h2 className="text-xl font-bold text-slate-800">ไม่มีสินค้าในตะกร้าของคุณ</h2>
                <button onClick={() => navigate('/')} className="mt-4 bg-blue-600 text-white font-medium px-6 py-2 rounded-xl cursor-pointer">
                    ไปเลือกซื้อสินค้า
                </button>
            </div>
        );
    }

    return (
    // 📱 ปรับระยะขอบบนมือถือให้เหลือ px-3 py-6 พอดีคำ / จอใหญ่ขยายเป็น px-4 py-12
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-12 animate-fadeIn">
        {/* หัวข้อ: บนมือถืออักษร text-2xl / จอคอม text-3xl */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6 sm:mb-8">📝 ทำรายการสั่งซื้อ (Checkout)</h1>

        {/* 📱 ตัว Grid: ใช้ประโยชน์จาก flex-col-reverse ในจอเล็ก เพื่อดึงสรุปออเดอร์ขึ้นไปโชว์ด้านบนก่อนกรอกได้ครับน้า */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 flex flex-col-reverse lg:flex-row">
            
            {/* 📝 ฝั่งซ้าย: ฟอร์มกรอกข้อมูล (7 คอลัมน์) */}
            {/* 📱 บนมือถือบีบ Padding เหลือ p-5 เพื่อเพิ่มพื้นที่พิมพ์ / บนจอคอมใช้ p-8 ตามปกติ */}
            <form onSubmit={handlePlaceOrder} className="col-span-1 lg:col-span-7 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">ข้อมูลการจัดส่งและการชำระเงิน</h2>

                <div>
                    <label className="text-sm font-bold text-slate-600 block mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
                    <input
                        type="tel" required placeholder="เช่น 0812345678"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-800 focus:outline-blue-600 text-base"
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-slate-600 block mb-1.5">ที่อยู่สำหรับจัดส่งสินค้า</label>
                    <textarea
                        required rows="4" placeholder="กรอกชื่อ-นามสกุล และที่อยู่จัดส่งโดยละเอียด..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-800 focus:outline-blue-600 resize-none text-base"
                        value={address} onChange={(e) => setAddress(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm font-bold text-slate-600 block mb-2.5">ช่องทางการชำระเงิน</label>
                    {/* 📱 ช่องทางการจ่ายเงิน: ใช้คำสั่งแบ่งคอลัมน์ดักไว้ ถ้ามีหลายช่องทางในอนาคตจะเรียงคู่สวยงาม */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`border p-3.5 sm:p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'เก็บเงินปลายทาง' ? 'border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-50/30' : 'border-slate-200 bg-white'}`}>
                            <input type="radio" name="payment" value="เก็บเงินปลายทาง" checked={paymentMethod === 'เก็บเงินปลายทาง'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                            <span className="text-xs sm:text-sm font-bold text-slate-700">📦 เก็บเงินปลายทาง (COD)</span>
                        </label>
                    </div>
                </div>

                {/* ปุ่มยืนยัน: ขยายความสูง (py-3.5 บนมือถือ / py-4 บนคอม) เพื่อให้นิ้วโป้งกดง่ายถนัดมือ */}
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all shadow-lg shadow-blue-100 mt-4 sm:mt-6 cursor-pointer disabled:bg-slate-400 disabled:shadow-none text-base">
                    {loading ? 'กำลังบันทึกใบสั่งซื้อ...' : '🔒 ยืนยันคำสั่งซื้อ'}
                </button>
            </form>

            {/* 💰 ฝั่งขวา: สรุปรายการสินค้าในตะกร้า (5 คอลัมน์) */}
            {/* 📱 p-5 สำหรับมือถือ / p-6 สำหรับจอใหญ่ และเพิ่มคำสั่ง lg:sticky top-24 เผื่อหน้ารายการสินค้ายาว บล็อกรวมราคาจะสไลด์ตามลงมาสวยๆ ครับน้า */}
            <div className="col-span-1 lg:col-span-5 bg-slate-50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 h-fit lg:sticky lg:top-24">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">สรุปรายการคำสั่งซื้อ</h2>
                
                {/* กล่องรายการสินค้า */}
                <div className="space-y-2.5 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto mb-4 pr-1">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 gap-2">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                                <p className="text-[11px] sm:text-xs text-slate-400">จำนวน: {item.quantity} ชิ้น</p>
                            </div>
                            <span className="text-xs sm:text-sm font-black text-slate-700 shrink-0">฿{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                
                {/* ยอดชำระสุทธิ */}
                <div className="border-t border-slate-200 pt-3 sm:pt-4 flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-bold text-slate-500">ยอดชำระสุทธิ:</span>
                    <span className="text-xl sm:text-2xl font-black text-blue-600">฿{totalPrice.toLocaleString()}</span>
                </div>
            </div>
            
        </div>
    </div>
);
}