// src/pages/ProductEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';

export default function ProductEdit() {
    const { id } = useParams(); // 🚨 ดึงค่า ID สินค้าจาก URL (เช่น /product-edit/:id)
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // สถานะรูปภาพ
    const [imagePreview, setImagePreview] = useState(null); // สำหรับโชว์รูปเดิม หรือรูปใหม่ที่เพิ่งเลือก
    const [imageFile, setImageFile] = useState(null);       // เก็บไฟล์ดิบกรณีเลือกรูปใหม่
    const [oldImageName, setOldImageName] = useState('');   // จำชื่อรูปเดิมไว้กรณีผู้ใช้ไม่เปลี่ยนรูป

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const catRes = await fetch(`${API_URL}/api/categories/get`);
                const catData = await catRes.json();
                if (catRes.ok) setCategories(catData);

                const prodRes = await fetch(`${API_URL}/api/products/${id}`);
                const prodData = await prodRes.json();

                if (prodRes.ok) {
                    setForm({
                        name: prodData.name || '',
                        description: prodData.description || '',
                        price: prodData.price || '',
                        stock: prodData.stock || '',
                        category_id: prodData.category_id || ''
                    });

                    // ⚡ 1. บันทึกลิงก์รูปภาพตัวเต็มเดิมไว้ค้ำประกันกรณีแอดมินไม่ยอมเปลี่ยนรูป
                    setOldImageName(prodData.image_url || '');

                    // ⚡ 2. 🛠️ แก้ไขจุดนี้: เพราะใน Neon เก็บลิงก์ยาวของ Cloudflare แล้ว 
                    // น้าสั่งโยนลิงก์ url ตัวเต็มเข้าไปแสดงผลในพรีวิวตรงๆ ได้เลยครับ ไม่ต้องงมหาโฟลเดอร์ในคอมแล้วครับน้า!
                    if (prodData.image_url) {
                        setImagePreview(prodData.image_url);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
            }
        };

        const role = localStorage.getItem('user_role');
        if (role !== 'admin') {
            alert('❌ ไม่มีสิทธิ์เข้าถึงหน้านี้');
            navigate('../../');
        } else {
            fetchInitialData();
        }
    }, [id]);



    // 2. จัดการเวลาคนกดเลือกเปลี่ยนรูปภาพใหม่
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file); // เก็บไฟล์ภาพใหม่ลง State
        setImagePreview(URL.createObjectURL(file)); // อัปเดตรูปพรีวิวให้เห็นเป็นรูปใหม่ทันที
    };

    // 3. ฟังก์ชันกดยืนยันส่งข้อมูลไปแก้ไขที่หลังบ้าน
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.price || !form.category_id) {
            alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('ong_shop_token');
            const formData = new FormData();

            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('price', Number(form.price));
            formData.append('stock', Number(form.stock));
            formData.append('category_id', Number(form.category_id));

            // 1. ส่งลิงก์รูปภาพเดิมไปให้หลังบ้านรับรู้เสมอ (ห้ามใส่ไว้ใน else)
            formData.append('old_image', oldImageName || '');

            // 2. ถ้าแอดมินมีการเลือกไฟล์ภาพใหม่ ค่อยแนบไฟล์ภาพใหม่เพิ่มเข้าไปแยกอีกฟิลด์หนึ่ง
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // 🚨 ยิง PUT หรือ POST ไปอัปเดตตามที่หลังบ้านน้าออกแบบไว้ (แนะนำส่งพ่วงเลข ID ไปด้วยครับ)
            const response = await fetch(`${API_URL}/api/products/update-products/${id}`, {
                method: 'PUT', // หรือ 'POST' ตามหลังบ้านน้าเลยครับ
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'เกิดข้อผิดพลาดในการแก้ไข');

            alert('✏️ แก้ไขข้อมูลสินค้าเรียบร้อยแล้วครับน้า!');
            navigate('/admin/products'); // แก้เสร็จให้ดีดกลับไปหน้าตารางรวมสินค้าแอดมินทันที
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='max-w-4xl mx-auto px-4 py-12'>
            <Link to="/admin/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                ← กลับสู่ระบบจัดการสินค้า
            </Link>

            <div className='bg-white p-8 rounded-3xl border border-slate-200 shadow-sm'>
                <h2 className="text-3xl font-black text-slate-800 text-center mb-6">✏️ แก้ไขข้อมูลสินค้า</h2>

                <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="name" className="text-sm font-semibold text-slate-700">ชื่อสินค้า *</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-blue-600" required />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="description" className="text-sm font-semibold text-slate-700">รายละเอียด</label>
                        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-blue-600" />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="price" className="text-sm font-semibold text-slate-700">ราคา *</label>
                        <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-blue-600" required />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="stock" className="text-sm font-semibold text-slate-700">สต็อก *</label>
                        <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-blue-600" required />
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
                        <label htmlFor="image_file" className="text-sm font-semibold text-slate-700">เปลี่ยนรูปภาพสินค้า (ปล่อยว่างได้ถ้าไม่เปลี่ยน)</label>
                        <input
                            type="file"
                            id="image_file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-600 bg-slate-50 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {/* กล่องโชว์พรีวิวรูปภาพ (ถ้ามีข้อมูลจะดึงรูปเก่ามาแปะรอไว้ก่อนทันที) */}
                    {imagePreview && (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center gap-2 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <span className="text-xs text-slate-500">รูปภาพปัจจุบันของสินค้า:</span>
                            <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-sm border border-white" />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`col-span-2 w-full text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 text-center shadow-lg flex items-center justify-center gap-2
                            ${loading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-blue-100'}`}
                    >
                        {loading ? 'กำลังบันทึกข้อมูลแก้ไข...' : '✏️ ยืนยันแก้ไขสินค้า'}
                    </button>
                </form>
            </div>
        </div>
    );
}