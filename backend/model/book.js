const mongoose = require('mongoose'); // Import mongoose để định nghĩa schema cho MongoDB

// Định nghĩa schema cho sách (Book)
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Tên sách (bắt buộc, có thể trùng giữa các bản sao)
    isbn: { type: String, required: true, unique: true }, // Mã ISBN duy nhất cho mỗi cuốn sách

    author: String, // Tên tác giả
    publisher: String, // Nhà xuất bản
    publishYear: Number, // Năm xuất bản
    description: String, // Mô tả sách
    price: Number, // Giá tiền (có thể dùng để thống kê, hiển thị)
    image: String, // Đường dẫn ảnh bìa sách (URL hoặc filename)

    categories: [{ // Danh sách thể loại của sách
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến collection 'Category'
        ref: 'Category'
    }],

    bookshelf: { // Vị trí kệ sách
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến collection 'Bookshelf'
        ref: 'Bookshelf'
    },

    createdAt: { type: Date, default: Date.now }, // Thời điểm tạo
    updatedAt: { type: Date, default: Date.now }  // Thời điểm cập nhật gần nhất
});

// Middleware: trước khi lưu, cập nhật lại updatedAt
bookSchema.pre('save', function (next) {
    this.updatedAt = Date.now(); // Ghi nhận thời gian cập nhật mới nhất
    next(); // Tiếp tục lưu
});

module.exports = mongoose.model('Book', bookSchema); // Export model Book để dùng ở nơi khác (controller, router, etc.)
