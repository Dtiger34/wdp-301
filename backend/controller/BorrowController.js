const borrow = require('../models/BorrowRecord');
const Book = require('../models/Book');
const Inventory = require('../models/Inventory');

exports.acceptBorrowRequest = async (req, res) => {
    try {
        const { borrowId } = req.params;
        const borrowRecord = await borrow.findById(borrowId);

        if (!borrowRecord) {
            return res.status(404).json({ message: 'Borrow request not found' });
        }

        if (borrowRecord.status !== 'pending') {
            return res.status(400).json({ message: 'Borrow request is not pending' });
        }

        borrowRecord.status = 'borrowed';
        borrowRecord.borrowedAt = new Date();
        await borrowRecord.save();

        const inventory = await Inventory.findOne({ book: borrowRecord.bookId });
        if (inventory) {
            inventory.available -= 1;
            inventory.borrowed += 1;
            await inventory.save();
        }

        res.status(200).json(borrowRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
