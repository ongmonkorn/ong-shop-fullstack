// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';


export default function ProductCard({ product, addToCart }) {
    return (
    // ตัวการ์ด: ปรับ Padding (p-4 บนมือถือ / p-5 บนคอม) เพื่อไม่ให้บีบพื้นที่ด้านในเกินไป
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow h-full hover:bg-blue-100">
        <div>
            {/* รูปภาพสินค้า: บนมือถือลดความสูงเหลือ h-40 เพื่อความสมดุล / บนคอมขยายเป็น h-48 */}
            <img
                src={product.image_url || 'https://placehold.co/300x300?text=No+Image'}
                alt={product.name}
                className="w-full h-40 sm:h-48 object-cover rounded-xl"
            />
            {/* ป้ายหมวดหมู่: บังคับบล็อกให้อยู่ในแถวของตัวเอง (inline-block) */}
            <div className="mt-3">
                <span className="text-[10px] sm:text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full inline-block">
                    {product.category_name || 'ทั่วไป'}
                </span>
            </div>
            {/* ชื่อสินค้าและรายละเอียด: ขนาดฟอนต์จะยืดหยุ่นตามหน้าจอ */}
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-2 line-clamp-1">{product.name}</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 line-clamp-2 min-h-[32px] sm:min-h-[40px]">{product.description}</p>
        </div>

        {/* 📱 ท่อนราคารวมและปุ่มกด: บนมือถือ (ต่ำกว่า sm) จะหักตัวเป็นแนวตั้ง (flex-col) / จอใหญ่จะเป็นแนวนอน (sm:flex-row) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 gap-3 sm:gap-2">
            {/* ราคาสินค้า: บนมือถือจะอยู่ด้านบนปุ่ม หรือจัดชิดซ้าย */}
            <span className="text-lg sm:text-xl font-black text-slate-900">฿{Number(product.price).toLocaleString()}</span>
            
            {/* 📱 กล่องรวมปุ่ม: บนมือถือขยายเต็มความกว้าง (w-full) และใช้คำสั่ง grid-cols-2 แบ่งปุ่มคนละครึ่งเท่ากันเป๊ะ ไม่แย่งซีนกัน */}
            <div className="flex sm:flex-row w-full sm:w-auto grid grid-cols-2 sm:flex gap-2">
                {/* ปุ่มรอง: ดูสินค้า */}
                <Link to={`/product/${product.id}`} className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 hover:border-blue-600 hover:text-blue-600 font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ease-in-out cursor-pointer text-xs sm:text-sm text-center">
                        ดูสินค้า
                    </button>
                </Link>

                {/* ปุ่มหลัก: เพิ่มลงตะกร้า */}
                <button
                    onClick={() => addToCart(product)}
                    className="w-full sm:w-auto bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 font-medium px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 ease-in-out cursor-pointer text-xs sm:text-sm shadow-sm shadow-blue-100 text-center"
                >
                    เพิ่มลงตะกร้า
                </button>
            </div>
        </div>
    </div>
);
}