// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
                const response = await fetch('http://localhost:5000/api/auth/profile', {
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
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-8">👤 โปรไฟล์ส่วนตัว</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 💳 ฝั่งซ้าย: การ์ดสรุปโปรไฟล์ย่อ */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center h-fit">
                    {/* รูปโปรไฟล์จำลอง (สี่เหลี่ยมจัตุรัสจัดด้วย Tailwind ให้มนกลมพอดี) */}
                    <div className="w-24 h-24 aspect-square rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 mb-4">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 break-all">{user?.email}</h2>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase
                        ${user?.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                        ระดับผู้ใช้: {user?.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกทั่วไป'}
                    </span>

                    <hr className="w-full border-slate-100 my-6" />

                    {/* เมนูลัดลิงก์ไปหน้าประวัติคำสั่งซื้อ */}
                    <button 
                        onClick={() => navigate('/order-history')}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm border border-slate-200 mb-3"
                    >
                        📦 ดูประวัติคำสั่งซื้อของฉัน
                    </button>

                    {/* ปุ่มออกจากระบบสีแดง */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 text-sm border border-red-200"
                    >
                        🚪 ออกจากระบบ
                    </button>
                </div>

                {/* 📝 ฝั่งขวา: รายละเอียดข้อมูลและแบบฟอร์ม */}
                <div className="md:grid md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">ข้อมูลบัญชี</h3>
                        <p className="text-sm text-slate-500">ข้อมูลส่วนตัวของคุณที่เชื่อมต่ออยู่กับร้านค้า Ong Shop</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">รหัสผู้ใช้งาน (User ID)</label>
                            <input 
                                type="text" 
                                value={`#USER-${user?.id}`} 
                                disabled 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">สิทธิ์การใช้งาน</label>
                            <input 
                                type="text" 
                                value={user?.role === 'admin' ? 'Administrator' : 'General Customer'} 
                                disabled 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed capitalize"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">ที่อยู่อีเมล (Email Address)</label>
                            <input 
                                type="email" 
                                value={user?.email || ''} 
                                disabled 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl text-xs text-slate-500 flex gap-2">
                        <span>💡</span>
                        <span>หากต้องการเปลี่ยนรหัสผ่าน หรือแก้ไขข้อมูลอีเมล กรุณาติดต่อผู้ดูแลระบบของทางร้านเพื่อดำเนินการความปลอดภัยส่วนบุคคล</span>
                    </div>
                </div>
            </div>
        </div>
    );
}