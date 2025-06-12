const User = require('../model/user'); // Import model User để thao tác với dữ liệu người dùng trong MongoDB
const XLSX = require('xlsx'); // Thư viện để xử lý file Excel
const jwtConfig = require('../config/jwtconfig'); // Import cấu hình JWT để tạo và xác thực token

// Đăng nhập người dùng
exports.login = async (req, res) => {
    const { studentId, password } = req.body; // Lấy thông tin đăng nhập từ request body
    try {
        const user = await User.findOne({ studentId }); // Tìm người dùng theo studentId

        if (!user) return res.status(404).json({ message: 'User not found' }); // Không tìm thấy người dùng

        console.log('Đăng nhập studentId:', user.studentId);

        // ⚠️ Đoạn này tạm thời chưa bật kiểm tra mật khẩu
        // const isMatch = await user.comparePassword(password);
        // if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

        // Tạo token có chứa id và vai trò của người dùng
        const token = jwtConfig.generateToken({ id: user._id, role: user.role });

        // Nếu người dùng buộc phải đổi mật khẩu
        if (user.mustChangePassword) {
            return res.status(200).json({
                message: 'Password change required',
                mustChangePassword: true,
                token,
                user: { id: user._id, name: user.name, studentId: user.studentId }
            });
        }

        // Trả về token và thông tin user khi đăng nhập thành công
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, studentId: user.studentId, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message }); // Lỗi server
    }
};

// Import danh sách người dùng từ file Excel
exports.importUsersFromExcel = async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' }); // Đọc file Excel từ buffer tải lên
        const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Lấy sheet đầu tiên
        const users = XLSX.utils.sheet_to_json(sheet); // Chuyển sheet thành mảng object

        const inserted = []; // Lưu những người dùng được thêm thành công
        const skipped = [];  // Lưu những người dùng bị bỏ qua (trùng)

        for (const item of users) {
            const exists = await User.findOne({ studentId: item.studentId }); // Kiểm tra trùng mã số sinh viên
            if (exists) {
                skipped.push({ studentId: item.studentId, reason: 'Already exists' });
                continue;
            }

            const user = new User({
                studentId: item.studentId,
                name: item.name,
                password: item.password || item.studentId, // Mật khẩu mặc định là mã số sinh viên
                email: item.email,
                phone: item.phone,
                address: item.address,
                mustChangePassword: true // Bắt người dùng đổi mật khẩu sau lần đăng nhập đầu tiên
            });

            await user.save(); // Lưu user vào cơ sở dữ liệu
            inserted.push(user.studentId);
        }

        res.status(200).json({
            message: 'Import completed'
        });
    } catch (err) {
        res.status(500).json({ message: 'Import failed', error: err.message }); // Lỗi khi import
    }
};

// Đổi mật khẩu người dùng
exports.changePassword = async (req, res) => {
    const { studentId, newPassword } = req.body;
    try {
        // Tìm người dùng theo studentId và cập nhật mật khẩu mới, bỏ bắt buộc đổi mật khẩu
        const user = await User.findOneAndUpdate(
            { studentId },
            { password: newPassword, mustChangePassword: false },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = jwtConfig.generateToken({ id: user._id, role: user.role });

        res.status(200).json({
            message: 'Password changed successfully',
            token,
            user: { id: user._id, name: user.name, studentId: user.studentId, role: user.role }
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Lấy thông tin người dùng theo ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Tìm user và ẩn password
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
