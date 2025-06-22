// ✅ AddCategory.js
import React, { useState } from 'react';
import { addCategory } from '../../services/categoryService';
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCategory(form);
      alert('Thêm thể loại thành công!');
      navigate('/staff/ViewCategoryList');
    } catch (err) {
      console.error(err);
      alert('Thêm thể loại thất bại!');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Thêm thể loại</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Tên thể loại</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ padding: '8px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{ padding: '8px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '100px', resize: 'vertical' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 18px', fontSize: '16px', backgroundColor: '#1d72c2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Thêm thể loại
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
