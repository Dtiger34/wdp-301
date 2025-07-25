const express = require('express');
const router = express.Router();
const reviewController = require('../controller/ReviewController');
const { authenticateUser } = require('../middlewares/authMiddleware');

router.get('/can-review/:bookId', authenticateUser, reviewController.canReview);
router.post('/', authenticateUser, reviewController.createReview);
router.get('/:bookId', reviewController.getReviewsByBook);

module.exports = router;
