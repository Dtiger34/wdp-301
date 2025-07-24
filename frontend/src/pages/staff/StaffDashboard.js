import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const StaffDashboard = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Sidebar */}
                <aside style={{
                    width: '250px',
                    backgroundColor: '#2c3e50',
                    color: '#ecf0f1',
                    padding: '20px',
                    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{ color: '#ecf0f1', marginBottom: '20px' }}>📋 Quản trị</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {/* <li style={{ marginBottom: '15px' }}>
                            <Link to="/" style={linkStyle}>👤 Quản lý người dùng</Link>
                        </li> */}
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/staff/view-books" style={linkStyle}>📚 Quản lý sách</Link>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/staff/ViewCategoryList" style={linkStyle}>🏷️ Quản lý thể loại</Link>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/staff/bookshelf" style={linkStyle}>🗄️ Quản lý kệ sách</Link>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/staff/ViewListRequest" style={linkStyle}>📚 Quản lý yêu cầu</Link>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/staff/view-borrowing-books" style={linkStyle}>📚 Quản lý trả sách</Link>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/staff/borrows/borrow-history" style={linkStyle}>📚 Lịch sử trả sách</Link>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <Link to="/staff/report" style={linkStyle}>📈 Thống kê</Link>
                        </li>
                    </ul>
                </aside>

                {/* Nội dung chính */}
                <main style={{ flex: 1, padding: '40px', backgroundColor: '#ecf0f1' }}>
                    {children ? children : (
                        <>
                            <h2 style={{ marginBottom: '50px' }}>👋 Chào mừng Staff</h2>
                            <p>Vui lòng chọn một chức năng quản trị từ menu bên trái.</p>
                        </>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

const linkStyle = {
    textDecoration: 'none',
    color: '#ecf0f1',
    fontWeight: '500',
    fontSize: '16px'
};

export default StaffDashboard;
