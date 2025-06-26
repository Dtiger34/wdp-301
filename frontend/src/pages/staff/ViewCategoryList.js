import React, { useEffect, useState } from 'react';
import { getCategories, deleteCategory } from '../../services/categoryService';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import StaffDashboard from '../staff/StaffDashboard';
const ViewCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
      <div style={{  backgroundColor: '#f9fafb', minHeight: '100vh' }}>
         <StaffDashboard >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#374151' }}>Danh sách thể loại</h2>
            <button
              onClick={() => navigate('/staff/AddCategory')}
              style={{
                backgroundColor: '#319795',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              + Thêm thể loại
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Tên thể loại</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Mô tả</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                      Không có thể loại nào.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontWeight: '600', color: '#1f2937' }}>{cat.name}</td>
                      <td style={{ padding: '16px', color: '#4b5563' }}>{cat.description || '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/staff/UpdateCategory?id=${cat._id}`)}
                          style={{
                            color: '#3b82f6',
                            marginRight: '10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          style={{
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </StaffDashboard>
      </div>
  );
};

export default ViewCategoryList;
