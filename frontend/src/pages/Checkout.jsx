// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout({ cart, clearCart }) {
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('โอนเงินผ่านธนาคาร');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
            const response = await fetch('http://localhost:5000/api/orders', {
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
        <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-black text-slate-800 mb-8">📝 ทำรายการสั่งซื้อ (Checkout)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ฝั่งซ้าย: ฟอร์มกรอกข้อมูล (7 คอลัมน์) */}
                <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">ข้อมูลการจัดส่งและการชำระเงิน</h2>

                    <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">เบอร์โทรศัพท์ติดต่อ</label>
                        <input
                            type="tel" required placeholder="เช่น 0812345678"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-800 focus:outline-blue-600"
                            value={phone} onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-600 block mb-2">ที่อยู่สำหรับจัดส่งสินค้า</label>
                        <textarea
                            required rows="4" placeholder="กรอกชื่อ-นามสกุล และที่อยู่จัดส่งโดยละเอียด..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-800 focus:outline-blue-600 resize-none"
                            value={address} onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-600 block mb-3">ช่องทางการชำระเงิน</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <label className={`border p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${paymentMethod === 'เก็บเงินปลายทาง' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
                                <input type="radio" name="payment" value="เก็บเงินปลายทาง" checked={paymentMethod === 'เก็บเงินปลายทาง'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 accent-blue-600" />
                                <span className="text-sm font-bold text-slate-700">📦 เก็บเงินปลายทาง (COD)</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-100 mt-6 cursor-pointer disabled:bg-slate-400">
                        {loading ? 'กำลังบันทึกใบสั่งซื้อ...' : '🔒 ยืนยันคำสั่งซื้อ'}
                    </button>
                </form>

                {/* ฝั่งขวา: สรุปรายการสินค้าในตะกร้า (5 คอลัมน์) */}
                <div className="lg:col-span-5 bg-slate-100 p-6 rounded-3xl border border-slate-200 h-fit">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">สรุปรายการคำสั่งซื้อ</h2>
                    <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                                <div className="min-w-0 flex-1 pr-2">
                                    <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                                    <p className="text-xs text-slate-400">จำนวน: {item.quantity} ชิ้น</p>
                                </div>
                                <span className="text-sm font-black text-slate-700">฿{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">ยอดชำระสุทธิ:</span>
                        <span className="text-2xl font-black text-blue-600">฿{totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}