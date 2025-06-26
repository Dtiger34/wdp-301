const Bookshelf = require('../model/bookshelf');

// Create new bookshelf
exports.createBookshelf = async (req, res) => {
  try {
    const shelf = new Bookshelf(req.body);
    await shelf.save();
    res.status(201).json(shelf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all bookshelves
exports.getAllBookshelves = async (req, res) => {
  try {
    const shelves = await Bookshelf.find().sort({ createdAt: -1 });
    res.json(shelves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single bookshelf by ID
exports.getBookshelfById = async (req, res) => {
  try {
    const shelf = await Bookshelf.findById(req.params.id);
    if (!shelf) return res.status(404).json({ error: 'Bookshelf not found' });
    res.json(shelf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update bookshelf
exports.updateBookshelf = async (req, res) => {
  try {
    const shelf = await Bookshelf.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!shelf) return res.status(404).json({ error: 'Bookshelf not found' });
    res.json(shelf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete bookshelf
exports.deleteBookshelf = async (req, res) => {
  try {
    const shelf = await Bookshelf.findByIdAndDelete(req.params.id);
    if (!shelf) return res.status(404).json({ error: 'Bookshelf not found' });
    res.json({ message: 'Bookshelf deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy thống kê sách theo từng giá sách
exports.getBookshelfStats = async (req, res) => {
  try {
    const Book = require('../model/book');
    const Inventory = require('../model/Inventory');

    const bookshelves = await Bookshelf.find().sort({ code: 1 });
    const stats = [];

    for (const bookshelf of bookshelves) {
      // Get books on this bookshelf
      const books = await Book.find({ bookshelf: bookshelf._id });
      const bookIds = books.map((book) => book._id);

      // Get inventory stats for books on this bookshelf
      const inventoryStats = await Inventory.aggregate([
        { $match: { book: { $in: bookIds } } },
        {
          $group: {
            _id: null,
            totalBooks: { $sum: '$total' },
            availableBooks: { $sum: '$available' },
            borrowedBooks: { $sum: '$borrowed' },
            damagedBooks: { $sum: '$damaged' },
            lostBooks: { $sum: '$lost' },
          },
        },
      ]);

      const stat = inventoryStats[0] || {
        totalBooks: 0,
        availableBooks: 0,
        borrowedBooks: 0,
        damagedBooks: 0,
        lostBooks: 0,
      };

      stats.push({
        bookshelf: {
          _id: bookshelf._id,
          code: bookshelf.code,
          name: bookshelf.name,
          location: bookshelf.location,
        },
        bookTitles: books.length,
        ...stat,
      });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Di chuyển sách từ giá sách này sang giá sách khác
exports.moveBooks = async (req, res) => {
  try {
    const { fromBookshelfId, toBookshelfId, bookIds } = req.body;

    // Validate bookshelves exist
    const fromBookshelf = await Bookshelf.findById(fromBookshelfId);
    const toBookshelf = await Bookshelf.findById(toBookshelfId);

    if (!fromBookshelf || !toBookshelf) {
      return res.status(404).json({ message: 'One or both bookshelves not found' });
    }

    // Update books' bookshelf
    const Book = require('../model/book');
    const result = await Book.updateMany(
      {
        _id: { $in: bookIds },
        bookshelf: fromBookshelfId,
      },
      {
        bookshelf: toBookshelfId,
        updatedAt: Date.now(),
      }
    );

    res.status(200).json({
      message: `Successfully moved ${result.modifiedCount} books from ${fromBookshelf.name} to ${toBookshelf.name}`,
      movedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};