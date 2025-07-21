const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');
const jwtConfig = require('../config/jwtconfig');

router.get('/dashboard', jwtConfig.requireAdminOrStaff, reportController.getDashboardStats);
router.get('/borrow-return', jwtConfig.requireAdminOrStaff, reportController.getBorrowReturnReport);
router.get('/most-borrowed-books', jwtConfig.requireAdminOrStaff, reportController.getMostBorrowedBooks);
router.get('/top-borrowers', jwtConfig.requireAdminOrStaff, reportController.getTopBorrowers);
router.get('/overdue-books', jwtConfig.requireAdminOrStaff, reportController.getOverdueBooks);
router.get('/inventory-stats-by-category', jwtConfig.requireAdminOrStaff, reportController.getInventoryStatsByCategory);

module.exports = router;
