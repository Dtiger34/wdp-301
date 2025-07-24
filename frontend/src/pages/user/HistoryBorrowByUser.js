import React, { useEffect, useState } from "react";
import { getBorrowedBooksByUser } from "../../services/borrowApiService";
import { getToken, checkUserAuth } from "../../utils/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const HistoryBorrowByUser = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const token = getToken();
    const userId = token ? checkUserAuth(token)?.id : null;

    useEffect(() => {
        if (!userId) {
            setError("Người dùng chưa đăng nhập.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const result = await getBorrowedBooksByUser(userId);
                setHistory(result.data || []);
            } catch (err) {
                setError("Không thể tải lịch sử mượn trả.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const totalPages = Math.ceil(history.length / itemsPerPage);
    const paginatedData = history.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const formatDate = (dateStr, fallback = "Không rõ") => {
        if (!dateStr) return fallback;
        const d = new Date(dateStr);
        return isNaN(d) ? fallback : d.toLocaleDateString("vi-VN");
    };

    const renderStatus = (status) => {
        switch (status) {
            case "pending":
                return "Đang chờ duyệt";
            case "borrowed":
                return "Đang mượn";
            case "returned":
                return "Đã trả";
            default:
                return "Không rõ";
        }
    };


    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontSize: "18px" }}>
            <Header />
            <div style={{ flex: 1, padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                <h2 style={{ textAlign: "center", marginBottom: "40px", fontSize: "28px", color: "#2c3e50" }}>
                    📚 Lịch sử mượn trả của bạn
                </h2>

                {loading && <p style={{ textAlign: "center" }}>Đang tải...</p>}
                {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

                {!loading && !error && history.length === 0 && (
                    <p style={{ textAlign: "center" }}>Bạn chưa có lịch sử mượn sách.</p>
                )}

                {!loading && paginatedData.length > 0 && (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                backgroundColor: "#fff",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                                fontSize: "17px",
                                borderRadius: "10px",
                                overflow: "hidden"
                            }}
                        >
                            <thead style={{ backgroundColor: "#2c3e50", color: "white" }}>
                                <tr>
                                    <th style={{ padding: "15px", textAlign: "left", minWidth: "250px" }}>📖 Tên sách & Bản sao</th>
                                    <th style={{ padding: "15px", textAlign: "left", minWidth: "160px" }}>📅 Ngày mượn</th>
                                    <th style={{ padding: "15px", textAlign: "left", minWidth: "160px" }}>📦 Ngày trả</th>
                                    <th style={{ padding: "15px", textAlign: "left", minWidth: "160px" }}>🔥 Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((record, index) => (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                                        <td style={{ padding: "15px" }}>
                                            <div>{record.bookId?.title || "Không rõ"}</div>
                                            {record.bookCopies?.length > 0 && (
                                                <ul style={{ marginTop: "5px", paddingLeft: "20px", fontSize: "15px", color: "#555" }}>
                                                    {record.bookCopies.map((copy) => (
                                                        <li key={copy._id}>
                                                            📎 <strong>{copy.barcode}</strong> – {copy.status}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                        <td style={{ padding: "15px" }}>
                                            {formatDate(record.createdRequestAt)}
                                        </td>
                                        <td style={{ padding: "15px" }}>
                                            {formatDate(record.returnDate, "Chưa trả")}
                                        </td>
                                        <td style={{ padding: "15px", color: record.status === 'pending' ? 'orange' : record.status === 'borrowed' ? 'blue' : 'green' }}>
                                            {renderStatus(record.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!loading && history.length > 0 && (
                <div
                    style={{
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "#f8f9fa",
                        padding: "10px 0",
                        borderTop: "1px solid #ddd",
                        textAlign: "center",
                        fontSize: "16px",
                        zIndex: 999
                    }}
                >
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        style={{
                            padding: "6px 14px",
                            marginRight: "10px",
                            backgroundColor: "#3498db",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer"
                        }}
                    >
                        ← Trước
                    </button>
                    <span style={{ margin: "0 10px" }}>
                        Trang <strong>{currentPage}</strong> / {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "6px 14px",
                            marginLeft: "10px",
                            backgroundColor: "#3498db",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                        }}
                    >
                        Tiếp →
                    </button>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default HistoryBorrowByUser;
