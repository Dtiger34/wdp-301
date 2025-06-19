import axios from 'axios';

const API_URL = 'http://localhost:9999/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; // ✅ THÊM DÒNG NÀY

// Nếu bạn có dùng login thì giữ nguyên dòng này
export const loginUser = async (studentId, password) => {
  try {
    const response = await api.post('/login', { studentId, password });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
