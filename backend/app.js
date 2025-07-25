const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();
const path = require('path');
const reviewRoutes = require('./routes/reviewRoutes');

// Middleware parse body JSON
app.use(express.json());

// Gắn middleware giả lập user (nếu cần test không có auth thực)
app.use((req, res, next) => {
    req.user = { role: 'admin', id: 'admin123' }; // 👈 giả lập user admin để bỏ qua auth trong test
    next();
});
app.use('/api/review', reviewRoutes);
// Gắn router auth
const authRoute = require('./routes/AuthRoute');
app.use('/api/v1/auth', authRoute);

// Export app cho test
module.exports = app;
