import api from './api';
import { getToken } from '../utils/auth';

export const createAccount = async (userData) => {
    try {
        const token = getToken();
        const response = await api.post(
            '/auth/admin/addaccount',
            userData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};


