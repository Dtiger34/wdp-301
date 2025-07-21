import api from './api'; // đảm bảo bạn đã cấu hình axios instance

// 1. Thống kê mượn/trả theo thời gian
export const getBorrowReturnReport = async ({ fromDate, toDate, period = 'day' } = {}) => {
    try {
        const response = await api.get('/reports/borrow-return', {
            params: { fromDate, toDate, period },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching borrow-return report:', error);
        throw error;
    }
};

// 2. Sách mượn nhiều nhất
export const getMostBorrowedBooks = async ({ fromDate, toDate, limit = 10 } = {}) => {
    try {
        const response = await api.get('/reports/most-borrowed-books', {
            params: { fromDate, toDate, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching most borrowed books:', error);
        throw error;
    }
};

// 3. Người dùng mượn nhiều nhất
export const getTopBorrowers = async ({ fromDate, toDate, limit = 10 } = {}) => {
    try {
        const response = await api.get('/reports/top-borrowers', {
            params: { fromDate, toDate, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching top borrowers:', error);
        throw error;
    }
};

// 4. Sách quá hạn chưa trả
export const getOverdueBooks = async ({ page = 1, limit = 10, sortBy = 'daysOverdue', sortOrder = 'desc' } = {}) => {
    try {
        const response = await api.get('/reports/overdue-books', {
            params: { page, limit, sortBy, sortOrder },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching overdue books:', error);
        throw error;
    }
};

// 5. Thống kê tình trạng sách theo thể loại
export const getInventoryStatsByCategory = async () => {
    try {
        const response = await api.get('/reports/inventory-stats-by-category');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory stats:', error);
        throw error;
    }
};

// 6. Bảng điều khiển tổng quan
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/reports/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};
