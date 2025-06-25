import React, { useState, useEffect } from 'react';
import { getBooks } from '../services/bookService';
import { getCategories } from '../services/categoryService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookData = await getBooks();
        const categoryData = await getCategories();
        setBooks(bookData);
        setFilteredBooks(bookData);
        setCategories(categoryData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = books;

    if (searchTerm.trim()) {
      result = result.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((book) =>
        book.categories.some((cat) =>
          typeof cat === 'string'
            ? cat === selectedCategory
            : cat._id === selectedCategory
        )
      );
    }

    setFilteredBooks(result);
  }, [searchTerm, selectedCategory, books]);

  // ✅ Hàm xử lý đường dẫn ảnh an toàn
  const getSafeImage = (url) => {
    if (!url || url.startsWith('blob:')) {
      return 'https://via.placeholder.com/150x200?text=No+Image';
    }
    if (url.startsWith('/uploads/')) {
      return `http://localhost:9999${url}`; // Điều chỉnh nếu bạn dùng port khác
    }
    return url;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          padding: '20px',
          backgroundColor: '#f4f4f4',
          borderRight: '1px solid #ddd'
        }}>
          <h3>Tìm kiếm & Lọc</h3>

          <div style={{ marginBottom: '20px' }}>
            <label>Tìm kiếm theo tên:</label><br />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên sách"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginTop: '5px'
              }}
            />
          </div>

          <div>
            <label>Lọc theo thể loại:</label><br />
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="all">Tất cả</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Book List */}
        <main style={{ flex: 1, padding: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>📚 Danh sách sách</h2>
          {filteredBooks.length === 0 ? (
            <p>Không tìm thấy sách phù hợp</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  onClick={() => navigate(`/detail-book/${book._id}`)}
                  style={{
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={getSafeImage(book.image)}
                    alt={book.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}
                  />
                  <h7 style={{ margin: '10px 0', fontWeight: 'bold' }}>{book.title}</h7>
                  <p>Tác giả: {book.author}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
