// src/components/Report.js
import React, { useEffect, useState } from 'react';
import {
    getDashboardStats,
    getBorrowReturnReport,
    getMostBorrowedBooks,
    getTopBorrowers,
    getOverdueBooks,
    getInventoryStatsByCategory
} from '../services/reportServiceApi';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Report = () => {
    const [overview, setOverview] = useState(null);
    const [borrowReturnData, setBorrowReturnData] = useState([]);
    const [topBooks, setTopBooks] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [inventoryStats, setInventoryStats] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        getDashboardStats().then(res => setOverview(res));
        getInventoryStatsByCategory().then(res => setInventoryStats(res.categoryStats));
    }, []);

    const handleFilter = async () => {
        const reportParams = { fromDate, toDate, period: 'day' };
        const [borrowReturn, topBook, topUser, overdueList] = await Promise.all([
            getBorrowReturnReport(reportParams),
            getMostBorrowedBooks({ fromDate, toDate }),
            getTopBorrowers({ fromDate, toDate }),
            getOverdueBooks({ page: 1, limit: 5 })
        ]);

        setBorrowReturnData(
            mergeBorrowReturnChart(borrowReturn.borrowStatistics, borrowReturn.returnStatistics)
        );
        setTopBooks(topBook.mostBorrowedBooks);
        setTopUsers(topUser.topBorrowers);
        setOverdue(overdueList.overdueBooks);
    };

    const mergeBorrowReturnChart = (borrowed, returned) => {
        const merged = {};
        borrowed.forEach(item => {
            const key = `${item._id.year}-${item._id.month || '01'}-${item._id.day || '01'}`;
            merged[key] = { date: key, borrowed: item.totalBorrowed };
        });
        returned.forEach(item => {
            const key = `${item._id.year}-${item._id.month || '01'}-${item._id.day || '01'}`;
            if (!merged[key]) merged[key] = { date: key };
            merged[key].returned = item.totalReturned;
        });
        return Object.values(merged);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Thống kê tổng quan thư viện</h1>

            <div className="grid grid-cols-2 gap-4">
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border p-2 rounded" />
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border p-2 rounded" />
            </div>
            <button onClick={handleFilter} className="bg-blue-600 text-white px-4 py-2 rounded">Lọc dữ liệu</button>

            {overview && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow p-4">
                        <p className="font-medium">Tổng số sách</p>
                        <p className="text-xl font-bold">{overview.overview.totalBooks}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <p className="font-medium">Người dùng</p>
                        <p className="text-xl font-bold">{overview.overview.totalUsers}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-4">
                        <p className="font-medium">Lượt mượn</p>
                        <p className="text-xl font-bold">{overview.overview.totalBorrowRecords}</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Biểu đồ mượn/trả</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={borrowReturnData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="borrowed" stroke="#8884d8" />
                        <Line type="monotone" dataKey="returned" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow">
                    <h2 className="font-semibold mb-2">Sách được mượn nhiều</h2>
                    <ul className="text-sm space-y-1">
                        {topBooks.map(book => (
                            <li key={book.book._id}>
                                {book.book.title} ({book.borrowCount} lượt)
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <h2 className="font-semibold mb-2">Người dùng mượn nhiều</h2>
                    <ul className="text-sm space-y-1">
                        {topUsers.map(user => (
                            <li key={user.user._id}>
                                {user.user.name} - {user.borrowCount} lượt
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="font-semibold mb-2">Danh sách sách quá hạn</h2>
                <ul className="text-sm space-y-1">
                    {overdue.map(record => (
                        <li key={record._id}>
                            {record.book?.title} - {record.user?.name} ({record.daysOverdue} ngày trễ)
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Report;
