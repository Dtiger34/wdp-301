import React, { useState } from 'react';
import { addBookshelf } from '../../services/bookShelfService';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AddBookshelf = () => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Xóa lỗi khi người dùng đang sửa
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = 'Vui lòng nhập mã kệ sách.';
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập tên kệ sách.';
    if (!form.location.trim()) newErrors.location = 'Vui lòng nhập vị trí kệ sách.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await addBookshelf(form);
      alert('Thêm kệ sách thành công!');
      navigate('/staff/bookshelf');
    } catch (err) {
      console.error(err);
      alert('Thêm kệ sách thất bại!');
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
          marginTop: '100px',
          marginBottom: '100px',
        }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Thêm kệ sách mới</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {[{ label: 'Mã kệ sách', name: 'code' }, { label: 'Tên kệ sách', name: 'name' }, { label: 'Vị trí', name: 'location' }].map((field) => (
            <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                style={{
                  padding: '8px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: errors[field.name] ? '1px solid #ef4444' : '1px solid #ccc',
                }}
              />
              {errors[field.name] && (
                <span style={{ color: '#ef4444', marginTop: '4px', fontSize: '13px' }}>
                  {errors[field.name]}
                </span>
              )}
            </div>
          ))}

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
            Thêm kệ sách
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default AddBookshelf;