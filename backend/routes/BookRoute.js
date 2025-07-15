const express = require("express");
const router = express.Router();
const BookController = require("../controller/BookController");
const jwtConfig = require("../config/jwtconfig");
const uploadImage = require('../middlewares/uploadImage');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// ------------------- BOOK ROUTES --------------------
router.get("/", jwtConfig.requireAuth, BookController.getAllBooks);
router.get("/filter", BookController.getBookFilter);
router.get("/:id", BookController.getBookById);
router.post('/', jwtConfig.requireAuth, uploadImage.single('image'), BookController.createBook);
router.put('/:id', jwtConfig.requireAuth, uploadImage.single('image'), BookController.updateBook);
router.delete("/:id", jwtConfig.requireAuth, BookController.deleteBook);
router.get('/search', jwtConfig.requireAuth, BookController.searchBooks);
router.post('/upload', jwtConfig.requireAdminOrStaff, upload.single('file'), BookController.uploadBooksFromFile); //tải sách hàng loạt

// ------------------- BORROW ROUTES --------------------
router.post('/borrow/request', jwtConfig.requireAuth, BookController.createBorrowRequest);
router.delete('/borrow/cancel/:id', jwtConfig.requireAuth, BookController.cancelBorrowRequest);
router.get('/borrow/requests', jwtConfig.requireAuth, BookController.getUserBorrowRequests);
router.get('/borrow-requests/pending', jwtConfig.requireAdminOrStaff, BookController.getPendingBorrowRequests);
router.get('/history/user', jwtConfig.requireAuth, BookController.getBorrowHistory);

// ------------------- REVIEW ROUTES --------------------
router.post("/review", jwtConfig.requireAuth, BookController.createReview);
router.put("/review/:id", jwtConfig.requireAuth, BookController.updateReview);
router.delete("/review/:id", jwtConfig.requireAuth, BookController.deleteReview);

// ------------------- INVENTORY ROUTES --------------------
router.put('/:id/inventory', jwtConfig.requireAdminOrStaff, BookController.updateBookInventory);

module.exports = router;
