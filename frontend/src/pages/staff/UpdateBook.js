import React, { useEffect, useState } from 'react';
import { getBook, updateBook } from '../../services/bookService';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    publishYear: '',
    description: '',
    price: '',
    image: '',
    imageFile: null,
    imagePreview: '',
    categories: [],
    bookshelf: '',
  });

  const [categories, setCategories] = useState([]);
  const [bookshelves, setBookshelves] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, catRes, shelfRes] = await Promise.all([
          getBook(id),
          api.get('/categories'),
          api.get('/bookshelves'),
        ]);

        const book = bookRes;
        setForm({
          ...book,
          publishYear: book.publishYear || '',
          price: book.price || '',
          bookshelf: book.bookshelf?._id || '',
          categories: book.categories?.map((c) => c._id) || [],
          imagePreview: book.image || '',
        });

        setCategories(catRes.data);
        setBookshelves(shelfRes.data);
      } catch (err) {
        console.error('Load failed:', err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckbox = (categoryId) => {
    setForm((prev) => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories: newCategories };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBook(id, {
        ...form,
        image: form.imagePreview,
        publishYear: parseInt(form.publishYear),
        price: parseFloat(form.price),
      });
      alert('Cập nhật thành công!');
      navigate('/staff/view-books');
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại!');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Cập nhật sách</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[{ name: 'title', label: 'Tiêu đề' }, { name: 'isbn', label: 'ISBN' }, { name: 'author', label: 'Tác giả' }, { name: 'publisher', label: 'Nhà xuất bản' }, { name: 'publishYear', label: 'Năm xuất bản', type: 'number' }, { name: 'price', label: 'Giá tiền', type: 'number' }].map((field) => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>{field.label}</label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              style={{ padding: '8px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
              required
            />
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Ảnh bìa sách (chọn tệp từ máy)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {form.imagePreview && <img src={form.imagePreview} alt="Preview" style={{ marginTop: '10px', width: '120px', height: '160px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }} />}
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

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Thể loại</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {categories.map((cat) => (
              <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={form.categories.includes(cat._id)}
                  onChange={() => handleCheckbox(cat._id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Kệ sách</label>
          <select
            name="bookshelf"
            value={form.bookshelf}
            onChange={handleChange}
            required
            style={{ padding: '8px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">-- Chọn kệ sách --</option>
            {bookshelves.map((shelf) => (
              <option key={shelf._id} value={shelf._id}>
                {shelf.name} ({shelf.code})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" style={{ padding: '10px 18px', fontSize: '16px', backgroundColor: '#1d72c2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
};

export default UpdateBook;
