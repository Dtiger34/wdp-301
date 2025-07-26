import React, { useEffect, useState } from 'react';
import { getBookshelf, updateBookshelf } from '../../services/bookShelfService';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const UpdateBookshelf = () => {
  const [form, setForm] = useState({ code: '', name: '', description: '', location: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBookshelf(id);
        setForm({
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          location: data.location || ''
        });
      } catch (err) {
        console.error(err);
        alert('Không thể tải dữ liệu kệ sách!');
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.code.trim()) newErrors.code = 'Mã kệ sách không được để trống';
    if (!form.name.trim()) newErrors.name = 'Tên kệ sách không được để trống';
    if (!form.location.trim()) newErrors.location = 'Vị trí không được để trống';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateBookshelf(id, form);
      alert('Cập nhật kệ sách thành công!');
      navigate('/staff/bookshelf');
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại!');
    }
  };

  return (
    <>
      <Header />

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

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '10px', marginTop: '100px', marginBottom: '100px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Cập nhật kệ sách</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[{ label: 'Mã kệ sách', name: 'code' }, { label: 'Tên kệ sách', name: 'name' }, { label: 'Vị trí', name: 'location' }].map((field) => (
            <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                style={{ padding: '8px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              {errors[field.name] && (
                <span style={{ color: 'red', marginTop: '4px' }}>{errors[field.name]}</span>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              style={{ padding: '8px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '100px', resize: 'vertical' }}
            />
            {errors.description && (
              <span style={{ color: 'red', marginTop: '4px' }}>{errors.description}</span>
            )}
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
              cursor: 'pointer'
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

export default UpdateBookshelf;
