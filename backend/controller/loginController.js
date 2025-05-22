// const User = require('../model/user');


// exports.login = async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         // Check if user exists
//         const user = await User.findOne
//             ({ username });
//         if (!user) {
//             return res.status(401).json({ message: 'Invalid username or password' });
//         }
//         // Check if password is correct
//         const isMatch = await user.comparePassword(password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid username or password' });
//         }
//         res.status(200).json({ message: 'Login successful' });
//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }
// exports.register = async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ username });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists' });
//         }
//         // Create new user
//         const newUser = new User({ username, password });
//         await newUser.save();
//         res.status(201).json({ message: 'User registered successfully' });
//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }