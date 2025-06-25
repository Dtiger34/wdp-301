const express = require('express');
const router = express.Router();
const upload = require('../middlewares/Upload');
const jwtConfig = require('../config/jwtconfig');
const borrowController = require('../controller/BorrowController');

router.post('/accept-borrow-request', borrowController.acceptBorrowRequest);
router.get('/borrow-requests/pending', borrowController.getPendingBorrowRequests);