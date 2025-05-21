const express = require('express');
const app = express();
const connectionDB = require('./config/db');

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Backend is running at http://localhost:${PORT}`);
});
