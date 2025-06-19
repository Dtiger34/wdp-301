const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const connectionDB = require('./config/db');
const { swaggerUi, specs } = require('./config/swagger');

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/v1/auth', require('./routes/authRoute'));
app.use('/api/v1/books', require('./routes/BookRoute'));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// DB + Server start
connectionDB();
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Backend is running at http://localhost:${PORT}`);
});
