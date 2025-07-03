const express = require('express');
const router = express.Router();
const upload = require('../middlewares/Upload');
const jwtConfig = require('../config/jwtconfig');
const authController = require('../controller/authController');

router.post('/login', authController.login);
router.get('/getallusers', jwtConfig.requireAdmin, authController.getAllUsers);
router.get('/getuserbyid/:id', jwtConfig.requireAuth, authController.getUserById);
router.post('/import', jwtConfig.requireAdmin, upload.single('file'), authController.importUsersFromExcel);
router.patch('/changepassword/:id', jwtConfig.requireAuth, authController.changePassword);
router.post('/admin/addaccount', jwtConfig.requireAdmin, authController.createAccount);
router.post('/changePassword', jwtConfig.requireAuth, authController.changePassword);



module.exports = router;
