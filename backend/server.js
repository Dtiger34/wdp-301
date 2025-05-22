const express = require('express');
const { json, urlencoded } = require('body-parser');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('./model/user');
const connectionDB = require('./config/db');
const { swaggerUi, specs } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use(urlencoded({extended:true}));




app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});





app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

connectionDB();
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Backend is running at http://localhost:${PORT}`);
});
