const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    type: { type: String, required: true }, // ví dụ 'borrow_stats', 'lost_books', ...
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // lưu dữ liệu báo cáo dạng JSON
    generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
