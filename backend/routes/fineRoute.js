const express = require('express');
const router = express.Router();
const fineController = require('../controller/fineController');
const jwtConfig = require('../config/jwtconfig');

// User routes - get own fines
router.get('/my-fines', jwtConfig.requireAuth, fineController.getUserFines);

// Staff/Admin routes - manage all fines
router.get('/', jwtConfig.requireAdminOrStaff, fineController.getAllFines);
router.post('/', jwtConfig.requireAdminOrStaff, fineController.createManualFine);
router.put('/:id', jwtConfig.requireAdminOrStaff, fineController.updateFine);
router.delete('/:id', jwtConfig.requireAdminOrStaff, fineController.deleteFine);
router.patch('/:id/mark-paid', jwtConfig.requireAdminOrStaff, fineController.markFineAsPaid);

// Statistics routes - admin only
router.get('/statistics', jwtConfig.requireAdmin, fineController.getFineStatistics);

module.exports = router;
