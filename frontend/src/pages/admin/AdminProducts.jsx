// src/pages/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    return new URL(`../../assets/imgs/${url}`, import.meta.url).href;
};

    // 1. ดึงรายการสินค้าทั้งหมดจากหลังบ้านมาโชว์ในตาราง
    const fetchProducts = async () => {
        try {
            setLoading(true);
            // 🚨 ปรับ URL ตรงนี้ให้ตรงกับพิกัดดึงสินค้าทั้งหมดของน้านะครับ (เช่น /api/products/get หรือ /api/products)
            const res = await fetch(`${API_URL}/api/products/getproducts`); 
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'admin') {
            alert('❌ ไม่มีสิทธิ์เข้าถึงหน้านี้');
            navigate('.././'); // เด้งลูกค้าทั่วไปกลับหน้าแรกทันที
        } else {
            fetchProducts();
        }
    }, []);

    // 2. ฟังก์ชันสำหรับกดลบสินค้า
    const handleDelete = async (id, name) => {
        if (!window.confirm(`คุณน้าแน่ใจใช่ไหมครับที่จะลบสินค้า: "${name}" ?`)) return;

        try {
            const token = localStorage.getItem('ong_shop_token');
            // 🚨 ปรับ URL ยิงไปลบสินค้าตามของหลังบ้านน้า เช่น /api/products/delete/${id}
            const res = await fetch(`${API_URL}/api/products/delete-products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (res.ok) {
                alert('🗑️ ลบสินค้าเรียบร้อยแล้วครับ!');
                fetchProducts(); // โหลดข้อมูลในตารางใหม่ทันทีหลังลบสำเร็จ
            } else {
                const data = await res.json();
                alert(data.message || 'เกิดข้อผิดพลาดในการลบ');
            }
        } catch (error) {
            alert('ไม่สามารถลบสินค้าได้: ' + error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* ส่วนหัวของหน้าจอ */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">📦 ระบบจัดการสินค้า (Admin)</h1>
                    <p className="text-sm text-slate-500 mt-1">ดูรายการสินค้า แก้ไข และลบข้อมูลสินค้าในร้าน</p>
                </div>
                {/* ปุ่มกดลิงก์วิ่งไปหน้าเพิ่มสินค้าที่น้าทำไว้แล้ว */}
                <Link 
                    to="/add-product" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                    ➕ เพิ่มสินค้าใหม่
                </Link>
            </div>

            {/* ส่วนตารางแสดงข้อมูล */}
            {loading ? (
                <div className="text-center py-12 text-slate-500 font-medium">กำลังโหลดรายการสินค้าของน้าอง...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-slate-500">
                    ยังไม่มีสินค้าในระบบเลยครับน้า กดปุ่ม "เพิ่มสินค้าใหม่" ด้านบนได้เลย!
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold">
                                    <th className="p-4 w-24 text-center">รูปภาพ</th>
                                    <th className="p-4">ชื่อสินค้า</th>
                                    <th className="p-4">หมวดหมู่</th>
                                    <th className="p-4 text-right">ราคา</th>
                                    <th className="p-4 text-center">คงเหลือในคลัง</th>
                                    <th className="p-4 text-center w-40">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                                {products.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* รูปภาพสินค้าดึงจาก Path ใหม่ที่เราเพิ่งจัดระเบียบกัน */}
                                        <td className="p-4 flex justify-center">
                                            <img 
                                                src={getImageUrl(item.image_url)}
                                                alt={item.name} 
                                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-100"
                                                onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }} // กันเหนียวถ้ารูปไหนพัง
                                            />
                                        </td>
                                        <td className="p-4 font-semibold text-slate-800">
                                            <div>{item.name}</div>
                                            <div className="text-xs text-slate-400 font-normal line-clamp-1">{item.description || 'ไม่มีรายละเอียด'}</div>
                                        </td>
                                        <td className="p-4 ">
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap">
                                                {item.category_name || item.category_id || 'ทั่วไป'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-900">
                                            ฿{Number(item.price).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold ${item.stock === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                                                {item.stock} ชิ้น
                                            </span>
                                        </td>
                                        {/* ปุ่มแก้ไข และ ปุ่มลบ */}
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link 
                                                    to={`/admin/product-edit/${item.id}`}
                                                    className="border border-slate-200 hover:border-blue-600 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs bg-white"
                                                >
                                                    📝 แก้ไข
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors font-medium text-xs"
                                                >
                                                    🗑️ ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}