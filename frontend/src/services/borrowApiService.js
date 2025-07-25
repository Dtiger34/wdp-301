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
        const response = await api.get('/borrows');
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


export const getBorrowedHistory = async (userId) => {
    try {
        const response = await api.get(`/books/borrow-history/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching borrow history:', error);
        throw error;
    }
};

export const getAllBorrowedRequests = async () => {
    try {
        const response = await api.get(`/borrows/status-borrowed`);
        return response.data;
    } catch (error) {
        console.error('Error fetching borrow history:', error);
        throw error;
    }
};

export const returnBook = async (borrowId, data) => {
    try {
        const response = await api.post(
            `/borrows/return-book/${borrowId}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error returning book:", error.response?.data || error.message);
        throw error;
    }
};


export const extendBorrowPeriod = async (borrowId, days = 7) => {
    try {
        const response = await api.post(
            `/borrows/extend-borrow/${borrowId}`,
            { days },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error extending borrow period:", error.response?.data || error.message);
        throw error;
    }
};

export const getAllReturnHistory = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`/borrows/borrow-history`, {
            params: { page, limit },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching all return history:", error.response?.data || error.message);
        throw error;
    }
};

export const getBorrowedBooksByUser = async (userId) => {
    try {
        const response = await api.get(`/borrows/return-history/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching borrowed books by user:", error.response?.data || error.message);
        throw error;
    }
}

export const confirmBookPickup = async (borrowId) => {
    try {
        const response = await api.post(
            `/borrows/confirm-pickup/${borrowId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error confirming book pickup:", error.response?.data || error.message);
        throw error;
    }
};

export const cancelBorrowRequest = async (borrowId) => {
    try {
        const response = await api.post(
            `/borrows/cancel/${borrowId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error cancelling borrow request:", error.response?.data || error.message);
        throw error;
    }
}