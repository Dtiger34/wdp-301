import React, { useEffect, useState } from 'react';
import { addBook } from '../../services/bookService';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
  const [form, setForm] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    publishYear: '',
    description: '',
    price: '',
    image: '',
    categories: [],
    bookshelf: '',
  });

  const [categories, setCategories] = useState([]);
  const [bookshelves, setBookshelves] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load categories & bookshelves
    const fetchData = async () => {
      const catRes = await api.get('/categories');
      const shelfRes = await api.get('/bookshelves');
      setCategories(catRes.data);
      setBookshelves(shelfRes.data);
    };
    fetchData();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBook({
        ...form,
        publishYear: parseInt(form.publishYear),
        price: parseFloat(form.price),
      });
      alert('Thêm sách thành công!');
      navigate('/staff/view-books');
    } catch (err) {
      console.error(err);
      alert('Thêm sách thất bại!');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Thêm sách mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'title', label: 'Tiêu đề' },
          { name: 'isbn', label: 'ISBN' },
          { name: 'author', label: 'Tác giả' },
          { name: 'publisher', label: 'Nhà xuất bản' },
          { name: 'publishYear', label: 'Năm xuất bản', type: 'number' },
          { name: 'price', label: 'Giá tiền', type: 'number' },
          { name: 'image', label: 'Ảnh (link URL)' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block font-medium">{field.label}</label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ))}

        <div>
          <label className="block font-medium">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Thể loại</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-1">
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

        <div>
          <label className="block font-medium">Kệ sách</label>
          <select
            name="bookshelf"
            value={form.bookshelf}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Chọn kệ sách --</option>
            {bookshelves.map((shelf) => (
              <option key={shelf._id} value={shelf._id}>
                {shelf.name} ({shelf.code})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Thêm sách
        </button>
      </form>
    </div>
  );
};

export default AddBook;
