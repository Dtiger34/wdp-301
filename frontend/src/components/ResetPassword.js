import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import Header from "./Header";
import Footer from "./Footer";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await resetPassword(token, newPassword);
            setSuccess("Đặt lại mật khẩu thành công. Đang chuyển hướng...");
            setTimeout(() => navigate("/"), 3000); // Chuyển về trang login
        } catch (err) {
            setError(err?.response?.data?.message || "Lỗi đặt lại mật khẩu.");
        }
    };

    return (
        <div className="reset-password-page">
            <Header />
            <div className="login-content">
                <div className="login-container">
                    <h2>Đặt lại mật khẩu mới</h2>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>Mật khẩu mới</label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}
                        <button type="submit" className="login-button">Xác nhận</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ResetPassword;
