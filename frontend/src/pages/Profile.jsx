// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 1. ดึง Token ออกมาจาก localStorage
                const token = localStorage.getItem('ong_shop_token');
                
                if (!token) {
                    setError('กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้');
                    setLoading(false);
                    // ถ้าไม่มี Token ให้เตะกลับไปหน้า login ภายใน 2 วินาที
                    setTimeout(() => navigate('/auth'), 2000);
                    return;
                }

                // 2. ยิง API ไปหาหลังบ้านที่เส้นโปรไฟล์ โดยแนบ Token ไปใน Headers
                const response = await fetch(`${API_URL}/api/auth/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // ถ้า Token หมดอายุ หรือไม่ถูกต้อง ให้ลบ Token ออกแล้วเตะไปหน้า Login
                    localStorage.removeItem('ong_shop_token');
                    throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
                }

                const data = await response.json();
                setUser(data); // เก็บข้อมูลผู้ใช้ลงใน State
            } catch (err) {
                setError(err.message);
                setTimeout(() => navigate('/auth'), 2500);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // ฟังก์ชันสำหรับกด ออกจากระบบ
    const handleLogout = () => {
        if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            localStorage.removeItem('ong_shop_token'); // ลบ Token ทิ้ง
            navigate('/auth'); // พากลับไปหน้า Login
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</div>;
    if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;

    return (
    // 📱 ปรับระยะขอบรอบทิศทาง (px-3 บนมือถือ / px-4 จอใหญ่) ให้ไม่บีบตัวจนเกินไป
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-12 animate-fadeIn">
        {/* หัวข้อ: ปรับขนาดฟอนต์ให้เข้ากับหน้าจอ (text-2xl บนมือถือ / text-3xl จอมอนิเตอร์) */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6 sm:mb-8">👤 โปรไฟล์ส่วนตัว</h1>

        {/* 📱 ตัว Grid ครอบ: บนมือถือดิ่งลงแถวเดี่ยว (gap-6) / บนคอมกางแยก 3 คอลัมน์ (gap-8) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* 💳 ฝั่งซ้าย: การ์ดสรุปโปรไฟล์ย่อ */}
            {/* 📱 ปรับ p-5 บนมือถือเพื่อลดความหนาของการ์ดเวลาขึ้นไปอยู่ท่อนบน */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col items-center text-center h-fit">
                {/* รูปโปรไฟล์จำลอง: ย่อขนาดลงมานิดนึงบนมือถือ (w-20 h-20) จะดูไม่ตะโกนเกินไปครับน้า */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full bg-blue-100 flex items-center justify-center text-2xl sm:text-3xl font-bold text-blue-600 mb-3 sm:mb-4">
                    {user?.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 break-all px-2">{user?.email}</h2>
                
                <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide uppercase
                        ${user?.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                        ระดับผู้ใช้: {user?.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกทั่วไป'}
                    </span>
                </div>

                <hr className="w-full border-slate-100 my-5 sm:my-6" />

                {/* เมนูลัด และ ปุ่มออกจากระบบ: ปรับ py-3 ให้หนาขึ้นนิดนึงบนมือถือ เพื่อให้กดถนัดเต็มนิ้วโป้ง */}
                <div className="w-full space-y-2.5">
                    <button 
                        onClick={() => navigate('/order-history')}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 sm:py-2.5 px-4 rounded-xl transition-all duration-200 text-xs sm:text-sm border border-slate-200 cursor-pointer"
                    >
                        📦 ดูประวัติคำสั่งซื้อของฉัน
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 sm:py-2.5 px-4 rounded-xl transition-all duration-200 text-xs sm:text-sm border border-red-200 cursor-pointer"
                    >
                        🚪 ออกจากระบบ
                    </button>
                </div>
            </div>

            {/* 📝 ฝั่งขวา: รายละเอียดข้อมูลและแบบฟอร์ม */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 sm:space-y-6">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">ข้อมูลบัญชี</h3>
                    <p className="text-xs sm:text-sm text-slate-400">ข้อมูลส่วนตัวของคุณที่เชื่อมต่ออยู่กับร้านค้า Ong Shop</p>
                </div>

                {/* 📱 ท่อนกล่องรับข้อมูล: บนมือถือสับเป็น 1 คอลัมน์ / บนคอมกางแยก 2 คอลัมน์ซ้ายขวาด้วย sm:grid-cols-2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">รหัสผู้ใช้งาน (User ID)</label>
                        <input 
                            type="text" 
                            value={`#USER-${user?.id}`} 
                            disabled 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-500 cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">สิทธิ์การใช้งาน</label>
                        <input 
                            type="text" 
                            value={user?.role === 'admin' ? 'Administrator' : 'General Customer'} 
                            disabled 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed capitalize focus:outline-none"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">ที่อยู่อีเมล (Email Address)</label>
                        <input 
                            type="email" 
                            value={user?.email || ''} 
                            disabled 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed focus:outline-none"
                        />
                    </div>
                </div>

                {/* กล่องข้อความแจ้งเตือนด้านล่าง (ล้างคำสั่งที่ซ้อนกันออก เพื่อไม่ให้ดีไซน์เบี้ยวบนจอเล็ก) */}
                <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl text-[11px] sm:text-xs text-amber-700/90 flex gap-2.5 leading-relaxed">
                    <span className="shrink-0 text-sm">💡</span>
                    <span>หากต้องการเปลี่ยนรหัสผ่าน หรือแก้ไขข้อมูลอีเมล กรุณาติดต่อผู้ดูแลระบบของทางร้านเพื่อดำเนินการตรวจสอบความปลอดภัยส่วนบุคคล</span>
                </div>
            </div>
            
        </div>
    </div>
);
}