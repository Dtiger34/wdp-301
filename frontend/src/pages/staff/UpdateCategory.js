import React, { useEffect, useState } from 'react';
import { getCategory, updateCategory } from '../../services/categoryService';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const UpdateCategory = () => {
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const categoryId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCategory(categoryId);
        setForm({ name: data.name, description: data.description || '' });
      } catch (err) {
        console.error(err);
        alert('Không thể tải dữ liệu thể loại!');
      }
    };
    fetchData();
  }, [categoryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(categoryId, form);
      alert('Cập nhật thể loại thành công!');
      navigate('/staff/ViewCategoryList');
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại!');
    }
  };

  return (
    <>
      <Header />

      {/* Nút quay lại */}
      <div style={{ position: 'absolute', top: '140px', left: '30px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: '#6c757d',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Quay lại
        </button>
      </div>

      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '24px',
          background: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '10px',
        }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Cập nhật thể loại</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Tên thể loại</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                padding: '8px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              style={{
                padding: '8px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                minHeight: '100px',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 18px',
              fontSize: '16px',
              backgroundColor: '#1d72c2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Lưu thay đổi
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default UpdateCategory;
