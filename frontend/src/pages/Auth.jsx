// src/pages/Auth.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // สลับสถานะหน้า Login / Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // เลือก URL ตามสถานะหน้าจอ
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }

      if (isLogin) {
        // ถ้าระบบล็อกอินสำเร็จ ให้เซฟ Token และข้อมูล User ลงเครื่อง
        localStorage.setItem('ong_shop_token', data.token);
        localStorage.setItem('ong_shop_user', JSON.stringify(data.user));
        
        // พาผู้ใช้กลับไปหน้าแรกหลังจากล็อกอินเสร็จ และสั่งรีโหลดหน้าจอเพื่ออัปเดต Navbar
        navigate('/');
        window.location.reload();
      } else {
        // ถ้าสมัครสมาชิกสำเร็จ ให้สลับไปหน้าล็อกอินเพื่อให้เขาเข้าสู่ระบบ
        alert('สมัครสมาชิกสำเร็จแล้ว! กรุณาเข้าสู่ระบบ');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-black text-slate-800 text-center mb-6">
          {isLogin ? '🔑 เข้าสู่ระบบ' : '📝 สมัครสมาชิก'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-1">อีเมล</label>
            <input 
              type="email" 
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-blue-600 bg-slate-50"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-600 block mb-1">รหัสผ่าน</label>
            <input 
              type="password" 
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-blue-600 bg-slate-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 ease-in-out cursor-pointer mt-6 shadow-md shadow-blue-100">
            {isLogin ? 'เข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
          >
            {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่'}
          </button>
        </div>
      </div>
    </div>
  );
}