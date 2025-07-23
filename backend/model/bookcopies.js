const mongoose = require("mongoose");

const bookCopySchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
    },
    barcode: { // mã vạch duy nhất của mỗi sách
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["available","pending","borrowed", "lost", "damaged"],
        default: "available",
    },
    currentBorrower: { // người dùng hiện tại đang mượn
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    dueDate: { //ngày phải trả sách
        type: Date,
        default: null,
    },
    createdAt: { //Thời gian tạo bản sao sách.
        type: Date,
        default: Date.now,
    },
    updatedAt: { // Thời gian cập nhật bản sao sách.
        type: Date,
        default: Date.now,
    },
});

bookCopySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("BookCopy", bookCopySchema);
