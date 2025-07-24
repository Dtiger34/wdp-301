const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const jwtConfig = require("../config/jwtconfig");

// Category routes
router.get('/', categoryController.getAllCategories);
router.post('/', jwtConfig.requireAdminOrStaff, categoryController.createCategory);
router.get('/:id', jwtConfig.requireAdminOrStaff, categoryController.getCategoryById);
router.put('/:id', jwtConfig.requireAdminOrStaff, categoryController.updateCategory);
router.delete('/:id', jwtConfig.requireAdminOrStaff, categoryController.deleteCategory);

module.exports = router;
