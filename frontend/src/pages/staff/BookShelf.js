import React, { useEffect, useState } from 'react';
import { getBookshelves, deleteBookshelf } from '../../services/bookShelfService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import StaffDashboard from '../staff/StaffDashboard';
const BookShelf = () => {
  const [bookshelves, setBookshelves] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookshelves();
  }, []);

  const fetchBookshelves = async () => {
    try {
      const data = await getBookshelves();
      setBookshelves(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách kệ sách:', error);
      alert('Không thể tải danh sách kệ sách!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kệ sách này không?')) {
      try {
        await deleteBookshelf(id);
        alert('Đã xóa kệ sách!');
        fetchBookshelves();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Xóa thất bại!');
      }
    }
  };

  return (
    <>
      <StaffDashboard>

        <div style={{ backgroundColor: '#f9fafb', minHeight: '80vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#374151' }}>Danh sách kệ sách</h2>
              <button
                onClick={() => navigate('/staff/add-bookshelf')}
                style={{
                  backgroundColor: '#319795',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
              >
                + Thêm kệ sách
              </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={thStyle}>Mã kệ</th>
                    <th style={thStyle}>Tên kệ</th>
                    <th style={thStyle}>Vị trí</th>
                    <th style={thStyle}>Mô tả</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {bookshelves.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                        Không có kệ sách nào được tìm thấy.
                      </td>
                    </tr>
                  ) : (
                    bookshelves.map((shelf) => (
                      <tr key={shelf._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={tdStyle}>{shelf.code}</td>
                        <td style={tdStyle}>{shelf.name}</td>
                        <td style={tdStyle}>{shelf.location}</td>
                        <td style={tdStyle}>{shelf.description}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <button
                            onClick={() => navigate(`/staff/update-bookshelf/${shelf._id}`)}
                            style={{ color: '#3b82f6', marginRight: '8px', cursor: 'pointer' }}
                            title="Sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(shelf._id)}
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
    </>
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

export default BookShelf;
