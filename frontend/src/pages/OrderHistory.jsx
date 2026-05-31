// src/pages/OrderHistory.jsx
import React, { useEffect, useState } from 'react';

// ฟังก์ชันแปลงพาธรูปภาพที่คุณเขียนไว้
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return new URL(`../assets/imgs/${url}`, import.meta.url).href;
};

export default function OrderHistory() {
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

                const response = await fetch('http://localhost:5000/api/orders/my-orders', {
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

            const response = await fetch(`http://localhost:5000/api/orders/${id}/cancel`, {
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
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">📦 ประวัติคำสั่งซื้อของฉัน</h1>
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {/* Header ของแต่ละคำสั่งซื้อ */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                            <div>
                                <p className="text-xs text-slate-500">เลขที่คำสั่งซื้อ</p>
                                <p className="text-sm font-semibold text-slate-700">#ORD-{order.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">วันที่สั่งซื้อ</p>
                                <p className="text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString('th-TH')}</p>
                            </div>
                            <div>
                                {/* เพิ่มการแสดงผลสีสถานะยกเลิก 'cancelled' ให้สวยงาม */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                                    ${order.status === 'success' ? 'bg-green-100 text-green-800' : 
                                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'}`}>
                                    {order.status === 'success' ? 'สำเร็จ' : order.status === 'pending' ? 'รอการจัดส่ง' : 'ยกเลิกแล้ว'}
                                </span>
                            </div>
                        </div>

                        {/* รายการสินค้าข้างในคำสั่งซื้อนั้นๆ */}
                        <div className="p-6 divide-y divide-slate-100">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center py-4 first:pt-0 last:pb-0 gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                        <img
                                            src={getImageUrl(item.image_url)}
                                            className="w-full h-full object-cover"
                                            alt={item.product_name}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-slate-800 line-clamp-1">{item.product_name}</h3>
                                        <p className="text-xs text-slate-500">จำนวน: {item.quantity} ชิ้น</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-700">฿{Number(item.price).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ส่วนสรุปท้ายการ์ด */}
                        <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-sm text-slate-600">ยอดรวมทั้งหมด:</span>
                            <span className="text-lg font-bold text-blue-600">฿{Number(order.total_price).toLocaleString()}</span>
                        </div>

                        {/* ปุ่มยกเลิก (แสดงเฉพาะเมื่อสถานะเป็น pending เท่านั้น) */}
                        {order.status === 'pending' && (
                            <div className='px-6 py-3 border-t border-slate-100 bg-slate-50/30 flex justify-end items-center'>
                                <button
                                    className={`font-medium px-4 py-2 rounded-xl transition-all duration-300 text-sm shadow-sm 
                                        ${cancelingId === order.id 
                                            ? 'bg-red-400 text-white cursor-not-allowed' 
                                            : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-red-100'}`}
                                    onClick={() => cancelOrder(order.id)}
                                    disabled={cancelingId === order.id} // บล็อกปุ่มระหว่างยิง API
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