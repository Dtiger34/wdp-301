const Book = require('../model/book');
const Inventory = require('../model/Inventory');
const BorrowRecord = require('../model/borrowHistory');
const Review = require('../model/review');
const BookCopy = require('../model/bookcopies')

////////// book
// @done: get all book
exports.getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalBooks = await Book.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);

    const books = await Book.find()
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name')
      .populate('bookshelf', 'code name location');

    res.status(200).json({
      currentPage: page,
      totalPages,
      totalBooks,
      books,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: get book by id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('categories', 'name')
      .populate('bookshelf', 'code name location');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Get inventory information
    const inventory = await Inventory.findOne({ book: req.params.id });

    // Get reviews for this book
    const reviews = await Review.find({ bookId: req.params.id })
      .populate('userId', 'name studentId')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating =
      reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

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

// @done: update book
exports.updateBook = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      isbn,
      author,
      publisher,
      publishYear,
      description,
      price,
      bookshelf,
    } = req.body;

    const categories = req.body.categories || [];

    const updatedData = {
      title,
      isbn,
      author,
      publisher,
      publishYear,
      description,
      price,
      bookshelf,
      categories: Array.isArray(categories) ? categories : [categories],
    };

    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`; // ✅ nếu có ảnh mới
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updatedData, { new: true })
      .populate('categories', 'name')
      .populate('bookshelf', 'name code location');

    res.json(updatedBook);
  } catch (err) {
    console.error('Update book failed:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
};

// @done: delete book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Xoá cả inventory nếu có
    await Inventory.findOneAndDelete({ book: req.params.id });

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done create book
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      isbn,
      author,
      publisher,
      publishYear,
      description,
      price,
      categories,
      bookshelf,
      quantity
    } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const newBook = new Book({
      title,
      isbn,
      author,
      publisher,
      publishYear: parseInt(publishYear),
      description,
      price: parseFloat(price),
      image: imagePath,
      categories: Array.isArray(categories) ? categories : [categories],
      bookshelf
    });

    const book = await newBook.save();

    // Tạo inventory
    await Inventory.create({
      book: book._id,
      total: quantity || 0,
      available: quantity || 0,
      borrowed: 0,
      damaged: 0,
      lost: 0,
    });

    // Tạo bản sao sách có mã vạch duy nhất
    const bookCopies = [];
    for (let i = 0; i < quantity; i++) {
      const barcode = `BC-${book._id.toString()}-${i + 1}`;  // Mã vạch duy nhất cho mỗi bản sao
      const newBookCopy = new BookCopy({
        book: book._id,
        barcode,
        status: "available"
      });
      bookCopies.push(newBookCopy);
    }

    // Lưu tất cả các bản sao sách
    await BookCopy.insertMany(bookCopies);

    // Thêm bản sao sách vào mảng bản sao sách
    book.bookcopies = bookCopies.map(copy => copy._id);
    await book.save();

    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: error.message });
  }
};

/////////// borrow
// @done: Tạo yêu cầu mượn sách
exports.createBorrowRequest = async (req, res) => {
  try {
    const { bookId, isReadOnSite, notes, dueDate, quantity, borrowDuration } = req.body;
    const userId = req.user.id;

    // Kiểm tra xem sách có tồn tại không
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Kiểm tra tình trạng sẵn có của hàng tồn kho
    const inventory = await Inventory.findOne({ book: bookId });
    if (!inventory || inventory.available < quantity) {
      return res.status(400).json({ message: 'Not enough copies available for borrowing' });
    }

    // Kiểm tra yêu cầu hiện có
    const existingRequest = await BorrowRecord.findOne({
      userId,
      bookId,
      status: { $in: ['pending', 'borrowed'] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'Bạn đã có yêu cầu mượn đang chờ xử lý hoặc đang hoạt động cho cuốn sách này',
      });
    }

    // Validate dueDate
    if (!dueDate || isNaN(new Date(dueDate))) {
      return res.status(400).json({ message: 'Invalid or missing dueDate' });
    }

    // Tạo yêu cầu mượn
    const borrowRequest = await BorrowRecord.create({
      userId,
      bookId,
      dueDate: new Date(dueDate),
      isReadOnSite,
      notes,
      quantity,
      borrowDuration,
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

//////////// Staff
// @done: Lấy danh sách yêu cầu mượn đang pending
exports.getPendingBorrowRequests = async (req, res) => {
  try {
    const pendingRequests = await BorrowRecord.find({ status: 'pending' })
      .populate('userId')
      .populate('bookId')
      .sort({ createdRequestAt: -1 });

    res.status(200).json({
      message: 'Pending borrow requests fetched successfully',
      data: pendingRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: hủy yêu cầu mượn sách của người dùng hiện tại
exports.cancelBorrowRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const borrowRequest = await BorrowRecord.findById(requestId);

    if (!borrowRequest) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (borrowRequest.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only cancel your own requests' });
    }

    if (borrowRequest.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending requests can be cancelled',
      });
    }

    borrowRequest.status = 'declined';
    borrowRequest.notes = 'Cancelled by user';
    await borrowRequest.save();

    res.status(200).json({
      message: 'Borrow request cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: lấy lịch sử mượn sách và đánh giá sách của người dùng hiện tại
exports.getBorrowHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }

    // Get borrow history with pagination
    const borrowHistory = await BorrowRecord.find(query)
      .populate('bookId', 'title author isbn image')
      .populate('processedBy', 'name')
      .populate('fineId')
      .sort({ createdRequestAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await BorrowRecord.countDocuments(query);

    // Get user's reviews
    const reviews = await Review.find({ userId }).populate('bookId', 'title author').sort({ createdAt: -1 });

    res.status(200).json({
      borrowHistory,
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: lấy danh sách tất cả các yêu cầu mượn sách của người dùng hiện tại
exports.getUserBorrowRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await BorrowRecord.find({ userId })
      .populate('bookId', 'title author isbn image')
      .populate('processedBy', 'name')
      .sort({ createdRequestAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: create review
exports.createReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const borrowRecord = await BorrowRecord.findOne({
      userId,
      bookId,
      status: 'returned',
    });

    if (!borrowRecord) {
      return res.status(400).json({
        message: 'You can only review books you have borrowed and returned',
      });
    }

    const existingReview = await Review.findOne({ userId, bookId });
    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this book',
      });
    }

    const review = await Review.create({
      userId,
      bookId,
      rating,
      comment,
    });

    await review.populate('userId', 'name studentId');

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, userId },
      { rating, comment },
      { new: true }
    ).populate('userId', 'name studentId');

    if (!review) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to update it",
      });
    }

    res.status(200).json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({ _id: reviewId, userId });

    if (!review) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to delete it",
      });
    }

    res.status(200).json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: search books
exports.searchBooks = async (req, res) => {
  try {
    const {
      query,
      category,
      bookshelf,
      author,
      publishYear,
      available,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { isbn: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      searchQuery.categories = category;
    }

    if (bookshelf) {
      searchQuery.bookshelf = bookshelf;
    }

    if (author) {
      searchQuery.author = { $regex: author, $options: 'i' };
    }

    if (publishYear) {
      searchQuery.publishYear = publishYear;
    }

    let booksQuery = Book.find(searchQuery)
      .populate('categories', 'name')
      .populate('bookshelf', 'code name location')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    let books = await booksQuery;

    if (available === 'true') {
      const bookIds = books.map((book) => book._id);
      const availableInventory = await Inventory.find({
        book: { $in: bookIds },
        available: { $gt: 0 },
      }).select('book');

      const availableBookIds = availableInventory.map((inv) => inv.book.toString());
      books = books.filter((book) => availableBookIds.includes(book._id.toString()));
    }

    const booksWithInventory = await Promise.all(
      books.map(async (book) => {
        const inventory = await Inventory.findOne({ book: book._id });
        return {
          ...book.toObject(),
          inventory: inventory || { available: 0, total: 0, borrowed: 0, damaged: 0, lost: 0 },
        };
      })
    );

    const total = await Book.countDocuments(searchQuery);

    res.status(200).json({
      books: booksWithInventory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: update book inventory
exports.updateBookInventory = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { total, available, borrowed, damaged, lost } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const inventory = await Inventory.findOne({ book: bookId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found for this book' });
    }

    const newTotal = total !== undefined ? total : inventory.total;
    const newAvailable = available !== undefined ? available : inventory.available;
    const newBorrowed = borrowed !== undefined ? borrowed : inventory.borrowed;
    const newDamaged = damaged !== undefined ? damaged : inventory.damaged;
    const newLost = lost !== undefined ? lost : inventory.lost;

    if (newAvailable + newBorrowed + newDamaged + newLost !== newTotal) {
      return res.status(400).json({
        message: 'Invalid inventory numbers. Total must equal available + borrowed + damaged + lost',
      });
    }

    Object.assign(inventory, {
      total: newTotal,
      available: newAvailable,
      borrowed: newBorrowed,
      damaged: newDamaged,
      lost: newLost,
    });

    await inventory.save();

    res.status(200).json({
      message: 'Book inventory updated successfully',
      inventory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: get book filter
exports.getBookFilter = async (req, res) => {
  try {
    const { current = 1, pageSize = 10, mainText = '', sort = '', category = '', price } = req.query;

    const currentPage = parseInt(current);
    const limit = parseInt(pageSize);
    const skip = (currentPage - 1) * limit;

    const query = {};

    if (mainText) {
      query.$or = [
        { title: { $regex: mainText, $options: 'i' } },
        { author: { $regex: mainText, $options: 'i' } },
        { description: { $regex: mainText, $options: 'i' } },
      ];
    }

    if (category) {
      const categoryArray = category.split(',');
      query.categories = { $in: categoryArray };
    }

    if (price) {
      const [min, max] = price.split('-').map(Number);
      query.price = { $gte: min, $lte: max };
    }

    let sortOption = {};
    if (sort) {
      const [field, order] = sort.startsWith('-') ? [sort.slice(1), -1] : [sort, 1];
      sortOption[field] = order;
    }

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('categories', 'name')
        .populate('bookshelf', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Book.countDocuments(query),
    ]);

    res.status(200).json({
      result: books,
      meta: {
        currentPage,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: currentPage * limit < total,
        hasPrev: currentPage > 1,
      },
    });
  } catch (err) {
    console.error('Lỗi getBookFilter:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};