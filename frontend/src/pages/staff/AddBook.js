import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

const AddBook = () => {
  const [form, setForm] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    publishYear: '',
    description: '',
    price: '',
    imageFile: null,
    imagePreview: '',
    categories: [],
    bookshelf: '',
    quantity: 1,
  });

  const [formError, setFormError] = useState({});
  const [categories, setCategories] = useState([]);
  const [bookshelves, setBookshelves] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/categories');
        const shelfRes = await api.get('/bookshelves');
        setCategories(catRes.data);
        setBookshelves(shelfRes.data);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        alert('Không thể tải thể loại hoặc kệ sách.');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError({ ...formError, [name]: '' });
  };

  const handleCheckbox = (categoryId) => {
    setForm((prev) => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];
      return { ...prev, categories: newCategories };
    });
    setFormError({ ...formError, categories: '' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
      setFormError({ ...formError, imageFile: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const currentYear = new Date().getFullYear();
    const isPositiveNumber = (val) => /^[1-9]\d*$/.test(val);

    if (!form.title.trim()) errors.title = 'Vui lòng nhập tiêu đề';
    if (!form.isbn.trim()) errors.isbn = 'Vui lòng nhập ISBN';
    if (!form.author.trim()) errors.author = 'Vui lòng nhập tác giả';
    if (!form.publisher.trim()) errors.publisher = 'Vui lòng nhập nhà xuất bản';

    if (!form.publishYear) {
      errors.publishYear = 'Vui lòng nhập năm xuất bản';
    } else if (!isPositiveNumber(form.publishYear)) {
      errors.publishYear = 'Năm xuất bản phải là số nguyên dương';
    } else if (parseInt(form.publishYear) > currentYear) {
      errors.publishYear = `Năm xuất bản không được lớn hơn ${currentYear}`;
    }

    if (!form.description.trim()) errors.description = 'Vui lòng nhập mô tả';

    if (!form.price) {
      errors.price = 'Vui lòng nhập giá tiền';
    } else if (!isPositiveNumber(form.price)) {
      errors.price = 'Giá tiền phải là số dương';
    }

    if (!form.quantity) {
      errors.quantity = 'Vui lòng nhập số lượng';
    } else if (!isPositiveNumber(form.quantity)) {
      errors.quantity = 'Số lượng phải là số dương';
    }

    if (!form.bookshelf) errors.bookshelf = 'Vui lòng chọn kệ sách';
    if (!form.imageFile) errors.imageFile = 'Vui lòng chọn ảnh bìa';
    if (form.categories.length === 0) errors.categories = 'Vui lòng chọn ít nhất một thể loại';

    setFormError(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('isbn', form.isbn);
      formData.append('author', form.author);
      formData.append('publisher', form.publisher);
      formData.append('publishYear', form.publishYear);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('bookshelf', form.bookshelf);
      formData.append('quantity', form.quantity);
      formData.append('image', form.imageFile);
      form.categories.forEach((cat) => {
        formData.append('categories', cat);
      });

      await api.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Thêm sách thành công!');
      navigate('/staff/view-books');
    } catch (err) {
      if (err.response && err.response.data) {
        const serverMessage = err.response.data.message;

        // Nếu lỗi liên quan đến ISBN
        if (serverMessage.includes('ISBN')) {
          setFormError((prev) => ({
            ...prev,
            isbn: serverMessage,
          }));
        } else {
          alert(serverMessage || 'Thêm sách thất bại!');
        }

        console.error('Lỗi từ server:', err.response.data);
      } else {
        console.error('Lỗi không xác định:', err);
        alert('Đã xảy ra lỗi không xác định!');
      }
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

      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '24px',
          background: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '10px',
        }}
      >
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Thêm sách mới</h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          encType="multipart/form-data"
        >
          {[
            { name: 'title', label: 'Tiêu đề' },
            { name: 'isbn', label: 'ISBN' },
            { name: 'author', label: 'Tác giả' },
            { name: 'publisher', label: 'Nhà xuất bản' },
            { name: 'publishYear', label: 'Năm xuất bản', type: 'number' },
            { name: 'price', label: 'Giá tiền', type: 'number' },
            { name: 'quantity', label: 'Số lượng', type: 'number' },
          ].map((field) => (
            <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>{field.label}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                style={{
                  padding: '8px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                }}
              />
              {formError[field.name] && (
                <span style={{ color: 'red', fontSize: '14px' }}>{formError[field.name]}</span>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Ảnh bìa sách</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {formError.imageFile && (
              <span style={{ color: 'red', fontSize: '14px' }}>{formError.imageFile}</span>
            )}
            {form.imagePreview && (
              <img
                src={form.imagePreview}
                alt="Preview"
                style={{
                  marginTop: '10px',
                  width: '120px',
                  height: '160px',
                  objectFit: 'cover',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            )}
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
            {formError.description && (
              <span style={{ color: 'red', fontSize: '14px' }}>{formError.description}</span>
            )}
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
            {formError.categories && (
              <span style={{ color: 'red', fontSize: '14px' }}>{formError.categories}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold' }}>Kệ sách</label>
            <select
              name="bookshelf"
              value={form.bookshelf}
              onChange={handleChange}
              style={{
                padding: '8px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            >
              <option value="">-- Chọn kệ sách --</option>
              {bookshelves.map((shelf) => (
                <option key={shelf._id} value={shelf._id}>
                  {shelf.name} ({shelf.code})
                </option>
              ))}
            </select>
            {formError.bookshelf && (
              <span style={{ color: 'red', fontSize: '14px' }}>{formError.bookshelf}</span>
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
              cursor: 'pointer',
            }}
          >
            Thêm sách
          </button>
        </form>
      </div>
    </>
  );
};

export default AddBook;
