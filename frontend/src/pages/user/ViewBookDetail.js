import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBook } from '../../services/bookService';
import { requestBorrowBook } from '../../services/borrowApiService';
import { getInventoryItemById } from '../../services/InventoryServicesApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BorrowModal from '../../components/BorrowModal';
import { getToken, checkUserAuth } from '../../utils/auth';

const ViewBookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [available, setAvailable] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Lấy thông tin người dùng và kiểm tra role
  const token = getToken();
  const user = token ? checkUserAuth(token) : null;
  const isUser = user?.role === 'user';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookData = await getBook(id);
        setBook(bookData);

        const inventoryData = await getInventoryItemById(id);
        setAvailable(inventoryData.available || 0);
      } catch (err) {
        setError('Không thể tải dữ liệu sách hoặc kho.');
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (error || success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error, success]);

  const handleModalConfirm = async ({ quantity, isReadOnSite, dueDate }) => {
    setLoading(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await requestBorrowBook({
          bookId: book._id,
          isReadOnSite,
          dueDate,
          notes: `Trả trước ngày ${dueDate}`
        });
      }
      setSuccess(`✅ Đã gửi yêu cầu mượn ${quantity} cuốn "${book.title}"`);
      setError('');
      setModalOpen(false);
    } catch (err) {
      const message = err.response?.data?.message || 'Đã xảy ra lỗi khi gửi yêu cầu';
      setError(message);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const getSafeImage = (url) => {
    if (!url || url.startsWith('blob:')) {
      return 'https://via.placeholder.com/200x300?text=No+Image';
    }

    // Nếu chỉ có tên file, thêm đường dẫn uploads
    if (!url.startsWith('http') && !url.startsWith('/uploads/')) {
      url = `/uploads/${url}`;
    }

    return `http://localhost:9999${url}`;
  };


  if (!book) return <div style={{ padding: '20px' }}>Đang tải...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '30px',
          maxWidth: '1000px',
          width: '100%',
          gap: '30px',
        }}>
          <img
            src={getSafeImage(book.image)}
            alt={book.title}
            style={{
              width: '300px',
              height: 'auto',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          />

          <div style={{ flex: 1 }}>
            <h2>{book.title}</h2>
            <p><strong>Tác giả:</strong> {book.author}</p>
            <p><strong>Thể loại:</strong> {Array.isArray(book.categories) ? book.categories.map(c => c.name).join(', ') : 'Không xác định'}</p>
            <p><strong>Mô tả:</strong> {book.description || 'Chưa có mô tả'}</p>
            <p><strong>Số lượng còn lại:</strong> {available}</p>

            <div style={{ marginTop: '20px' }}>
              <label><strong>Số lượng mượn:</strong></label><br />
              <input
                type="number"
                value={quantity}
                min={1}
                max={available}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setQuantity(isNaN(val) ? 1 : val);
                }}
                style={{
                  padding: '10px',
                  width: '80px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginRight: '10px',
                  marginTop: '8px'
                }}
              />
              <button
                onClick={() => setModalOpen(true)}
                disabled={loading}
                style={{
                  padding: '10px 18px',
                  backgroundColor: loading ? '#95a5a6' : '#2c3e50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Đang gửi...' : '📚 Mượn sách'}
              </button>
            </div>


            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
          </div>
        </div>
      </main>

      <BorrowModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        maxQuantity={available}
        defaultQuantity={quantity}
      />

      <Footer />
    </div>
  );
};

export default ViewBookDetail;
