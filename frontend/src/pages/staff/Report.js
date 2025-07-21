import React, { useEffect, useState } from 'react';
import {
    getDashboardStats, getBorrowReturnReport, getMostBorrowedBooks, getTopBorrowers, getOverdueBooks, getInventoryStatsByCategory
} from '../../services/reportService';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import StaffDashboard from './StaffDashboard';


const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Report = () => {
    const [overview, setOverview] = useState(null);
    const [borrowReturnData, setBorrowReturnData] = useState([]);
    const [topBooks, setTopBooks] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [inventoryStats, setInventoryStats] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    useEffect(() => {
        getDashboardStats().then(res => setOverview(res));
        getInventoryStatsByCategory().then(res => {
            setInventoryStats(res.categoryStats);
            if (res.categoryStats.length > 0) {
                setSelectedCategoryId(res.categoryStats[0].category._id);
            }
        });
    }, []);

    const handleFilter = async () => {
        const reportParams = { fromDate, toDate, period: 'day' };
        const [borrowReturn, topBook, topUser, overdueList] = await Promise.all([
            getBorrowReturnReport(reportParams),
            getMostBorrowedBooks({ fromDate, toDate }),
            getTopBorrowers({ fromDate, toDate }),
            getOverdueBooks({ page: 1, limit: 5 })
        ]);

        setBorrowReturnData(mergeBorrowReturnChart(borrowReturn.borrowStatistics, borrowReturn.returnStatistics));
        setTopBooks(topBook.mostBorrowedBooks);
        setTopUsers(topUser.topBorrowers);
        setOverdue(overdueList.overdueBooks);
    };

    const mergeBorrowReturnChart = (borrowed, returned) => {
        const merged = {};

        // Gom dữ liệu mượn
        borrowed.forEach(item => {
            const key = `${item._id.year}-${item._id.month || '01'}-${item._id.day || '01'}`;
            if (!merged[key]) merged[key] = { date: key };
            merged[key].borrowed = item.totalBorrowed;
        });

        // Gom dữ liệu trả
        returned.forEach(item => {
            const key = `${item._id.year}-${item._id.month || '01'}-${item._id.day || '01'}`;
            if (!merged[key]) merged[key] = { date: key };
            merged[key].returned = item.totalReturned;
        });

        // Gán mặc định 0 nếu thiếu
        Object.values(merged).forEach(item => {
            if (item.borrowed === undefined) item.borrowed = 0;
            if (item.returned === undefined) item.returned = 0;
        });

        // Sắp xếp theo ngày để biểu đồ không bị lộn xộn
        return Object.values(merged).sort((a, b) => new Date(a.date) - new Date(b.date));
    };


    const selectedCategory = inventoryStats.find(cat => cat.category._id === selectedCategoryId);
    const pieData = selectedCategory
        ? [
            { name: 'Có sẵn', value: selectedCategory.inventory.available },
            { name: 'Đang mượn', value: selectedCategory.inventory.borrowed },
            { name: 'Hư hỏng', value: selectedCategory.inventory.damaged },
            { name: 'Mất', value: selectedCategory.inventory.lost },
        ]
        : [];

    return (
        <StaffDashboard>
            <motion.div initial="hidden" animate="show" variants={fadeIn} style={{ padding: '24px', background: '#f9f9f9', minHeight: '100vh' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-end' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>📊 Thống kê thư viện</h1>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ fontSize: '14px' }}>Từ ngày</label>
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '14px' }}>Đến ngày</label>
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        </div>
                        <button onClick={handleFilter} style={{ padding: '10px 16px', background: '#333', color: '#fff', borderRadius: '6px', border: 'none' }}>Lọc</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '14px' }}>Tổng số sách</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{overview?.overview.totalBooks}</p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '14px' }}>Người dùng</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{overview?.overview.totalUsers}</p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '14px' }}>Sách quá hạn</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{overdue.length}</p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '14px' }}>Tồn kho hiện tại</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{inventoryStats.reduce((sum, stat) => sum + stat.inventory.available, 0)}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>📈 Biểu đồ mượn/trả sách</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={borrowReturnData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="borrowed" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="returned" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>📦 Tồn kho theo thể loại</h2>
                        <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} style={{ marginBottom: '16px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                            {inventoryStats.map(stat => (
                                <option key={stat.category._id} value={stat.category._id}>{stat.category.name}</option>
                            ))}
                        </select>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {pieData.map((_, index) => <Cell
                                        key={index}
                                        fill={
                                            pieData[index].name === 'Có sẵn'
                                                ? '#3b82f6'
                                                : pieData[index].name === 'Đang mượn'
                                                    ? '#10b981'
                                                    : pieData[index].name === 'Hư hỏng'
                                                        ? '#f59e0b'
                                                        : '#ef4444'
                                        }
                                    />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>📚 Sách được mượn nhiều</h2>
                        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                            {topBooks.map(book => (
                                <li key={book.book._id}>{book.book.title} ({book.borrowCount} lượt)</li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>👤 Người dùng mượn nhiều</h2>
                        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                            {topUsers.map(user => (
                                <li key={user.user._id}>{user.user.name} - {user.borrowCount} lượt</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginTop: '32px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>📕 Danh sách sách quá hạn</h2>
                    <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #ccc' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Sách</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Người mượn</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Ngày trễ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overdue.map(record => (
                                <tr key={record._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{record.book?.title}</td>
                                    <td style={{ padding: '8px' }}>{record.user?.name}</td>
                                    <td style={{ padding: '8px' }}>{record.daysOverdue} ngày</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </StaffDashboard>
    );
};

export default Report;
