import React, { useEffect, useState } from "react";
import { cancelBorrowRequest, getBorrowedBooksByUser } from "../../services/borrowApiService";
import { getToken, checkUserAuth } from "../../utils/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { createReview } from "../../services/bookService"; // 🆕

const HistoryBorrowByUser = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = getToken();
  const userId = token ? checkUserAuth(token)?.id : null;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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
  const paginatedData = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      case "pendingPickup":
        return "Chờ lấy sách";
      case "borrowed":
        return "Đang mượn";
      case "returned":
        return "Đã trả";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không rõ";
    }
  };

  const handleCancelRequest = async (borrowId) => {
    if (!window.confirm("Bạn có chắc chắn muốn huỷ yêu cầu mượn sách này?")) return;
    try {
      await cancelBorrowRequest(borrowId);
      alert("Đã huỷ yêu cầu mượn sách thành công.");
      const result = await getBorrowedBooksByUser(userId);
      setHistory(result.data || []);
    } catch (err) {
      alert("Không thể huỷ yêu cầu. Vui lòng thử lại sau.");
    }
  };

  const openReviewPopup = (bookId) => {
    setSelectedBookId(bookId);
    setRating(5);
    setComment("");
setIsPopupOpen(true);
  };

  const closeReviewPopup = () => {
    setIsPopupOpen(false);
    setSelectedBookId(null);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBookId) return;

    setSubmittingReview(true);
    try {
      await createReview({ bookId: selectedBookId, rating, comment });
      alert("Đánh giá thành công!");
      closeReviewPopup();
    } catch (error) {
      alert("Gửi đánh giá thất bại!");
    } finally {
      setSubmittingReview(false);
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
            <table style={{
              width: "100%", borderCollapse: "collapse", backgroundColor: "#fff",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: "17px", borderRadius: "10px", overflow: "hidden"
            }}>
              <thead style={{ backgroundColor: "#2c3e50", color: "white" }}>
                <tr>
                  <th style={{ padding: "15px", textAlign: "left", minWidth: "250px" }}>📖 Tên sách & Bản sao</th>
                  <th style={{ padding: "15px", textAlign: "left", minWidth: "160px" }}>📅 Ngày mượn</th>
                  <th style={{ padding: "15px", textAlign: "left", minWidth: "160px" }}>📦 Ngày trả</th>
                  <th style={{ padding: "15px", textAlign: "left", minWidth: "160px" }}> Trạng thái</th>
                  <th style={{ padding: "15px", textAlign: "left", minWidth: "160px" }}>🛑 Hành động</th>
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
                            <li key={copy._id}>📎 <strong>{copy.barcode}</strong> – {copy.status}</li>
                          ))}
                        </ul>
)}
                    </td>
                    <td style={{ padding: "15px" }}>{formatDate(record.createdRequestAt)}</td>
                    <td style={{ padding: "15px" }}>{formatDate(record.returnDate, "Chưa trả")}</td>
                    <td style={{
                      padding: "15px",
                      color: record.status === 'pending' ? 'orange' :
                        record.status === 'borrowed' ? 'blue' :
                          record.status === 'cancelled' ? 'red' : 'green'
                    }}>
                      {renderStatus(record.status)}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {record.status === "pending" && (
                        <button onClick={() => handleCancelRequest(record._id)}
                          style={{ padding: "6px 12px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                          Huỷ yêu cầu
                        </button>
                      )}
                      {record.status === "returned" && (
                        <button onClick={() => openReviewPopup(record.bookId._id)}
                          style={{ padding: "6px 12px", marginTop: "8px", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                          📝 Đánh giá
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && history.length > 0 && (
        <div style={{ textAlign: "center", padding: "10px", borderTop: "1px solid #ddd", backgroundColor: "#f8f9fa" }}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}
            style={{ marginRight: "10px", padding: "6px 14px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "4px" }}>
            ← Trước
          </button>
          <span>Trang <strong>{currentPage}</strong> / {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}
            style={{ marginLeft: "10px", padding: "6px 14px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "4px" }}>
            Tiếp →
          </button>
        </div>
      )}

      {/* 🔽 Popup đánh giá */}
      {isPopupOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
        }}>
          <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", width: "400px", maxWidth: "90%" }}>
            <h3>Đánh giá sách</h3>
            <form onSubmit={handleSubmitReview}>
              <label>Số sao:</label>
<select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: "100%", padding: "6px", marginBottom: "12px" }}>
                {[5, 4, 3, 2, 1].map(star => (
                  <option key={star} value={star}>{star} sao</option>
                ))}
              </select>

              <label>Bình luận:</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Viết cảm nhận..." rows={3}
                style={{ width: "100%", padding: "8px", marginBottom: "12px", resize: "none" }} />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={closeReviewPopup}
                  style={{ marginRight: "10px", padding: "6px 12px" }}>
                  Huỷ
                </button>
                <button type="submit" disabled={submittingReview}
                  style={{ backgroundColor: "#27ae60", color: "#fff", padding: "6px 12px", border: "none", borderRadius: "4px" }}>
                  {submittingReview ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default HistoryBorrowByUser;