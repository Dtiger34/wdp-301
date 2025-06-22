const Inventory = require('../model/Inventory');



// get all inventory items
exports.getAllInventoryItems = async (req, res) => {
    try {
        const inventoryItems = await Inventory.find().sort({ createdAt: -1 });
        res.status(200).json(inventoryItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// get single inventory item by ID
exports.getInventoryItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Inventory.findOne({ book: id });
        if (!item) {
            return res.status(404).json({ message: 'Inventory not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
