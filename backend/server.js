const express = require("express");
const { json, urlencoded } = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectionDB = require("./config/db");
const { swaggerUi, specs } = require("./config/swagger");

const app = express();

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use("/images/book", express.static("public/images/book"));

// Routes
app.use("/api/v1/auth", require("./routes/AuthRoute"));
app.use("/api/v1/books", require("./routes/BookRoute"));
app.use("/api/v1/bookshelves", require("./routes/bookshelfRoute"));
app.use("/api/v1/categories", require("./routes/categoryRoute"));
app.use("/api/v1/inventory", require("./routes/InventoryRoute"));
// Nếu sau này bạn có route riêng cho borrow:
// app.use("/api/v1/borrows", require("./routes/BorrowRoute"));

// Fallback route not found
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Connect to DB & Start Server
connectionDB();

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`✅ Backend is running at http://localhost:${PORT}`);
});
