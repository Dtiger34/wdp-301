import React, { useEffect, useState } from 'react';
import { getAllUsers, importUsersFromExcel, updateuser } from '../../services/api';
import AdminDashboard from './AdminDashboard';
import { Button, Modal, Form } from 'react-bootstrap';

const ViewAllUser = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

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
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            isActive: user.isActive !== false,
        });
        setShowModal(true);
    };


    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    const handleSave = async () => {
        const { name, email, phone, address, isActive } = formData;

        if (!name || !email) {
            alert('Tên và Email là bắt buộc!');
            return;
        }

        try {
            await updateuser(selectedUser._id, { name, email, phone, address, isActive });
            alert('✅ Cập nhật thành công!');
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            console.error('Update failed:', err);
            alert('❌ Cập nhật thất bại!');
        }
    };


    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const result = await importUsersFromExcel(file);
            alert(`✅ Đã nhập ${result?.importedCount || 0} người dùng thành công!`);
            fetchUsers();
        } catch (err) {
            alert('❌ Nhập người dùng thất bại. Vui lòng kiểm tra định dạng file.');
        }
    };

    return (
        <AdminDashboard>
            <div style={{ padding: '20px', width: '100%', backgroundColor: '#f5f8fa' }}>
                <h2 style={{ marginBottom: '20px' }}>👥 Danh sách người dùng</h2>

                <div style={{
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div>
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
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <label>
                            <Button variant="secondary" as="span">
                                📥 Nhập từ Excel
                            </Button>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleImportExcel}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <Button
                            onClick={() => window.location.href = '/admin/add-account'}
                            style={{
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
                </div>

                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
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
                                        style={{
                                            marginRight: '8px',
                                            padding: '5px 10px',
                                            backgroundColor: '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✏️ Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑 Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal Update User */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Cập nhật người dùng</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ tên</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select
                                    name="isActive"
                                    value={String(formData.isActive)}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            isActive: e.target.value === 'true'
                                        }))
                                    }
                                >
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Vô hiệu hóa</option>
                                </Form.Select>
                            </Form.Group>

                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Lưu thay đổi
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </AdminDashboard>
    );
};

export default ViewAllUser;
