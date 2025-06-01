const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRecord', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
});

fineSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Fine', fineSchema);
