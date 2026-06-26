// src/pages/OrderHistory.jsx
import React, { useEffect, useState } from 'react';

// ฟังก์ชันแปลงพาธรูปภาพที่คุณเขียนไว้
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return new URL(`../assets/imgs/${url}`, import.meta.url).href;
};

export default function OrderHistory() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelingId, setCancelingId] = useState(null); // 🚨 เติมตัวนี้เพื่อล็อกไม่ให้กดปุ่มยกเลิกเบิ้ล

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('ong_shop_token'); // ดึง Token มายืนยันตัวตน
                if (!token) {
                    setError('กรุณาเข้าสู่ระบบก่อนดูประวัติการสั่งซื้อ');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_URL}/api/orders/my-orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
                }

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // 🛠️ ปรับปรุงฟังก์ชันยกเลิกคำสั่งซื้อใหม่ให้ปลอดภัย ไร้บั๊ก
    const cancelOrder = async (id) => {
        if (!window.confirm('คุณต้องการยกเลิกคำสั่งซื้อนี้หรือไม่?')) return;
        
        try {
            const token = localStorage.getItem('ong_shop_token');
            if (!token) {
                alert('กรุณาเข้าสู่ระบบก่อน');
                return;
            }

            setCancelingId(id); // เปิดโหมดกำลังโหลดเฉพาะปุ่มนี้

            const response = await fetch(`${API_URL}/api/orders/${id}/cancel`, {
                method: 'PUT', // หรือ PATCH ตามที่หลังบ้านคุณตั้งไว้
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถยกเลิกคำสั่งซื้อได้');
            }

            // 🚨 แก้บั๊กจุดเด็ด: วนลูปอัปเดตสถานะเฉพาะตัวที่ยกเลิกสำเร็จในหน้าจอทันที ไม่ทำรายการอื่นหาย
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === id ? { ...order, status: 'cancelled' } : order
                )
            );
            
            alert('ยกเลิกคำสั่งซื้อสำเร็จเรียบร้อยแล้ว');
        } catch (err) {
            alert(err.message);
        } finally {
            setCancelingId(null); // ปลดล็อกปุ่ม
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-500">กำลังโหลดประวัติการสั่งซื้อ...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (orders.length === 0) return <div className="text-center py-10 text-slate-500">คุณยังไม่มีประวัติคำสั่งซื้อ</div>;

    return (
    // 📱 ปรับระยะขอบหน้าจอซ้าย-ขวาให้ยืดหยุ่นตามขนาดจอ (px-3 บนมือถือ / px-4 บนจอใหญ่)
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12 animate-fadeIn">
        {/* หัวข้อเว็บ: ปรับขนาดอักษรตามความกว้างหน้าจอ */}
        <h1 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 text-slate-800">📦 ประวัติคำสั่งซื้อของฉัน</h1>
        
        <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
                    
                    {/* 📱 Header: ใช้ grid-cols-2 บนมือถือเพื่อจัดกลุ่มข้อมูลให้แบ่งครึ่งสวยๆ ไม่เบียดกัน / และสลับเป็น flex บนจอคอม (sm:) */}
                    <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-between sm:items-center gap-3 sm:gap-2">
                        <div>
                            <p className="text-[11px] sm:text-xs text-slate-500">เลขที่คำสั่งซื้อ</p>
                            <p className="text-xs sm:text-sm font-bold text-slate-700">#ORD-{order.id}</p>
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs text-slate-500">วันที่สั่งซื้อ</p>
                            <p className="text-xs sm:text-sm text-slate-600 font-medium">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                        </div>
                        {/* 📱 ป้ายสถานะ: บนมือถือขยับให้คลุมฝั่งขวาหรือจัดสัดส่วนเดี่ยวด้วย col-span-2 ถ้าจำเป็น หรือปล่อยเรียงแถวคู่ */}
                        <div className="col-span-2 sm:col-span-1 sm:text-right mt-1 sm:mt-0">
                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold 
                                ${order.status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
                                  order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                                  'bg-red-50 text-red-700 border border-red-200'}`}>
                                {order.status === 'success' ? '● สำเร็จ' : order.status === 'pending' ? '● รอการจัดส่ง' : '● ยกเลิกแล้ว'}
                            </span>
                        </div>
                    </div>

                    {/* รายการสินค้าข้างในคำสั่งซื้อ */}
                    {/* 📱 ลด Padding ด้านในกล่องเหลือ p-4 บนมือถือ เพื่อไม่ให้กินพื้นที่ */}
                    <div className="p-4 sm:p-6 divide-y divide-slate-100">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center py-3.5 first:pt-0 last:pb-0 gap-3 sm:gap-4">
                                {/* รูปภาพสินค้า: บนมือถือย่อเหลือ w-14 h-14 กำลังน่ารัก ไม่โตคับจอเกินไปครับ */}
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                                    <img
                                        src={getImageUrl(item.image_url)}
                                        className="w-full h-full object-cover"
                                        alt={item.product_name}
                                    />
                                </div>
                                <div className="flex-1 min-w-0"> {/* min-w-0 ช่วยดักคำยาวไม่ให้ทะลุกรอบ */}
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{item.product_name}</h3>
                                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">จำนวน: {item.quantity} ชิ้น</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs sm:text-sm font-black text-slate-700">฿{Number(item.price).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ส่วนสรุปท้ายการ์ดราคารวม */}
                    <div className="bg-slate-50/50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-slate-600">ยอดรวมทั้งหมด:</span>
                        <span className="text-base sm:text-lg font-black text-blue-600">฿{Number(order.total_price).toLocaleString()}</span>
                    </div>

                    {/* ปุ่มยกเลิกคำสั่งซื้อ */}
                    {order.status === 'pending' && (
                        <div className='px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/30 flex justify-end items-center'>
                            {/* 📱 ปุ่มกดขยายโครงสร้างให้หนาขึ้นนิดนึงบนมือถือเพื่อเซฟนิ้วจิ้มง่าย */}
                            <button
                                className={`font-bold px-4 py-2 rounded-xl transition-all duration-300 text-xs sm:text-sm shadow-sm w-full sm:w-auto text-center
                                    ${cancelingId === order.id 
                                        ? 'bg-red-400 text-white cursor-not-allowed shadow-none' 
                                        : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-red-100'}`}
                                onClick={() => cancelOrder(order.id)}
                                disabled={cancelingId === order.id}
                            >
                                {cancelingId === order.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำสั่งซื้อ'}
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);
}