const express = require('express');
const router = express.Router();
const bookshelfController = require('../controller/bookshelfController');

router.post('/', bookshelfController.createBookshelf);
router.get('/', bookshelfController.getAllBookshelves);
router.get('/:id', bookshelfController.getBookshelfById);
router.put('/:id', bookshelfController.updateBookshelf);
router.delete('/:id', bookshelfController.deleteBookshelf);

module.exports = router;
