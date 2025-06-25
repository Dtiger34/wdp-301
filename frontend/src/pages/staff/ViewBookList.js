import React, { useEffect, useState } from 'react';
import { getBooks, deleteBook } from '../../services/bookService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import StaffDashboard from "../../pages/staff/StaffDashboard";
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
    <StaffDashboard>
      <div style={{ padding: '40px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#374151' }}>Danh sách sách</h2>
            <button
              onClick={() => navigate('/staff/add-book')}
              style={{
                backgroundColor: '#319795',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              + Thêm sách
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Tiêu đề</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Thông tin</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Ảnh bìa</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Thể loại</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Kệ sách</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>Không có sách nào được tìm thấy.</td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#1f2937' }}>{book.title}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                        <div>Tác giả: {book.author || '-'}</div>
                        <div>NXB: {book.publisher || '-'}</div>
                        <div>Năm: {book.publishYear || '-'}</div>
                        <div>Giá: {book.price?.toLocaleString()} đ</div>
                        <div>Mô tả: {book.description || '-'}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <img
                          src={book.image || 'https://via.placeholder.com/80'}
                          alt={book.title}
                          style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563' }}>
                        {book.categories?.map((c) => c.name).join(', ') || 'Không rõ'}
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563' }}>
                        {book.bookshelf?.name || 'Không rõ'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/staff/update-book/${book._id}`)}
                          style={{ color: '#3b82f6', marginRight: '8px', cursor: 'pointer' }}
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          style={{ color: '#ef4444', cursor: 'pointer' }}
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
    </StaffDashboard>
  );
};

export default ViewBookList;
