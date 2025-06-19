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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-teal-700">Quản lý Sách</h1>
          <button
            onClick={() => navigate('/staff/add-book')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow"
          >
            + Thêm sách
          </button>
        </div>

        <div className="overflow-x-auto shadow rounded-lg bg-white">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Tác giả</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Thể loại</th>
                <th className="px-4 py-3">Kệ sách</th>
                <th className="px-4 py-3">Ảnh</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                    Không có sách nào được tìm thấy.
                  </td>
                </tr>
              ) : (
                books.map((book, index) => (
                  <tr
                    key={book._id}
                    className="hover:bg-gray-50 border-b"
                  >
                    <td className="px-4 py-3 font-medium text-center">{index + 1}</td>
                    <td className="px-4 py-3">{book.title}</td>
                    <td className="px-4 py-3">{book.author || '-'}</td>
                    <td className="px-4 py-3">{book.price?.toLocaleString()} đ</td>
                    <td className="px-4 py-3">{book.categories?.map((c) => c.name).join(', ')}</td>
                    <td className="px-4 py-3">{book.bookshelf?.name || '-'}</td>
                    <td className="px-4 py-3">
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded shadow"
                        />
                      ) : (
                        <span className="text-gray-400 italic">Không có ảnh</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center space-x-3">
                      <button
                        onClick={() => navigate(`/staff/update-book/${book._id}`)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(book._id)}
                        className="text-red-500 hover:text-red-700"
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
    </div>
  );
};

export default ViewBookList;
