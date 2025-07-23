import React, { useEffect, useState, useCallback } from 'react';
import { getAllBooks, deleteBook } from '../../services/bookService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import StaffDashboard from '../staff/StaffDashboard'
import { Row, Pagination } from 'antd';
const ViewBookList = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const fetchBooks = useCallback(async () => {
    try {
      const data = await getAllBooks({ page: currentPage });
      setBooks(Array.isArray(data.books) ? data.books : []);
      setTotalItems(data.totalBooks || 0);
    } catch (err) {
      console.error("Failed to load books", err);
      setBooks([]);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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

  const getSafeImage = (url) => {
    if (!url || url.startsWith('blob:')) {
      return 'https://via.placeholder.com/200x300?text=No+Image';
    }
    if (url.startsWith('/images/book/')) {
      return `http://localhost:9999${url}`;
    }

    return url;
  };


  return (
    <StaffDashboard>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9fafb' }}>

        <main style={{ flex: 1 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
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
                    <th style={thStyle}>Tiêu đề</th>
                    <th style={thStyle}>Thông tin</th>
                    <th style={thStyle}>Ảnh bìa</th>
                    <th style={thStyle}>Thể loại</th>
                    <th style={thStyle}>Kệ sách</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                        Không có sách nào được tìm thấy.
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        {/* <td style={tdStyleTitle}>{book.title}</td> */}
                        <td style={{ ...tdStyleTitle, cursor: 'pointer', color: '#2563eb' }}
                            onClick={() => navigate(`/staff/book/${book._id}`)}
                            title="Xem chi tiết sách"
                        >
                            {book.title}
                        </td>

                        <td style={tdStyleInfo}>
                          <div>Tác giả: {book.author || '-'}</div>
                          <div>NXB: {book.publisher || '-'}</div>
                          <div>Năm: {book.publishYear || '-'}</div>
                          <div>Giá: {book.price?.toLocaleString()} đ</div>
                          <div>Mô tả: {book.description || '-'}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <img
                            src={getSafeImage(book.image)}
                            alt={book.title}
                            style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={tdStyle}>{book.categories?.map((c) => c.name).join(', ') || 'Không rõ'}</td>
                        <td style={tdStyle}>{book.bookshelf?.name || 'Không rõ'}</td>
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
        </main>
        <Row style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
          <Pagination
            current={currentPage}
            total={totalItems}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </Row>
      </div>
    </StaffDashboard>

  );
};

const thStyle = {
  padding: '16px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151'
};

const tdStyle = {
  padding: '16px',
  fontSize: '14px',
  color: '#374151'
};

const tdStyleTitle = {
  ...tdStyle,
  fontWeight: '600',
  color: '#1f2937'
};

const tdStyleInfo = {
  ...tdStyle,
  lineHeight: '1.5'
};

export default ViewBookList;
