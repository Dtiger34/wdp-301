import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingBorrowRequests,
  acceptBorrowRequest,
  declineBorrowRequest,
} from "../../services/borrowApiService";
import StaffDashboard from "../staff/StaffDashboard";

const ViewListRequest = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await getPendingBorrowRequests();
      setRequests(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu mượn:", error);
    }
  };

  const handleAcceptBorrowRequest = async (borrowId) => {
    try {
      await acceptBorrowRequest(borrowId);
      alert("Đã chấp nhận yêu cầu mượn.");
      fetchRequests();
      navigate("/staff/view-borrowing-books");
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu mượn sách:", error);
      alert(error.response?.data?.message || "Không thể chấp nhận yêu cầu mượn sách.");
    }
  };

  const openDeclineModal = (borrowId) => {
    setSelectedRequestId(borrowId);
    setDeclineReason("");
    setShowModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!declineReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      await declineBorrowRequest(selectedRequestId, declineReason);
      alert("Đã từ chối yêu cầu mượn.");
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu mượn sách:", error);
      alert(error.response?.data?.message || "Không thể hủy yêu cầu mượn sách.");
    }
  };

  return (
    <StaffDashboard>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
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
                    <th style={thStyle}>Thời hạn trả</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>
                        Không có yêu cầu nào đang chờ duyệt
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={tdStyle}>{req.userId?.name}</td>
                        <td style={tdStyle}>{req.bookId?.title}</td>
                        <td style={tdStyle}>{req.quantity}</td>
                        <td style={tdStyle}>
                          {new Date(req.dueDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <button
                            style={approveBtnStyle}
                            onClick={() => handleAcceptBorrowRequest(req._id)}
                          >
                            ✔ Chấp nhận
                          </button>
                          <button
                            style={rejectBtnStyle}
                            onClick={() => openDeclineModal(req._id)}
                          >
                            ✖ Hủy
                          </button>
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

      {/* Modal từ chối */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Lý do từ chối yêu cầu mượn</h3>
            <textarea
              style={textareaStyle}
              placeholder="Nhập lý do từ chối..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button style={cancelBtnStyle} onClick={() => setShowModal(false)}>Hủy</button>
              <button style={confirmBtnStyle} onClick={handleDeclineConfirm}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </StaffDashboard>
  );
};

// Style phần bảng
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

const rejectBtnStyle = {
  backgroundColor: "#ef4444",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

// Style modal popup
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "24px",
  width: "400px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
};

const textareaStyle = {
  width: "100%",
  minHeight: "100px",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
  resize: "vertical",
};

const cancelBtnStyle = {
  backgroundColor: "#9ca3af",
  color: "#fff",
  padding: "6px 12px",
  marginRight: "8px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const confirmBtnStyle = {
  backgroundColor: "#ef4444",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default ViewListRequest;
