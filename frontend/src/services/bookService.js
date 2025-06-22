import api from './api';
import { getToken } from '../utils/auth'; // điều chỉnh đường dẫn nếu khác

// Get all books
export const getBooks = async () => {
    try {
        const token = getToken();
        const response = await api.get('/books', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
};

// Get a single book by ID
export const getBook = async (id) => {
    try {
        const token = getToken();
        const response = await api.get(`/books/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching book:', error);
        throw error;
    }
};

// Add new book
export const addBook = async (book) => {
    try {
        const token = getToken();
        const response = await api.post('/books', book, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error adding book:', error);
        throw error;
    }
};

// Update book by ID
export const updateBook = async (id, book) => {
    try {
        const token = getToken();
        const response = await api.put(`/books/${id}`, book, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
};

// Delete book by ID
export const deleteBook = async (id) => {
    try {
        const token = getToken();
        const response = await api.delete(`/books/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
};
