import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../services/api';
import { getToken, checkUserAuth } from '../../utils/auth';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { Button } from 'react-bootstrap';
import '../../css/ProfilePage.css'; // Import file CSS cho ProfilePage

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <Header />
            <div className="profile-container">

                <h1 className="profile-title">User Profile</h1>
                {user ? (
                    <div className="profile-info">
                        <div className="profile-table">
                            <div className="row">
                                <div className="col-sm-4"><strong>Name:</strong></div>
                                <div className="col-sm-8">{user.name}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4"><strong>Student ID:</strong></div>
                                <div className="col-sm-8">{user.studentId}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4"><strong>Email:</strong></div>
                                <div className="col-sm-8">{user.email}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4"><strong>Phone:</strong></div>
                                <div className="col-sm-8">{user.phone}</div>
                            </div>
                            <div className="row">
                                <div className="col-sm-4"><strong>Address:</strong></div>
                                <div className="col-sm-8">{user.address}</div>
                            </div>
                        </div>
                        <Button variant="primary" onClick={() => alert('Change Password')}>Change Password</Button>
                    </div>
                ) : (
                    <p>No user data available</p>
                )}

            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
