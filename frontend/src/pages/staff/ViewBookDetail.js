import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook } from '../../services/bookService';
import StaffDashboard from '../staff/StaffDashboard';

const ViewDetailBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBook(id);
        setBook(data);
      } catch (err) {
        console.error("Error loading book detail:", err);
      }
    };

    fetchBook();
  }, [id]);

  const getSafeImage = (url) => {
    if (!url || url.startsWith('blob:')) {
      return 'https://via.placeholder.com/200x300?text=No+Image';
    }
    if (url.startsWith('/images/book/')) {
      return `http://localhost:9999${url}`;
    }
    return url;
  };

  if (!book) return <div>Đang tải dữ liệu...</div>;

  return (
    <StaffDashboard>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#4B5563',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          ← Quay lại
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>{book.title}</h2>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
          <img
            src={getSafeImage(book.image)}
            alt={book.title}
            style={{ width: '180px', height: '240px', objectFit: 'cover', borderRadius: '4px' }}
          />
          <div style={{ flex: 1 }}>
            <p><strong>Tác giả:</strong> {book.author}</p>
            <p><strong>NXB:</strong> {book.publisher}</p>
            <p><strong>Năm XB:</strong> {book.publishYear}</p>
            <p><strong>Giá:</strong> {book.price?.toLocaleString()} đ</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Mô tả:</strong> {book.description}</p>
            <p><strong>Thể loại:</strong> {book.categories?.map(c => c.name).join(', ') || 'Không rõ'}</p>
            <p><strong>Kệ sách:</strong> {book.bookshelf?.name} ({book.bookshelf?.location})</p>
          </div>
        </div>

        {/* Inventory summary */}
        <div style={{
          background: '#f3f4f6',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Tình trạng sách</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>Tổng số:</strong> {book.inventory?.total || 0}</li>
            <li><strong>Có thể mượn:</strong> {book.inventory?.available || 0}</li>
            <li><strong>Đang được mượn:</strong> {book.inventory?.borrowed || 0}</li>
            <li><strong>Sách bị mất:</strong> {book.inventory?.lost || 0}</li>
            <li><strong>Sách bị hỏng:</strong> {book.inventory?.damaged || 0}</li>
          </ul>
        </div>

        {/* Book copies list */}
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Danh sách mã vạch sách</h3>
          {book.bookCopies?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={thStyle}>Barcode</th>
                  <th style={thStyle}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {book.bookCopies.map(copy => (
                  <tr key={copy._id}>
                    <td style={tdStyle}>{copy.barcode}</td>
                    <td style={tdStyle}>{renderStatus(copy.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có bản sao sách.</p>
          )}
        </div>
      </div>
    </StaffDashboard>
  );
};

const renderStatus = (status) => {
  switch (status) {
    case 'available': return 'Có sẵn';
    case 'borrowed': return 'Đang mượn';
    case 'lost': return 'Đã mất';
    case 'damaged': return 'Hỏng';
    default: return status;
  }
};

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid #e5e7eb'
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #f1f5f9',
  color: '#374151',
};

export default ViewDetailBook;
