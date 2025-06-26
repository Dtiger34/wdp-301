import React, { useEffect, useState } from "react";
import { getPendingBorrowRequests } from "../../services/borrowApiService";

const ViewListRequest = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await getPendingBorrowRequests();
            console.log("✅ Pending requests:", res);
            setRequests(res.data); // dùng đúng `res.data`, vì API trả về { message, data: [...] }
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách:", error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách yêu cầu mượn sách</h2>
            <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">Tên người mượn</th>
                        <th className="border px-4 py-2">Tên sách</th>
                        <th className="border px-4 py-2">Số lượng</th>
                        <th className="border px-4 py-2">Thời hạn trả</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-4 text-gray-500">
                                Không có yêu cầu nào đang chờ duyệt
                            </td>
                        </tr>
                    ) : (
                        requests.map((req) => (
                            <tr key={req._id}>
                                <td className="border px-4 py-2">{req.userId?.name}</td>
                                <td className="border px-4 py-2">{req.bookId?.title}</td>
                                <td className="border px-4 py-2">1</td>
                                <td className="border px-4 py-2">
                                    {new Date(req.dueDate).toLocaleDateString("vi-VN")}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ViewListRequest;