import React, { useEffect, useState } from "react";
import {
  getBorrowRequests,
  returnBook,
  extendBorrowPeriod
} from "../../services/borrowApiService";
import StaffDashboard from "./StaffDashboard";

const ViewListBorrowed = () => {
  const [borrowingList, setBorrowingList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [quantities, setQuantities] = useState({ good: 0, damaged: 0, lost: 0 });
  const [notes, setNotes] = useState("");
  const [fineAmount, setFineAmount] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const res = await getBorrowRequests();
      const borrowed = res.borrowRequests?.filter((b) => b.status === "borrowed") || [];
      setBorrowingList(borrowed);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách đang mượn:", error);
    }
  };

  const handleReturnClick = (record) => {
    setSelectedRecord(record);
    setQuantities({ good: 0, damaged: 0, lost: 0 });
    setNotes("");
    setError("");

    const now = new Date();
    const due = new Date(record.dueDate);
    setIsOverdue(now > due);

    setShowModal(true);
  };

  const handleExtendClick = (record) => {
    setSelectedRecord(record);
    setExtendDays(7);
    setShowExtendModal(true);
  };

  useEffect(() => {
    if (!selectedRecord || !selectedRecord.bookId) return;

    const bookPrice = selectedRecord.bookId.price || 0;
    let total = 0;
    const now = new Date();
    const due = new Date(selectedRecord.dueDate);

    if (now > due) {
      const daysLate = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      total += daysLate * 5000;
    }

    total += quantities.damaged * bookPrice * 0.3;
    total += quantities.lost * bookPrice;

    setFineAmount(Math.round(total));
  }, [quantities, selectedRecord]);

  const handleSubmitReturn = async () => {
  const totalEntered = quantities.good + quantities.damaged + quantities.lost;
  const totalBorrowed = selectedRecord.quantity;

  if (Object.values(quantities).some((q) => q < 0)) {
    setError("Không được nhập số âm");
    return;
  }

  if (totalEntered !== totalBorrowed) {
    setError(`Tổng số lượng phải bằng ${totalBorrowed}`);
    return;
  }
    try {
      await returnBook(selectedRecord._id, { quantities, notes });
      alert("✅ Trả sách thành công!");
      setShowModal(false);
      fetchBorrowedBooks();
    } catch (error) {
      alert("❌ Lỗi khi trả sách: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitExtend = async () => {
    try {
      await extendBorrowPeriod(selectedRecord._id, extendDays);
      alert(`✅ Đã gia hạn mượn thêm ${extendDays} ngày`);
      setShowExtendModal(false);
      fetchBorrowedBooks();
    } catch (error) {
      alert("❌ Lỗi khi gia hạn: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <StaffDashboard>
      <div style={{ padding: "40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>
          Danh sách sách đang được mượn
        </h2>

        <div style={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={thStyle}>Tên người mượn</th>
                <th style={thStyle}>Tên sách</th>
                <th style={thStyle}>Ngày mượn</th>
                <th style={thStyle}>Hạn trả</th>
                <th style={thStyle}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {borrowingList.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>
                    Không có sách nào đang được mượn.
                  </td>
                </tr>
              ) : (
                borrowingList.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>{item.userId?.name}</td>
                    <td style={tdStyle}>{item.bookId?.title}</td>
                    <td style={tdStyle}>{new Date(item.createdRequestAt).toLocaleDateString("vi-VN")}</td>
                    <td style={tdStyle}>{new Date(item.dueDate).toLocaleDateString("vi-VN")}</td>
                    <td style={tdStyle}>
                      <button style={{ ...returnBtnStyle, marginRight: "8px" }} onClick={() => handleReturnClick(item)}>
                        ↩ Trả sách
                      </button>
                      <button style={extendBtnStyle} onClick={() => handleExtendClick(item)}>
                        ⏳ Gia hạn
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Trả sách */}
        {showModal && selectedRecord && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>
                Trả sách: <strong>{selectedRecord.bookId?.title}</strong>
              </h3>

              {isOverdue && (
                <div style={{ marginBottom: "16px", color: "#dc2626" }}>
                  ⚠ Quá hạn trả sách
                </div>
              )}

              <label>Sách tốt:</label>
              <input type="number" value={quantities.good} onChange={(e) => setQuantities({...quantities, good: parseInt(e.target.value) || 0})} style={{ padding: "8px", width: "100%", marginBottom: "8px" }} />
              <label>Sách hỏng:</label>
              <input type="number" value={quantities.damaged} onChange={(e) => setQuantities({...quantities, damaged: parseInt(e.target.value) || 0})} style={{ padding: "8px", width: "100%", marginBottom: "8px" }} />
              <label>Sách mất:</label>
              <input type="number" value={quantities.lost} onChange={(e) => setQuantities({...quantities, lost: parseInt(e.target.value) || 0})} style={{ padding: "8px", width: "100%", marginBottom: "8px" }} />

              <label>Ghi chú (nếu có):</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ padding: "8px", width: "100%", marginBottom: "16px" }}
              />

              {error && <div style={{ color: "red", marginBottom: "8px" }}>{error}</div>}

              <div style={{ marginBottom: "16px", fontWeight: "bold" }}>
                Tổng tiền phạt: <span style={{ color: "#ef4444" }}>{fineAmount.toLocaleString()} VND</span>
              </div>

              <div style={{ textAlign: "right" }}>
                <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>Hủy</button>
                <button onClick={handleSubmitReturn} style={confirmBtnStyle}>Xác nhận trả</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gia hạn */}
        {showExtendModal && selectedRecord && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>
                Gia hạn sách: <strong>{selectedRecord.bookId?.title}</strong>
              </h3>

              <label>Gia hạn thêm (ngày):</label>
              <input
                type="number"
                value={extendDays}
                min={1}
                max={30}
                onChange={(e) => setExtendDays(parseInt(e.target.value))}
                style={{ padding: "8px", width: "100%", marginBottom: "16px" }}
              />

              <div style={{ textAlign: "right" }}>
                <button onClick={() => setShowExtendModal(false)} style={cancelBtnStyle}>Hủy</button>
                <button onClick={handleSubmitExtend} style={confirmBtnStyle}>Xác nhận gia hạn</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffDashboard>
  );
};

// Style
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

const returnBtnStyle = {
  backgroundColor: "#3b82f6",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const extendBtnStyle = {
  backgroundColor: "#f59e0b",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const cancelBtnStyle = {
  backgroundColor: "#9ca3af",
  color: "#fff",
  padding: "8px 16px",
  border: "none",
  borderRadius: "4px",
  marginRight: "8px",
};

const confirmBtnStyle = {
  backgroundColor: "#10b981",
  color: "#fff",
  padding: "8px 16px",
  border: "none",
  borderRadius: "4px",
};

const modalOverlay = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "8px",
  width: "400px",
};

export default ViewListBorrowed;
