const Category = require("../model/categories");
const Book = require('../model/book');
const mongoose = require('mongoose')// Create new category
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = new mongoose.Types.ObjectId(req.params.id);

    // Kiểm tra sách có chứa category trong mảng không
    const bookCount = await Book.countDocuments({ categories: categoryId });

    if (bookCount > 0) {
      return res.status(400).json({
        error: "Không thể xoá. Vẫn còn cuốn sách đang thuộc danh mục này.,"
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật hoặc gán lại sách cho thể loại khác
exports.updateBookCategory = async (req, res) => {
  try {
    const { bookId, newCategoryIds } = req.body;

    // Kiểm tra nếu thông tin truyền vào là hợp lệ
    if (!bookId || !newCategoryIds || !Array.isArray(newCategoryIds)) {
      return res.status(400).json({ message: 'Invalid request. bookId and newCategoryIds are required.' });
    }

    // Kiểm tra xem sách có tồn tại trong cơ sở dữ liệu không
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Kiểm tra xem thể loại mới có tồn tại trong cơ sở dữ liệu không
    const categories = await Category.find({ '_id': { $in: newCategoryIds } });
    if (categories.length !== newCategoryIds.length) {
      return res.status(404).json({ message: 'One or more categories not found' });
    }

    // Cập nhật thể loại cho sách
    book.categories = newCategoryIds;
    await book.save();

    // Trả về thông tin sách sau khi cập nhật
    const updatedBook = await Book.findById(bookId)
      .populate('categories', 'name')
      .populate('bookshelf', 'name');

    res.status(200).json({
      message: 'Book categories updated successfully',
      updatedBook
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};