const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    barcode: { type: String, unique: true, required: true },  // mã vạch riêng của bản sao sách
    status: { type: String, enum: ['available', 'borrowed', 'lost', 'damaged'], default: 'available' },
    location: String,       // ví dụ kệ sách, phòng, tầng,...
    addedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

inventorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
