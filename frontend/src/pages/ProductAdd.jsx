// src/pages/ProductAdd.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ProductAdd() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null); // สำหรับโชว์รูปตัวอย่าง
    const [imageFile, setImageFile] = useState(null);       // 🚨 เก็บไฟล์รูปดิบเพื่อส่งไปหลังบ้าน
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/api/categories/get`);
                const data = await res.json();
                if (res.ok) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // 🚨 เปลี่ยนมาเก็บไฟล์จริง และสร้าง URL จำลองสำหรับพรีวิว
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file); // เก็บไฟล์ดิบเข้า State
        setImagePreview(URL.createObjectURL(file)); // สร้าง temporary URL สำหรับแสดงภาพตัวอย่าง
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.price || !form.category_id || !imageFile) {
            alert('กรุณากรอกข้อมูลและเลือกรูปภาพให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('ong_shop_token');

            // 🚨 เปลี่ยนมาใช้ FormData สำหรับส่งไฟล์พ่วงข้อมูล
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('price', Number(form.price));
            formData.append('stock', Number(form.stock));
            formData.append('category_id', Number(form.category_id));
            formData.append('image', imageFile); // 'image' ต้องชื่อตรงกับที่ multer ฝั่งหลังบ้านรอรับ

            const response = await fetch(`${API_URL}/api/products/add-products`, {
                method: 'POST',
                headers: {
                    // ⚠️ ห้ามใส่ 'Content-Type': 'application/json' เด็ดขาด เบราว์เซอร์จะจัดการ Boundary ให้เองเมื่อใช้ FormData
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData // ส่งก้อน FormData ไปแทน
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');

            alert('➕ เพิ่มสินค้าและบันทึกรูปภาพเรียบร้อย!');
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='max-w-4xl mx-auto px-4 py-12'>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                ← กลับสู่หน้าหลัก
            </Link>

            <div className='bg-white p-8 rounded-3xl border border-slate-200 shadow-sm'>
                <h2 className="text-3xl font-black text-slate-800 text-center mb-6">➕ เพิ่มสินค้าใหม่</h2>

                <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="name">ชื่อสินค้า *</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50" required />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="description">รายละเอียด</label>
                        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50" />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="price">ราคา *</label>
                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50" required />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="stock">สต็อก *</label>
                        <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50" required />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="category" className="text-sm font-semibold text-slate-700">หมวดหมู่ *</label>
                        <select
                            id="category"
                            value={form.category_id}
                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-blue-600 text-slate-800"
                            required
                        >
                            <option value="">-- เลือกหมวดหมู่ --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label htmlFor="image_file" className="text-sm font-semibold text-slate-700">รูปภาพสินค้า *</label>
                        <input
                            type="file"
                            id="image_file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 bg-slate-50 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {imagePreview && (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-2 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <span className="text-xs text-slate-500">รูปตัวอย่างสินค้า:</span>
                            <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-sm border border-white" />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`col-span-2 w-full text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 text-center shadow-lg flex items-center justify-center gap-2
                            ${loading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-blue-100'}`}
                    >
                        {loading ? 'กำลังบันทึกและอัปโหลดสินค้า...' : '➕ ยืนยันเพิ่มสินค้า'}
                    </button>
                </form>
            </div>
        </div>
    );
}