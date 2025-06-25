const Book = require('../model/book');
const Inventory = require('../model/Inventory');
const BorrowRecord = require('../model/borrowHistory');
const Review = require('../model/review');

// Lấy tất cả sách
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('categories', 'name')
      .populate('bookshelf', 'code name location');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết 1 sách
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('categories', 'name')
      .populate('bookshelf', 'code name location');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const inventory = await Inventory.findOne({ book: req.params.id });
    const reviews = await Review.find({ bookId: req.params.id })
      .populate('userId', 'name studentId')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const bookDetails = {
      ...book.toObject(),
      inventory: inventory || { available: 0, total: 0, borrowed: 0 },
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    };

    res.status(200).json(bookDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo yêu cầu mượn sách
exports.createBorrowRequest = async (req, res) => {
  try {
    const { bookId, isReadOnSite, notes, dueDate } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const inventory = await Inventory.findOne({ book: bookId });
    if (!inventory || inventory.available <= 0)
      return res.status(400).json({ message: 'Book is not available for borrowing' });

    const existingRequest = await BorrowRecord.findOne({
      userId,
      bookId,
      status: { $in: ['pending', 'borrowed'] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have a pending or active borrow request for this book',
      });
    }

    if (!dueDate || isNaN(new Date(dueDate))) {
      return res.status(400).json({ message: 'Invalid or missing dueDate' });
    }

    const borrowRequest = await BorrowRecord.create({
      userId,
      bookId,
      dueDate: new Date(dueDate),
      isReadOnSite,
      notes,
      status: 'pending',
    });

    await borrowRequest.populate(['userId', 'bookId']);

    res.status(201).json({
      message: 'Borrow request created successfully',
      borrowRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
