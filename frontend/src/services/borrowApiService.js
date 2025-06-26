import api from './api';

export const requestBorrowBook = async ({ bookId, isReadOnSite, notes = '', dueDate }) => {
    try {
        const response = await api.post(
            '/books/borrow/request',
            { bookId, isReadOnSite, notes, dueDate },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        console.log('Borrow request successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error requesting borrow:', error.response?.data || error.message);
        throw error;
    }
};

export const getBorrowRequests = async () => {
    try {
        const response = await api.get('/borrows');
        return response.data;
    } catch (error) {
        console.error('Error fetching borrow requests:', error);
        throw error;
    }
}

export const acceptBorrowRequest = async (borrowId) => {
    try {
        const response = await api.put(`/borrows/accept/${borrowId}`);
        return response.data;
    } catch (error) {
        console.error('Error accepting borrow request:', error);
        throw error;
    }
}

export const getPendingBorrowRequests = async () => {
    try {
        const response = await api.get('/books/borrow-requests/pending');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending borrow requests:', error);
        throw error;
    }
};