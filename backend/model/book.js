const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Tên sách (bắt buộc, có thể trùng giữa các bản sao)
    isbn: { type: String, required: true, unique: true }, // Mã ISBN duy nhất cho mỗi cuốn sách

    author: String,
    publisher: String,
    publishYear: Number, 
    description: String, 
    price: Number,
    image: String,

    categories: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],

    bookshelf: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bookshelf'
    },

    createdAt: { type: Date, default: Date.now }, 
    updatedAt: { type: Date, default: Date.now }  
});

// Middleware: trước khi lưu, cập nhật lại updatedAt
bookSchema.pre('save', function (next) {
    this.updatedAt = Date.now(); // Ghi nhận thời gian cập nhật mới nhất
    next(); // Tiếp tục lưu
});

module.exports = mongoose.model('Book', bookSchema); 
