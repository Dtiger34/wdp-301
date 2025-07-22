const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');
const jwtConfig = require('../config/jwtconfig');

router.get('/dashboard', jwtConfig.requireAdmin, reportController.getDashboardStats);
router.get('/borrow-return', jwtConfig.requireAdmin, reportController.getBorrowReturnReport);
router.get('/most-borrowed-books', jwtConfig.requireAdmin, reportController.getMostBorrowedBooks);
router.get('/top-borrowers', jwtConfig.requireAdmin, reportController.getTopBorrowers);
router.get('/overdue-books', jwtConfig.requireAdmin, reportController.getOverdueBooks);
router.get('/inventory-stats-by-category', jwtConfig.requireAdmin, reportController.getInventoryStatsByCategory);
router.get('/calculate-fines/:borrowRecordId', jwtConfig.requireAdmin, reportController.calculateFines);

module.exports = router;