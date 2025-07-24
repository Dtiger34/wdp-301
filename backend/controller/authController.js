const User = require('../model/user');
const XLSX = require('xlsx');
const jwtConfig = require('../config/jwtconfig');

// @done loggin
exports.login = async (req, res) => {
    const { studentId, password } = req.body;
    try {
        const user = await User.findOne({ studentId });

        if (!user) return res.status(404).json({ message: 'User not found' });


        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
        }
        const token = jwtConfig.generateToken({ id: user._id, role: user.role });

        if (user.mustChangePassword) {
            return res.status(200).json({
                message: 'Password change required',
                mustChangePassword: true,
                token,
                user: { id: user._id, name: user.name, studentId: user.studentId }
            });
        }

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, studentId: user.studentId, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @done importUsersFromExcel
exports.importUsersFromExcel = async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const users = XLSX.utils.sheet_to_json(sheet);

        const inserted = [];
        const skipped = [];

        for (const item of users) {
            const exists = await User.findOne({ studentId: item.studentId });
            if (exists) {
                skipped.push({ studentId: item.studentId, reason: 'Already exists' });
                continue;
            }

            const user = new User({
                studentId: item.studentId,
                name: item.name,
                password: item.password || item.studentId,
                email: item.email,
                phone: item.phone,
                address: item.address,
                mustChangePassword: true
            });

            await user.save();
            inserted.push(user.studentId);
        }

        res.status(200).json({
            message: 'Import completed'
        });
    } catch (err) {
        res.status(500).json({ message: 'Import failed', error: err.message });
    }
};

// @done change password
exports.changePassword = async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.mustChangePassword) {
            user.mustChangePassword = false;
            await user.save();
        }

        const token = jwtConfig.generateToken({ id: user._id, role: user.role });
        res.status(200).json({
            message: 'Password changed successfully',
            token,
            user: { id: user._id, name: user.name, studentId: user.studentId, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @done get user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Ẩn mật khẩu
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            id: user._id,
            name: user.name,
            studentId: user.studentId,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            mustChangePassword: user.mustChangePassword
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @done get all users with pagination (GET)
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Trang mặc định là 1 nếu không truyền
        const limit = 10; // Mỗi trang có 10 user
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password') // Ẩn trường password
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments(); // Tổng số user
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalUsers,
            users,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @done create account
exports.createAccount = async (req, res) => {
    const { studentId, name, password, email, phone, address, role } = req.body;

    try {
        const existingUser = await User.findOne({ studentId });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ studentId, name, password, email, phone, address, role });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @done update user
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, phone, address, role, isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only admin can update role and isActive
        if ((role || isActive !== undefined) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can update role and active status' });
        }

        // Check for duplicate email if provided
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @done delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has active borrow records
        const BorrowRecord = require('../model/borrowHistory');
        const activeBorrows = await BorrowRecord.countDocuments({
            userId,
            status: { $in: ['pending', 'borrowed'] },
        });

        if (activeBorrows > 0) {
            return res.status(400).json({
                message: 'Cannot delete user with active borrow records',
            });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};