import React, { useEffect, useState } from "react";
import {
  getPendingBorrowRequests,
  acceptBorrowRequest,
  confirmBookPickup
} from "../../services/borrowApiService";
import StaffDashboard from '../staff/StaffDashboard';

const ViewListRequest = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getPendingBorrowRequests();
      setRequests(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách:", error);
    }
  };

  const handleAcceptBorrowRequest = async (borrowId) => {
    try {
      await acceptBorrowRequest(borrowId);
      alert("Đã chấp nhận yêu cầu mượn");
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleConfirmPickup = async (borrowId) => {
    try {
      await confirmBookPickup(borrowId);
      alert("Đã xác nhận người dùng đến lấy sách");
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <StaffDashboard>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "250vh", backgroundColor: "#f9fafb" }}>
        <main style={{ flex: 1 }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#374151", marginBottom: "24px" }}>
              Danh sách yêu cầu mượn sách
            </h2>

            <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                  <tr>
                    <th style={thStyle}>Tên người mượn</th>
                    <th style={thStyle}>Tên sách</th>
                    <th style={thStyle}>Số lượng</th>
                    <th style={thStyle}>Hình thức</th>
                    <th style={thStyle}>Thời hạn trả</th>
                    <th style={{ ...thStyle, textAlign: "center", width: "300px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>
                        Không có yêu cầu nào đang chờ xử lý
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={tdStyle}>{req.userId?.name}</td>
                        <td style={tdStyle}>{req.bookId?.title}</td>
                        <td style={tdStyle}>{req.quantity}</td>
                        <td style={tdStyle}>{req.isReadOnSite ? "Đọc tại chỗ" : "Mượn mang về"}</td>
                        <td style={tdStyle}>{new Date(req.dueDate).toLocaleDateString("vi-VN")}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {req.status === "pending" ? (
                            <button
                              style={approveBtnStyle}
                              onClick={() => handleAcceptBorrowRequest(req._id)}
                            >
                              ✔ Chấp nhận
                            </button>
                          ) : req.status === "pendingPickup" ? (
                            <button
                              style={pickupBtnStyle}
                              onClick={() => handleConfirmPickup(req._id)}
                            >
                              📦 Xác nhận đến lấy
                            </button>
                          ) : null}
                          <button style={rejectBtnStyle}>✖ Hủy</button>
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

const approveBtnStyle = {
  backgroundColor: "#10b981",
  color: "#fff",
  padding: "6px 12px",
  marginRight: "8px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const pickupBtnStyle = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  padding: "6px 12px",
  marginRight: "8px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const rejectBtnStyle = {
  backgroundColor: "#ef4444",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default ViewListRequest;
