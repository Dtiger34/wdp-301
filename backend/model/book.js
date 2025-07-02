const mongoose = require("mongoose");
const bookcopies = require("./bookcopies");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isbn: { type: String, required: true, unique: true }, // mã ISBN duy nhất
  author: String,
  publisher: String,
  publishYear: Number,
  description: String,
  price: Number,
  image: String,
  bookcopies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCopy",
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  bookshelf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bookshelf",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

bookSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Book", bookSchema);