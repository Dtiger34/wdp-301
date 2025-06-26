const express = require("express");
const router = express.Router();
const BookController = require("../controller/BookController");
const jwtConfig = require("../config/jwtconfig");
const uploadImage = require('../middlewares/uploadImage');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - isbn
 *       properties:
 *         title: { type: string }
 *         isbn: { type: string }
 *         author: { type: string }
 *         publisher: { type: string }
 *         publishYear: { type: number }
 *         description: { type: string }
 *         price: { type: number }
 *         image: { type: string }
 *     BorrowRequest:
 *       type: object
 *       required: [bookId]
 *       properties:
 *         bookId: { type: string }
 *         isReadOnSite: { type: boolean }
 *         dueDate: { type: string, format: date-time }
 *         notes: { type: string }
 */

// ------------------- BOOK ROUTES --------------------
router.get("/", jwtConfig.requireAuth, BookController.getAllBooks);
router.get("/filter", jwtConfig.requireAuth, BookController.getBookFilter);
router.get("/:id", jwtConfig.requireAuth, BookController.getBookById);
router.post('/', jwtConfig.requireAuth,uploadImage.single('image'), BookController.createBook);
router.put('/:id', jwtConfig.requireAuth, uploadImage.single('image'), BookController.updateBook);
router.delete("/:id", jwtConfig.requireAuth, BookController.deleteBook);

// ------------------- BORROW ROUTES --------------------
router.post(
  "/borrow/request",
  jwtConfig.requireAuth,
  BookController.createBorrowRequest
);
router.delete(
  "/borrow/cancel/:id",
  jwtConfig.requireAuth,
  BookController.cancelBorrowRequest
);
router.get(
  "/borrow/requests",
  jwtConfig.requireAuth,
  BookController.getUserBorrowRequests
);
router.get(
  "/borrow-requests/pending",
  jwtConfig.requireAuth,
  BookController.getPendingBorrowRequests
);
router.get(
  "/history/user",
  jwtConfig.requireAuth,
  BookController.getBorrowHistory
);

// ------------------- REVIEW ROUTES --------------------
router.post("/review", jwtConfig.requireAuth, BookController.createReview);
router.put("/review/:id", jwtConfig.requireAuth, BookController.updateReview);
router.delete("/review/:id", jwtConfig.requireAuth, BookController.deleteReview);

module.exports = router;
