const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
    // Thông tin liên kết
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    fineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fine'
    },

    // Thời gian mượn - trả
    borrowDate: Date, // thời điểm mà sách được mượn, tức là ngày mà người dùng nhận sách
    dueDate: { // đây là thời điểm mà sách phải được trả lại
        type: Date,
        required: true
    },
    returnDate: Date,
    updatedBrrowAt: Date, // log thời gia hạn mượn sách, chỉ lưu mốc thời gian mượn, không phải hạn trả sau khi gia hạn
    // Trạng thái và xử lý
    status: {
        type: String,
        enum: [
            'pending',    // chờ duyệt
            'declined',   // system từ chối
            'borrowed',   // đã mượn
            'returned',   // đã trả
            'overdue',    // quá hạn
            'lost',        // làm mất
            'pendingPickup', // chờ user đến lấy sách
            'cancelled' // huỷ yêu cầu mượn
        ],
        default: 'pending'
    },
    isReadOnSite: {
        type: Boolean,
        default: false
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Ghi chú và metadata
    notes: String,
    createdRequestAt: { // thời gian bắt đầu request mượn, status 'pending'
        type: Date,
        default: Date.now
    },

    // Số lượng sách người dùng yêu cầu mượn
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },

    bookCopies: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BookCopy',
            required: true
        },
        barcode: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["available", "borrowed", "lost", "damaged", "pending"],
            default: "available",
        },
    }],
});

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
