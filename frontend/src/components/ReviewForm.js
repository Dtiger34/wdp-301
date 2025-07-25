import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBook } from '../services/bookService';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';

const ReviewForm = () => {
  const { id } = useParams(); // bookId
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await getBook(id);
        setBook(bookData);
      } catch (err) {
        setError('Không thể tải thông tin sách.');
      }
    };

    fetchBook();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/review', {
        bookId: id,
        rating,
        comment
      });

      setSuccess('Đánh giá của bạn đã được gửi!');
      setTimeout(() => {
        navigate(`/view-book/${id}`);
      }, 1500);
    } catch (err) {
      setError('Gửi đánh giá thất bại.');
    }
  };

  if (!book) return <div style={{ padding: '20px' }}>Đang tải sách...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Đánh giá sách: {book.title}</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <label><strong>Chọn số sao:</strong></label><br />
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '8px', marginTop: '10px' }}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} sao</option>
            ))}
          </select>

          <div style={{ marginTop: '20px' }}>
            <label><strong>Viết đánh giá:</strong></label><br />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={5}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginTop: '10px' }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Gửi đánh giá
          </button>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewForm;
