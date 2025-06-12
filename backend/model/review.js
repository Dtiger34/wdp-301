const mongoose = require('mongoose'); // Import mongoose để định nghĩa schema

// Định nghĩa schema cho đánh giá sách (Review)
const reviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến người dùng đã đánh giá
        ref: 'User', 
        required: true 
    },
    bookId: { 
        type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến sách được đánh giá
        ref: 'Book', 
        required: true 
    },
    rating: { 
        type: Number, // Điểm đánh giá
        min: 1,       // Tối thiểu là 1
        max: 5,       // Tối đa là 5
        required: true 
    },
    comment: String, // Nội dung bình luận (không bắt buộc)

    createdAt: { type: Date, default: Date.now }, // Ngày tạo đánh giá
    updatedAt: { type: Date, default: Date.now }  // Ngày cập nhật gần nhất
});

// Middleware: cập nhật thời gian updatedAt trước khi lưu vào DB
reviewSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Review', reviewSchema); // Export model Review để sử dụng trong controller/router
