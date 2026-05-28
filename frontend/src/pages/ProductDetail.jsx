// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// ฟังก์ชันแปลงพาธรูปภาพที่เราเคยเขียนคอมเมนต์ไว้
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return new URL(`../assets/imgs/${url}`, import.meta.url).href;
};

export default function ProductDetail({ addToCart }) {
    const { id } = useParams(); // ดึง ID สินค้ามาจาก URL (เช่น /product/1)
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ยิง API ไปที่หลังบ้านพอร์ต 5000 เพื่อดึงสินค้าตาม ID
        fetch(`http://localhost:5000/api/products/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error('ไม่พบสินค้า');
                return res.json();
            })
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="text-center py-20 text-slate-500">กำลังโหลดข้อมูลสินค้า...</div>;
    if (!product) return <div className="text-center py-20 text-red-500">⚠️ ไม่พบสินค้าชิ้นนี้ในระบบ</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* ปุ่มย้อนกลับหน้าแรก */}
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                ← กลับสู่หน้าหลัก
            </Link>

            {/* ส่วนจัดวางข้อมูลสินค้าแบบ 2 คอลัมน์ด้วย Tailwind v4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                
                {/* ฝั่งซ้าย: รูปภาพสินค้า */}
                <div className="w-full">
                    {product.image_url ? (
                        <img 
                            src={getImageUrl(product.image_url)} 
                            alt={product.name} 
                            className="w-full h-auto max-h-[500px] object-cover rounded-2xl bg-slate-50 border border-slate-100"
                        />
                    ) : (
                        <div className="w-full h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                            ไม่มีรูปภาพสินค้า
                        </div>
                    )}
                </div>

                {/* ฝั่งขวา: รายละเอียดและปุ่มสั่งซื้อ */}
                <div className="flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {product.category_name || 'ทั่วไป'}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-4 leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-2xl font-black text-blue-600 mt-4">
                            ฿{Number(product.price).toLocaleString()}
                        </p>
                        
                        <hr className="my-6 border-slate-100" />
                        
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">รายละเอียดสินค้า</h3>
                        <p className="text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                            {product.description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้าชิ้นนี้'}
                        </p>
                    </div>

                    {/* ปุ่มแอคชันด้านล่าง */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => addToCart(product)}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 ease-in-out cursor-pointer text-center shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                        >
                            <span>🛒 Add to Cart</span>
                            <span>•</span>
                            <span>เพิ่มลงตะกร้า</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}