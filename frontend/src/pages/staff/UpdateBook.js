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
          categories: book.categories?.map(c => c._id) || [],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBook(id, {
        ...form,
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
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Cập nhật sách</h2>
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
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
};

export default UpdateBook;
