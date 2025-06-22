import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../services/api';
import AdminDashboard from './AdminDashboard';
import { Button } from 'react-bootstrap';
const ViewAllUser = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        if (filter === 'all') {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(users.filter(user => user.role === filter));
        }
    }, [filter, users]);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
            try {
                // await deleteUser(id);
                fetchUsers();
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleUpdate = (user) => {
        alert(`Tính năng cập nhật đang phát triển cho user`);

    };

    return (
        <AdminDashboard>
            <div style={{ padding: '20px', width: '100%', backgroundColor: '#f5f8fa' }}>
                <h2 style={{ marginBottom: '20px' }}>👥 Danh sách người dùng</h2>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>Lọc theo vai trò:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '5px 10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            outline: 'none'
                        }}
                    >
                        <option value="all">Tất cả</option>
                        <option value="user">Người dùng</option>
                        <option value="staff">Nhân viên</option>
                    </select>

                    <Button
                        onClick={() => window.location.href = '/admin/add-account'}
                        style={{
                            marginLeft: '1100px',
                            padding: '5px 10px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Tạo người dùng
                    </Button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Tên</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Mã SV</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>SĐT</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Địa chỉ</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Vai trò</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={user._id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                                <td style={{ padding: '10px' }}>{index + 1}</td>
                                <td style={{ padding: '10px' }}>{user.name}</td>
                                <td style={{ padding: '10px' }}>{user.studentId}</td>
                                <td style={{ padding: '10px' }}>{user.email}</td>
                                <td style={{ padding: '10px' }}>{user.phone}</td>
                                <td style={{ padding: '10px' }}>{user.address}</td>
                                <td style={{ padding: '10px', textTransform: 'capitalize' }}>{user.role}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleUpdate(user)}
                                        style={{ marginRight: '8px', padding: '5px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        🗑 Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminDashboard>
    );
};

export default ViewAllUser;
