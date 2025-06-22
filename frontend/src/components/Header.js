import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoutUser } from '../services/api';
import { removeToken, getToken, checkUserAuth } from '../utils/auth';

const Header = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = getToken();
    const user = token ? checkUserAuth(token) : null;
    const isAdmin = user?.role === 'admin';

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logoutUser();
            removeToken();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <header
            style={{
                backgroundColor: '#282c34',
                color: '#fff',
                padding: '10px 20px',
                position: 'relative',
            }}
        >
            <h1 style={{ textAlign: 'center' }}>Management Library</h1>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    height: '40px',
                }}
            >
                {/* Menu giữa */}
                <ul
                    style={{
                        display: 'flex',
                        listStyleType: 'none',
                        padding: 0,
                        margin: 0,
                        gap: '20px',
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    <li>
                        <Link to="/home" style={{ color: '#fff', textDecoration: 'none' }}>
                            Trang chủ
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>
                            Hồ sơ
                        </Link>
                    </li>
                    <li>
                        <Link to="/staff/view-books" style={{ color: '#fff', textDecoration: 'none' }}>
                            Sách
                        </Link>
                    </li>
                    {isAdmin && (
                        <li>
                            <Link to="/admin-dashboard" style={{ color: '#fff', textDecoration: 'none' }}>
                                Admin
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Logout bên phải */}
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    style={{
                        marginLeft: 'auto',
                        backgroundColor: 'transparent',
                        border: '1px solid #fff',
                        color: '#fff',
                        padding: '5px 10px',
                        cursor: 'pointer',
                    }}
                >
                    {loading ? 'Đang đăng xuất...' : 'Logout'}
                </button>
            </div>
        </header>
    );
};

export default Header;
