const bookCopySchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
    },
    barcode: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["available", "borrowed", "lost", "damaged"],
        default: "available",
    },
    currentBorrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    dueDate: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

bookCopySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("BookCopy", bookCopySchema);
