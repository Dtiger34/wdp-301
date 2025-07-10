const express = require('express');
const router = express.Router();
const jwtConfig = require('../config/jwtconfig');
const borrowController = require('../controller/BorrowController');

// Duyệt yêu cầu mượn sách
router.post('/accept-borrow-request/:borrowId', jwtConfig.requireAuth, borrowController.acceptBorrowRequest);

// Lấy danh sách tất cả các yêu cầu mượn
router.get('/status-borrowed', borrowController.getAllBorrowedRequests);

// Từ chối yêu cầu mượn sách
router.post('/decline-borrow-request/:id', jwtConfig.requireAuth, borrowController.declineBorrowRequest);

// Trả sách
router.post('/return-book/:id', jwtConfig.requireAuth, borrowController.returnBook);

// Gia hạn thời gian mượn sách
router.post('/extend-borrow/:id', jwtConfig.requireAuth, borrowController.extendBorrowPeriod);

// Lấy thống kê mượn/trả sách
router.get('/borrow-statistics', jwtConfig.requireAuth, borrowController.getBorrowStatistics);

module.exports = router;