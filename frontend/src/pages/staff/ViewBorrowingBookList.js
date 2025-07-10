import React, { useEffect, useState } from "react";
import { getBorrowRequests } from "../../services/borrowApiService";
import StaffDashboard from "./StaffDashboard";

const ViewBorrowingBookList = () => {
  const [borrowingList, setBorrowingList] = useState([]);

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
              </tr>
            </thead>
            <tbody>
              {borrowingList.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>
                    Không có sách nào đang được mượn.
                  </td>
                </tr>
              ) : (
                borrowingList.map((item) => (
                  <tr key={item._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>{item.userId?.name}</td>
                    <td style={tdStyle}>{item.bookId?.title}</td>
                    <td style={tdStyle}>
                      {item.createdRequestAt ? new Date(item.createdRequestAt).toLocaleDateString("vi-VN") : "--"}
                    </td>
                    <td style={tdStyle}>
                      {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

export default ViewBorrowingBookList;
