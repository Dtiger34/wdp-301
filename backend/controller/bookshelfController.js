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
