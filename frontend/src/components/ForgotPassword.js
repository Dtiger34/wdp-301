import React, { useState } from "react";
import { forgotPassword } from "../services/api";
import Header from "./Header";
import Footer from "./Footer";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await forgotPassword(email);
            setSuccess("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.");
        } catch (err) {
            setError(err?.response?.data?.message || "Gửi email thất bại.");
        }
    };

    return (
        <div className="forgot-password-page">
            <Header />
            <div className="login-content">
                <div className="login-container">
                    <h2>Quên mật khẩu</h2>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>Email của bạn</label>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}
                        <button type="submit" className="login-button">Gửi</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ForgotPassword;
