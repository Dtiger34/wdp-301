import axios from 'axios';
import { getToken } from '../utils/auth';


const API_URL = 'http://localhost:9999/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export const loginUser = async (studentId, password) => {
    try {
        const response = await api.post('/login', { studentId, password });
        const { token } = response.data;
        return token;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};


export const getUserProfile = async (userId) => {
    try {
        const token = getToken();
        const response = await api.get(`/getUserById/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
};