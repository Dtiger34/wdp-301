import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../services/api.js"
import { getToken, checkUserAuth } from "../utils/auth.js";
import Header from "./Header.js";
import Footer from "./Footer.js";
const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const token = getToken();
    const userId = token ? checkUserAuth(token)?.id : null;
    console.log('Token:', token);
    console.log('User info:', checkUserAuth(token));
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu mới và xác nhận không khớp");
            return;
        }

        try {
            await changePassword(userId, oldPassword, newPassword);
            setSuccess("Đổi mật khẩu thành công!");
            setTimeout(() => {
                navigate("/home");
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu"
            );
        }
    };

    return (
        <>
            <Header />
            <div style={{ maxWidth: "400px", margin: "50px auto" }}>
                <h2>Đổi mật khẩu</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "10px" }}>
                        <label>Mật khẩu cũ:</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        <label>Mật khẩu mới:</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        <label>Xác nhận mật khẩu mới:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ width: "100%" }}
                        />
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {success && <p style={{ color: "green" }}>{success}</p>}

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        Đổi mật khẩu
                    </button>

                </form>
            </div>
            <Footer />
        </>
    );
};

export default ChangePassword;
