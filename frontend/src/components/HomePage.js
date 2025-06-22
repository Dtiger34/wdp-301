import React, { useState, useEffect } from 'react';
import { getBooks } from '../services/bookService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
const HomePage = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 999999]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await getBooks();
                setBooks(data);
                setFilteredBooks(data);
            } catch (error) {
                console.error('Failed to load books:', error);
            }
        };
        fetchBooks();
    }, []);
    const navigate = useNavigate();

    useEffect(() => {
        let result = books;

        if (searchTerm.trim()) {
            result = result.filter(book =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        result = result.filter(book =>
            book.price >= priceRange[0] && book.price <= priceRange[1]
        );

        setFilteredBooks(result);
    }, [searchTerm, priceRange, books]);

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
                        <label>Lọc theo giá:</label><br />
                        <select
                            onChange={(e) => {
                                const value = e.target.value;
                                switch (value) {
                                    case '0-100':
                                        setPriceRange([0, 100]);
                                        break;
                                    case '100-200':
                                        setPriceRange([100, 200]);
                                        break;
                                    case '200-500':
                                        setPriceRange([200, 500]);
                                        break;
                                    default:
                                        setPriceRange([0, 999999]);
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginTop: '5px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="all">Tất cả</option>
                            <option value="0-100">0 - 100</option>
                            <option value="100-200">100 - 200</option>
                            <option value="200-500">200 - 500</option>
                        </select>
                    </div>
                </aside>

                {/* Book List */}
                <main style={{ flex: 1, padding: '20px' }}>
                    <h2 style={{ marginBottom: '20px' }}>📚 Danh sách sách</h2>
                    {filteredBooks.length === 0 ? (
                        <p>Không tìm thấy sách phù hợp</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
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
                                        src={book.image || 'https://via.placeholder.com/150'}
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
