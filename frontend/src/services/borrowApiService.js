import api from './api';

export const requestBorrowBook = async ({
    bookId,
    isReadOnSite,
    notes = '',
    dueDate,
    quantity
}) => {
    try {

        const response = await api.post(
            '/books/borrow/request',
            { bookId, isReadOnSite, notes, dueDate, quantity },
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
        const response = await api.get('/borrows/status-borrowed');
        return response.data;
    } catch (error) {
        console.error('Error fetching borrow requests:', error);
        throw error;
    }
}

export const acceptBorrowRequest = async (borrowId) => {
    try {
        const response = await api.post(`/borrows/accept-borrow-request/${borrowId}`);
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
export const declineBorrowRequest = async (borrowId, reason = '') => {
    try {
        const response = await api.post(
            `/borrows/decline-borrow-request/${borrowId}`,
            { reason },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error declining borrow request:', error.response?.data || error.message);
        throw error;
    }
};


export const getBorrowedHistory = async (userId) => {
    try {
        const response = await api.get(`/books/borrow-history/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching borrow history:', error);
        throw error;
    }
};
