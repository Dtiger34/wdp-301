const mongoose = require('mongoose'); // Nhúng thư viện Mongoose để kết nối và làm việc với MongoDB
const dotenv = require("dotenv"); // Nhúng thư viện dotenv để đọc các biến môi trường từ file .env
dotenv.config(); // Tải các biến môi trường từ file .env vào process.env

// Hàm bất đồng bộ để kết nối tới MongoDB
const connectionDB = async () => {
    try {
        // Thực hiện kết nối tới MongoDB thông qua biến môi trường MONGO_URI
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connect to MongoDB successfully!"); // In ra thông báo nếu kết nối thành công
    } catch (error) {
        // Nếu có lỗi trong quá trình kết nối, in lỗi ra console
        console.error("Connection to MongoDB failse: " + error);
        process.exit(1); // Thoát khỏi quá trình chạy server với mã lỗi 1
    }
};

module.exports = connectionDB; // Xuất hàm connectionDB để sử dụng ở file khác (thường là trong server.js)
