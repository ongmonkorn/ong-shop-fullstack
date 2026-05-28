// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Helper function to resolve dynamic image paths in Vite
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    return new URL(`../assets/imgs/${url}`, import.meta.url).href;
};

export default function ProductCard({ product, addToCart }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                {product.image_url ? (
                    <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-60 object-cover rounded-xl mb-4 bg-slate-50"
                    />
                ) : (
                    <div className="w-full h-60 bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-slate-400">
                        ไม่มีรูปภาพ
                    </div>
                )}
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                    {product.category_name || 'ทั่วไป'}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2 line-clamp-1">{product.name}</h3>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{product.description}</p>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <span className="text-xl font-black text-slate-900">฿{Number(product.price).toLocaleString()}</span>
                <div className="flex gap-2">
                    {/* ปุ่มรอง (Secondary): ดูสินค้า - เป็นแบบ Outline โทนสีเทา/น้ำเงิน ไม่แย่งซีน */}
                    <Link to={`/product/${product.id}`}> {/* 💡 1. ใช้แท็ก Link ครอบปุ่มดูสินค้า และระบุปลายทางเป็น /product/ตามด้วย id สินค้า */}
                        <button className="bg-white text-slate-600 border border-slate-200 hover:border-blue-600 hover:text-blue-600 font-medium px-4 py-2 rounded-xl transition-all duration-300 ease-in-out cursor-pointer text-sm">
                            ดูสินค้า
                        </button>
                    </Link>

                    {/* ปุ่มหลัก (Primary): เพิ่มลงตะกร้า - ถมสีน้ำเงินเต็มๆ เพื่อเรียกร้องให้กด */}
                    <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 font-medium px-4 py-2 rounded-xl transition-all duration-300 ease-in-out cursor-pointer text-sm shadow-sm shadow-blue-100"
                    >
                        เพิ่มลงตะกร้า
                    </button>
                </div>
            </div>
        </div>
    );
}