const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: String,
    publisher: String,
    publishYear: Number,
    isbn: { type: String, unique: true, sparse: true },
    barcode: { type: String, unique: true, sparse: true },
    category: String,
    quantity: { type: Number, default: 1 },
    status: { type: String, enum: ['available', 'lost', 'damaged'], default: 'available' },
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

bookSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Book', bookSchema);
