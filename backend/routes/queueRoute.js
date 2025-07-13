const express = require('express');
const router = express.Router();
const jwtConfig = require('../config/jwtconfig');
const queueController = require('../controller/queueController');

// Tạo yêu cầu mượn sách qua queue
router.post('/borrow-request', jwtConfig.requireAuth, queueController.createBorrowRequestQueue);

// Kiểm tra trạng thái job mượn sách
router.get('/borrow-request/status/:jobId', jwtConfig.requireAuth, queueController.getBorrowRequestJobStatus);

// Lấy thống kê queue (chỉ admin/staff)
router.get('/stats', jwtConfig.requireAuth, queueController.getQueueStats);

module.exports = router;
