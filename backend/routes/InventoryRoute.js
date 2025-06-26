const express = require('express');
const router = express.Router();
const inventoryController = require('../controller/InventoryController');
const jwtConfig = require('../config/jwtconfig');

router.get('/getallinventoryitems', jwtConfig.requireAuth, inventoryController.getAllInventoryItems);
router.get('/getinventoryitembyid/:id', jwtConfig.requireAuth, inventoryController.getInventoryItemById);


module.exports = router;