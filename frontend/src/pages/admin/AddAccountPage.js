import React, { useState } from 'react';
import { createAccount } from '../../services/AuthServicesApi';
import AdminDashboard from './AdminDashboard';

const AddAccountPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        role: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const { name, studentId, email, phone, address, password } = formData;

        // Validate
        if (!name || name.length > 255) {
            return setError('Họ tên bắt buộc và không vượt quá 255 ký tự.');
        }

        if (!studentId || !/^[a-zA-Z0-9]{1,10}$/.test(studentId)) {
            return setError('Mã sinh viên chỉ được phép chứa chữ và số, tối đa 10 ký tự.');
        }

        if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return setError('Email không hợp lệ.');
        }

        if (!phone || !/^\d{1,10}$/.test(phone)) {
            return setError('Số điện thoại chỉ được chứa tối đa 10 chữ số.');
        }

        if (!address || address.length > 255) {
            return setError('Địa chỉ bắt buộc và không vượt quá 255 ký tự.');
        }

        if (!password) {
            return setError('Mật khẩu không được để trống.');
        }

        try {
            await createAccount(formData);
            setSuccess('✅ Tạo tài khoản thành công!');
            setFormData({
                name: '',
                studentId: '',
                email: '',
                phone: '',
                address: '',
                password: '',
                role: 'user',
            });
        } catch (err) {
            setError(err.response?.data?.message || '❌ Có lỗi xảy ra!');
        }
    };


    return (
        <AdminDashboard>
            <div style={{
                padding: '30px',
                maxWidth: '600px',
                margin: '30px auto',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: '8px'
            }}>
                <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}> 👤 Thêm tài khoản mới</h2>

                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

                <form onSubmit={handleSubmit}>
                    {renderInput('Họ tên', 'name')}
                    {renderInput('Mã sinh viên', 'studentId')}
                    {renderInput('Email', 'email', 'email')}
                    {renderInput('Số điện thoại', 'phone')}
                    {renderInput('Địa chỉ', 'address')}
                    {renderInput('Mật khẩu', 'password', 'password')}

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#333' }}>Vai trò:</label><br />
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                marginTop: '5px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="user">Người dùng</option>
                            <option value="staff">Nhân viên</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#2c3e50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '15px'
                        }}
                    >
                        Tạo tài khoản
                    </button>
                </form>
            </div>
        </AdminDashboard>
    );

    function renderInput(label, name, type = 'text') {
        return (
            <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', color: '#333' }}>{label}:</label><br />
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        marginTop: '5px',
                        fontSize: '14px'
                    }}
                />
            </div>
        );
    }
};

export default AddAccountPage;
