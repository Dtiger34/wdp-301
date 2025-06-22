import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../services/api';
import { getToken, checkUserAuth } from '../../utils/auth';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const token = getToken();
    const userId = token ? checkUserAuth(token)?.id : null;

    useEffect(() => {
        if (!userId) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const data = await getUserProfile(userId);
                setUser(data);
            } catch (error) {
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'red', marginTop: '100px' }}>{error}</div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            {/* Nút quay lại ở góc trên trái */}
            <div style={{ position: 'absolute', top: '140px', left: '30px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Quay lại
                </button>
            </div>
            <h2 style={{ marginBottom: '30px', color: '#2c3e50', textAlign: 'center', marginTop: '50px' }}>
                📄 Thông tin người dùng
            </h2>
            <div style={{ flex: 1, padding: '30px', maxWidth: '800px', margin: '50px auto' }}>
                {user ? (
                    <>
                        <div style={{
                            backgroundColor: '#f9f9f9',
                            padding: '100px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {[
                                { label: '👤 Họ tên', value: user.name },
                                { label: '🎓 Mã sinh viên', value: user.studentId },
                                { label: '📧 Email', value: user.email },
                                { label: '📱 Số điện thoại', value: user.phone },
                                { label: '🏠 Địa chỉ', value: user.address },
                            ].map((item, index) => (
                                <div key={index} style={{ marginBottom: '15px' }}>
                                    <strong style={{ width: '300px', display: 'inline-block' }}>{item.label}:</strong>
                                    <span>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Nút đổi mật khẩu bên ngoài */}
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a
                                href="/change-password"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#2980b9',
                                    color: '#fff',
                                    borderRadius: '5px',
                                    textDecoration: 'none'
                                }}
                            >
                                Đổi mật khẩu
                            </a>
                        </div>
                    </>
                ) : (
                    <p>Không tìm thấy thông tin người dùng</p>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ProfilePage;
