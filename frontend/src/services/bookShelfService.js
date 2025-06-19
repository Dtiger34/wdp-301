import api from './api';

// Get all bookshelves
export const getBookshelves = async () => {
    try {
        const response = await api.get('/bookshelves');
        return response.data;
    } catch (error) {
        console.error('Error fetching bookshelves:', error);
        throw error;
    }
};

// Get a single bookshelf by ID
export const getBookshelf = async (id) => {
    try {
        const response = await api.get(`/bookshelves/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching bookshelf:', error);
        throw error;
    }
};

// Add a new bookshelf
export const addBookshelf = async (shelf) => {
    try {
        const response = await api.post('/bookshelves', shelf);
        return response.data;
    } catch (error) {
        console.error('Error adding bookshelf:', error);
        throw error;
    }
};

// Update bookshelf by ID
export const updateBookshelf = async (id, shelf) => {
    try {
        const response = await api.put(`/bookshelves/${id}`, shelf);
        return response.data;
    } catch (error) {
        console.error('Error updating bookshelf:', error);
        throw error;
    }
};

// Delete bookshelf by ID
export const deleteBookshelf = async (id) => {
    try {
        const response = await api.delete(`/bookshelves/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting bookshelf:', error);
        throw error;
    }
};
