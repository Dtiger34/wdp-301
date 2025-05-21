const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config(); // Cho phép đọc các biến môi trường từ .env

const connectionDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connect to MongoDB successfully!");
    } catch (error) {
        console.error("Connection to MongoDB failse: " + error);
        process.exit(1);
    }
};

module.exports = connectionDB;