import React, { useEffect, useState } from "react";
import { getAllReturnHistory } from "../../services/borrowApiService";
import StaffDashboard from "../staff/StaffDashboard";

const HistoryReturnBook = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await getAllReturnHistory();
            setHistory(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy lịch sử trả sách:", error);
        }
    };

    // Hàm để dịch trạng thái sách
    const translateBookStatus = (status) => {
        switch (status) {
            case "available":
                return "Tốt";
            case "damaged":
                return "Hỏng";
            default:
                return status; // hoặc "Khác"
        }
    };

    return (
        <StaffDashboard>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
                <main style={{ flex: 1 }}>
                    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px" }}>
                        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#374151", marginBottom: "24px" }}>
                            Lịch sử trả sách
                        </h2>

                        <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                                    <tr>
                                        <th style={thStyle}>Người mượn</th>
                                        <th style={thStyle}>Tên sách</th>
                                        <th style={thStyle}>Mã sách & Trạng thái</th>
                                        <th style={thStyle}>Số lượng</th>
                                        <th style={thStyle}>Ngày mượn</th>
                                        <th style={thStyle}>Ngày trả</th>
                                        <th style={thStyle}>Ghi chú</th>
                                        <th style={thStyle}>Tiền phạt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>
                                                Không có lịch sử trả sách
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((record) => (
                                            <tr key={record._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                                <td style={tdStyle}>{record.userId?.name || "Không rõ"}</td>
                                                <td style={tdStyle}>{record.bookId?.title}</td>
                                                <td style={tdStyle}>
                                                    {record.bookCopies?.map((copy) => (
                                                        <div key={copy._id}>
                                                            <strong>{copy.barcode}</strong> - {translateBookStatus(copy.status)}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td style={tdStyle}>{record.quantity || 1}</td>
                                                <td style={tdStyle}>
                                                    {record.borrowDate ? new Date(record.borrowDate).toLocaleDateString("vi-VN") : "-"}
                                                </td>
                                                <td style={tdStyle}>
                                                    {record.returnDate ? new Date(record.returnDate).toLocaleDateString("vi-VN") : "Chưa trả"}
                                                </td>
                                                <td style={tdStyle}>{record.notes || "-"}</td>
                                                <td style={tdStyle}>
                                                    {record.fine?.amount ? `${record.fine.amount.toLocaleString()}₫` : "Không"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </StaffDashboard>
    );
};

const thStyle = {
    padding: "16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
};

const tdStyle = {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
};

export default HistoryReturnBook;