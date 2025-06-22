const express = require('express');
const router = express.Router();
const bookshelfController = require('../controller/bookshelfController');
const jwtConfig = require('../config/jwtconfig');


router.post('/', jwtConfig.requireAdminOrStaff, bookshelfController.createBookshelf);
router.get('/', jwtConfig.requireAdminOrStaff, bookshelfController.getAllBookshelves);
router.get('/:id', jwtConfig.requireAdminOrStaff, bookshelfController.getBookshelfById);
router.put('/:id', jwtConfig.requireAdminOrStaff, bookshelfController.updateBookshelf);
router.delete('/:id', jwtConfig.requireAdminOrStaff, bookshelfController.deleteBookshelf);

module.exports = router;
