import React, { useEffect, useState } from 'react';
import { getBooks, deleteBook } from '../../services/bookService';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ViewBookList = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      try {
        await deleteBook(id);
        fetchBooks();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-center text-lg text-teal-600 font-semibold mb-6">Trang danh sách sách</h1>

      <div className="mb-4 flex justify-start">
        <button
          onClick={() => navigate('/staff/add-book')}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded shadow"
        >
          + Thêm sách
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-800 text-white text-sm">
            <tr>
              <th className="px-3 py-2 border">Mã</th>
              <th className="px-3 py-2 border">Tên sách</th>
              <th className="px-3 py-2 border">Giá</th>
              <th className="px-3 py-2 border">Thể loại</th>
              <th className="px-3 py-2 border">Hình ảnh</th>
              <th className="px-3 py-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {books.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-gray-500">
                  Không có sách nào.
                </td>
              </tr>
            ) : (
              books.map((book, index) => (
                <tr key={book._id} className="hover:bg-gray-100">
                  <td className="border px-3 py-2 text-center">{index + 1}</td>
                  <td className="border px-3 py-2">{book.title}</td>
                  <td className="border px-3 py-2">{book.price?.toLocaleString()}đ</td>
                  <td className="border px-3 py-2">
                    {book.categories?.map((c) => c.name).join(', ')}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {book.image ? (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-12 w-auto mx-auto rounded shadow"
                      />
                    ) : (
                      <span className="text-gray-400 italic">Không có ảnh</span>
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/staff/update-book/${book._id}`)}
                      className="text-yellow-500 hover:text-yellow-600"
                      title="Sửa"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="text-red-500 hover:text-red-600"
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewBookList;
