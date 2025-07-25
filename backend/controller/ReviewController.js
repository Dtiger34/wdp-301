const Review = require('../model/review');
const BorrowRecord = require('../model/borrowHistory');

// [GET] /api/review/can-review/:bookId
exports.canReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params;

        const hasReturned = await BorrowRecord.findOne({
            userId,
            bookId,
            status: 'returned'
        });

        res.json({ canReview: !!hasReturned });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// [POST] /api/review
exports.createReview = async (req, res) => {
    try {
        const { bookId, rating, comment } = req.body;

        const newReview = new Review({
            userId: req.user.id,
            bookId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// [GET] /api/review/:bookId
exports.getReviewsByBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        const reviews = await Review.find({ bookId }).populate('userId', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
