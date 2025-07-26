const Inventory = require('../model/Inventory');
const BorrowRecord = require('../model/borrowHistory');
const Fine = require('../model/fine');
const BookCopy = require('../model/bookcopies');
const User = require('../model/user');
const { sendPickupConfirmationEmail } = require('../utils/nodemailer');
// @done: duyệt một yêu cầu mượn sách
exports.acceptBorrowRequest = async (req, res) => {
    try {
        const { borrowId } = req.params;
        const staffId = req.user.id;

        // console.log(`📥 Nhận yêu cầu duyệt mượn sách với ID: ${borrowId}, bởi staff: ${staffId}`);

        const borrowRecord = await BorrowRecord.findById(borrowId);
        if (!borrowRecord) {
            console.log('❌ Không tìm thấy BorrowRecord với ID:', borrowId);
            return res.status(404).json({ message: 'Borrow request not found' });
        }

        if (borrowRecord.status !== 'pending') {
            console.log(`⚠️ BorrowRecord không ở trạng thái 'pending'. Trạng thái hiện tại: ${borrowRecord.status}`);
            return res.status(400).json({ message: 'Borrow request is not pending' });
        }

        // Cập nhật trạng thái
        borrowRecord.status = 'pendingPickup'; // duyệt -> chờ lấy sách
        borrowRecord.borrowDate = new Date();
        borrowRecord.processedBy = staffId;
        await borrowRecord.save();
        // console.log('✅ Đã cập nhật trạng thái borrowRecord thành "pendingPickup"');

        // Lấy lại dữ liệu đầy đủ đã populate
        const updatedRecord = await BorrowRecord.findById(borrowId)
            .populate('userId', 'name email studentId')
            .populate('bookId', 'title author isbn');

        console.log('🔍 Dữ liệu sau khi populate:', updatedRecord);

        const { email, name } = updatedRecord.userId;
        const bookTitle = updatedRecord.bookId?.title || 'cuốn sách bạn mượn';

        if (email && name) {
            try {
                console.log(`📨 Chuẩn bị gửi email xác nhận đến: ${email} - Người mượn: ${name}`);
                await sendPickupConfirmationEmail(email, name, bookTitle);
                console.log(`📧 Đã gửi email xác nhận đến: ${email}`);
            } catch (err) {
                console.error(`❌ Lỗi khi gửi email xác nhận đến ${email}:`, err.message);
            }
        } else {
            console.log('⚠️ Không đủ thông tin để gửi email (email hoặc name bị thiếu)');
        }

        res.status(200).json({
            message: 'Borrow request approved successfully',
            borrowRecord: updatedRecord,
        });
    } catch (error) {
        console.error('💥 Lỗi khi duyệt mượn sách:', error);
        res.status(500).json({ message: error.message });
    }
};

// @done: Lấy danh sách các yêu cầu mượn sách
exports.getAllBorrowedRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, isOverdue } = req.query;

        const query = { status: 'borrowed' };

        // Lọc quá hạn nếu cần
        if (isOverdue === 'true') {
            query.dueDate = { $lt: new Date() };
        }

        // Lấy danh sách yêu cầu mượn
        const borrowRequests = await BorrowRecord.find(query)
            .populate('userId', 'name studentId email phone')
            .populate('bookId', 'title author isbn image price')
            .populate('processedBy', 'name studentId')
            .populate('fineId')
            .sort({ createdRequestAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean(); // để có thể gán thêm field mới

        // Gắn thêm danh sách BookCopy cho từng yêu cầu
        const updatedRequests = await Promise.all(
            borrowRequests.map(async (record) => {
                const bookCopies = await BookCopy.find({
                    book: record.bookId._id,
                    currentBorrower: record.userId._id,
                    status: 'borrowed',
                }).select('_id barcode status');

                return {
                    ...record,
                    bookCopies, // chèn vào kết quả trả về
                };
            })
        );

        const total = await BorrowRecord.countDocuments(query);

        res.status(200).json({
            borrowRequests: updatedRequests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @done: Từ chối yêu cầu mượn sách
exports.declineBorrowRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        const staffId = req.user.id;
        const { reason } = req.body;

        const borrowRequest = await BorrowRecord.findById(requestId);

        if (!borrowRequest) {
            return res.status(404).json({ message: 'Borrow request not found' });
        }

        if (borrowRequest.status !== 'pending') {
            return res.status(400).json({
                message: 'Only pending requests can be declined',
            });
        }

        // Cập nhật trạng thái yêu cầu mượn thành 'declined'
        borrowRequest.status = 'declined';
        borrowRequest.processedBy = staffId;

        // Nếu có lý do từ chối, lưu vào ghi chú
        if (reason) borrowRequest.notes = reason;

        // Cập nhật lại Inventory (số lượng sách có sẵn và sách đã mượn)
        const inventory = await Inventory.findOne({ book: borrowRequest.bookId });
        if (inventory) {
            inventory.available += borrowRequest.quantity;  // Tăng số lượng sách có sẵn
            inventory.borrowed -= borrowRequest.quantity;   // Giảm số lượng sách đã mượn
            await inventory.save();  // Lưu lại thay đổi trong inventory
        }

        // Cập nhật trạng thái của các BookCopy
        const bookCopies = await BookCopy.find({
            _id: { $in: borrowRequest.bookCopies.map(copy => copy._id) }, // Tìm các BookCopy liên quan
        });

        for (const bookCopy of bookCopies) {
            bookCopy.status = 'available';  // Đặt trạng thái là available
            bookCopy.currentBorrower = null; // Xóa người mượn
            bookCopy.borrowRecordId = null; // Xóa liên kết với BorrowRecord
            await bookCopy.save(); // Lưu lại thay đổi cho BookCopy
        }

        // Lưu yêu cầu mượn đã được cập nhật
        await borrowRequest.save();

        res.status(200).json({
            message: 'Borrow request declined successfully',
            borrowRequest,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @done: Xử lý trả sách
exports.returnBook = async (req, res) => {
    try {
        const requestId = req.params.id;
        const staffId = req.user.id;
        const { bookConditions, notes } = req.body;

        const borrowRequest = await BorrowRecord.findById(requestId)
            .populate('userId', 'name studentId')
            .populate('bookId', 'title author isbn price');

        if (!borrowRequest) {
            throw new Error('Borrow record not found');
        }

        if (borrowRequest.status !== 'borrowed') {
            throw new Error('Only borrowed books can be returned');
        }

        const returnDate = new Date();
        const isOverdue = returnDate > borrowRequest.dueDate;

        // Tìm tất cả BookCopy của borrow record này
        const bookCopies = await BookCopy.find({
            book: borrowRequest.bookId._id,
            currentBorrower: borrowRequest.userId._id,
            status: 'borrowed',
        }).limit(borrowRequest.quantity);

        let conditionCounts = { good: 0, damaged: 0, lost: 0 };
        let actualReturnedCount = 0;

        // Nếu có bookConditions riêng lẻ
        if (bookConditions && Array.isArray(bookConditions)) {
            // Tạo map từ barcode đến condition
            const conditionMap = {};
            bookConditions.forEach((item) => {
                conditionMap[item.barcode] = item.condition;
            });

            const updatedBookCopies = [];
            for (const bookCopy of bookCopies) {
                const condition = conditionMap[bookCopy.barcode] || 'good';

                switch (condition) {
                    case 'good':
                        bookCopy.status = 'available';
                        conditionCounts.good++;
                        break;
                    case 'damaged':
                        bookCopy.status = 'damaged';
                        conditionCounts.damaged++;
                        break;
                    case 'lost':
                        bookCopy.status = 'lost';
                        conditionCounts.lost++;
                        break;
                    default:
                        bookCopy.status = 'available';
                        conditionCounts.good++;
                }

                bookCopy.currentBorrower = null;
                bookCopy.dueDate = null;
                await bookCopy.save();  // Lưu lại bản sao sách sau khi cập nhật trạng thái

                // Lưu đầy đủ thông tin ObjectId, barcode và status vào updatedBookCopies
                updatedBookCopies.push({
                    _id: bookCopy._id,
                    barcode: bookCopy.barcode,
                    status: bookCopy.status,
                });

                actualReturnedCount++;
            }

            // update lại bookCopies trong BorrowRecord
            borrowRequest.bookCopies = updatedBookCopies;
        } else {
            // Sử dụng condition chung cho tất cả (backward compatibility)
            const condition = req.body.condition || 'good';

            const updatedBookCopies = [];
            for (const bookCopy of bookCopies) {
                switch (condition) {
                    case 'good':
                        bookCopy.status = 'available';
                        conditionCounts.good++;
                        break;
                    case 'damaged':
                        bookCopy.status = 'damaged';
                        conditionCounts.damaged++;
                        break;
                    case 'lost':
                        bookCopy.status = 'lost';
                        conditionCounts.lost++;
                        break;
                }

                bookCopy.currentBorrower = null;
                bookCopy.dueDate = null;
                await bookCopy.save();  // save

                // Lưu đầy đủ thông tin ObjectId, barcode và status vào updatedBookCopies
                updatedBookCopies.push({
                    _id: bookCopy._id,
                    barcode: bookCopy.barcode,
                    status: bookCopy.status,
                });

                actualReturnedCount++;
            }

            // update lại bookCopies trong BorrowRecord
            borrowRequest.bookCopies = updatedBookCopies;
        }

        // update borrow record
        borrowRequest.status = conditionCounts.lost > 0 ? 'lost' : 'returned';
        borrowRequest.returnDate = returnDate;
        borrowRequest.processedBy = staffId;
        if (notes) borrowRequest.notes = notes;
        await borrowRequest.save();

        // update inventory dựa trên số lượng thực tế
        const inventory = await Inventory.findOne({ book: borrowRequest.bookId._id });
        if (inventory) {
            inventory.borrowed -= actualReturnedCount;
            inventory.available += conditionCounts.good;
            inventory.damaged += conditionCounts.damaged;
            inventory.lost += conditionCounts.lost;
            await inventory.save();
        }

        // Tính fine dựa trên từng cuốn sách
        let fine = null;
        if (isOverdue || conditionCounts.damaged > 0 || conditionCounts.lost > 0) {
            let fineAmount = 0;
            let fineReasons = [];

            // Fine cho quá hạn (áp dụng cho toàn bộ lô sách)
            if (isOverdue) {
                const daysLate = Math.ceil((returnDate - borrowRequest.dueDate) / (1000 * 60 * 60 * 24));
                fineAmount += daysLate * 5000; // Fine cố định cho quá hạn
                fineReasons.push(`Late return: ${daysLate} days`);
            }

            // Fine cho sách hỏng (tính theo từng cuốn)
            if (conditionCounts.damaged > 0) {
                const damagedFine = borrowRequest.bookId.price * 0.3 * conditionCounts.damaged;
                fineAmount += damagedFine;
                fineReasons.push(`${conditionCounts.damaged} damaged book(s)`);
            }

            // Fine cho sách mất (tính theo từng cuốn)
            if (conditionCounts.lost > 0) {
                const lostFine = borrowRequest.bookId.price * conditionCounts.lost;
                fineAmount += lostFine;
                fineReasons.push(`${conditionCounts.lost} lost book(s)`);
            }

            if (fineAmount > 0) {
                fine = await Fine.create([{
                    borrowRecord: borrowRequest._id,
                    user: borrowRequest.userId._id,
                    reason: conditionCounts.lost > 0 ? 'lost' : conditionCounts.damaged > 0 ? 'damaged' : 'overdue',
                    amount: fineAmount,
                    processedBy: staffId,
                    note: fineReasons.join(', '),
                }]);


                borrowRequest.fineId = fine[0]._id;
                await borrowRequest.save();
            }
        }

        const updatedRecord = await BorrowRecord.findById(requestId)
            .populate('userId', 'name studentId')
            .populate('bookId', 'title author isbn')
            .populate('fineId');

        res.status(200).json({
            message: 'Book returned successfully',
            borrowRequest: updatedRecord,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @done: Gia hạn thời gian mượn sách
exports.extendBorrowPeriod = async (req, res) => {
    try {
        const requestId = req.params.id;
        const staffId = req.user.id;
        const { days = 7 } = req.body;

        const borrowRequest = await BorrowRecord.findById(requestId)
            .populate('userId', 'name studentId')
            .populate('bookId', 'title author');

        if (!borrowRequest) {
            return res.status(404).json({ message: 'Borrow record not found' });
        }

        if (borrowRequest.status !== 'borrowed') {
            return res.status(400).json({
                message: 'Only currently borrowed books can be extended',
            });
        }

        // Kiểm tra xem user có phạt chưa thanh toán không
        const outstandingFines = await Fine.countDocuments({
            user: borrowRequest.userId._id,
            paid: false,
        });

        if (outstandingFines > 0) {
            return res.status(400).json({
                message: 'Cannot extend borrow period. User has outstanding fines',
            });
        }

        // Gia hạn ngày trả
        const newDueDate = new Date(borrowRequest.dueDate);
        newDueDate.setDate(newDueDate.getDate() + parseInt(days));

        borrowRequest.dueDate = newDueDate;
        borrowRequest.updatedBrrowAt = new Date();
        borrowRequest.processedBy = staffId;
        await borrowRequest.save();

        // Cập nhật dueDate cho BookCopy
        await BookCopy.updateMany(
            {
                book: borrowRequest.bookId._id,
                currentBorrower: borrowRequest.userId._id,
                status: 'borrowed',
            },
            { dueDate: newDueDate }
        );

        res.status(200).json({
            message: `Borrow period extended by ${days} days`,
            borrowRequest,
            newDueDate,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @done: Lấy thống kê mượn/trả sách
exports.getBorrowStatistics = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;

        const dateFilter = {};
        if (fromDate) dateFilter.$gte = new Date(fromDate);
        if (toDate) dateFilter.$lte = new Date(toDate);

        const matchFilter = {};
        if (Object.keys(dateFilter).length > 0) {
            matchFilter.createdRequestAt = dateFilter;
        }

        // Thống kê cơ bản
        const stats = await BorrowRecord.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                },
            },
        ]);

        // Sách quá hạn
        const overdueBooks = await BorrowRecord.find({
            status: 'borrowed',
            dueDate: { $lt: new Date() },
        })
            .populate('userId', 'name studentId')
            .populate('bookId', 'title author')
            .select('userId bookId dueDate quantity');

        // Sách được mượn nhiều nhất
        const topBorrowedBooks = await BorrowRecord.aggregate([
            { $match: { ...matchFilter, status: { $in: ['borrowed', 'returned'] } } },
            {
                $group: {
                    _id: '$bookId',
                    borrowCount: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                },
            },
            { $sort: { borrowCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'books',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'book',
                },
            },
            { $unwind: '$book' },
        ]);

        // Người mượn nhiều nhất
        const topBorrowers = await BorrowRecord.aggregate([
            { $match: { ...matchFilter, status: { $in: ['borrowed', 'returned'] } } },
            {
                $group: {
                    _id: '$userId',
                    borrowCount: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                },
            },
            { $sort: { borrowCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
        ]);

        const result = {
            summary: stats.reduce((acc, stat) => {
                acc[stat._id] = {
                    count: stat.count,
                    totalQuantity: stat.totalQuantity,
                };
                return acc;
            }, {}),
            overdueBooks: overdueBooks.map((record) => ({
                user: record.userId,
                book: record.bookId,
                dueDate: record.dueDate,
                quantity: record.quantity,
                daysLate: Math.ceil((new Date() - record.dueDate) / (1000 * 60 * 60 * 24)),
            })),
            topBorrowedBooks: topBorrowedBooks.map((item) => ({
                book: item.book,
                borrowCount: item.borrowCount,
                totalQuantity: item.totalQuantity,
            })),
            topBorrowers: topBorrowers.map((item) => ({
                user: {
                    _id: item.user._id,
                    name: item.user.name,
                    studentId: item.user.studentId,
                },
                borrowCount: item.borrowCount,
                totalQuantity: item.totalQuantity,
            })),
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @done: Lịch sử mượn và trả của user
exports.getReturnHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const borrowRecords = await BorrowRecord.find({ status: 'returned' })
            .populate('userId', 'name studentId email')
            .populate('bookId', 'title isbn author publisher publishYear description price image')
            .skip(skip)
            .limit(limit)
            .sort({ returnDate: -1 });

        // Lấy danh sách tất cả các _id của borrowRecords
        const borrowRecordIds = borrowRecords.map(record => record._id);

        // Truy vấn bảng Fine để lấy tiền phạt tương ứng
        const fines = await Fine.find({ borrowRecord: { $in: borrowRecordIds } });

        // Tạo Map để tra nhanh borrowRecordId => fine
        const fineMap = new Map();
        fines.forEach(f => {
            fineMap.set(f.borrowRecord.toString(), {
                amount: f.amount,
                reason: f.reason,
                paid: f.paid,
                note: f.note,
            });
        });

        // Tạo kết quả cuối cùng
        const result = borrowRecords.map(borrowRecord => {
            const { bookcopies, ...bookIdWithoutCopies } = borrowRecord.bookId.toObject();
            const fine = fineMap.get(borrowRecord._id.toString());

            return {
                ...borrowRecord.toObject(),
                bookId: bookIdWithoutCopies,
                fine: fine || null,
                note: bookcopies?.[0]?.status === 'damaged' ? 'Hỏng sách' :
                    bookcopies?.[0]?.status === 'lost' ? 'Mất sách' :
                        bookcopies?.[0]?.status === 'available' ? 'Tốt' :
                            'Không xác định',

            };
        });

        const total = await BorrowRecord.countDocuments({});

        res.status(200).json({
            message: 'Return history fetched successfully',
            data: result,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error('Error fetching return history:', error);
        res.status(500).json({ message: 'Failed to fetch return history', error: error.message });
    }
};


// @done: Lịch sử mượn và trả sách của 1 user
exports.getReturnHistoryByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status = "all" } = req.query;
        const skip = (page - 1) * limit;

        // Ánh xạ status filter
        const statusFilter = {};
        if (status === 'waiting') {
            statusFilter.status = { $in: ['pending', 'pendingPickup'] };
        } else if (status === 'borrowing') {
            statusFilter.status = { $in: ['borrowed', 'overdue'] };
        } else if (status === 'returned') {
            statusFilter.status = 'returned';
        } else if (status === 'canceled') {
            statusFilter.status = 'canceled';
        } // else: status = 'all' → không filter theo status

        const query = {
            userId,
            ...statusFilter
        };

        const borrowRecords = await BorrowRecord.find(query)
            .populate('userId', 'name studentId email')
            .populate('bookId', 'title isbn author publisher publishYear description price image bookcopies')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ returnDate: -1 });

        // Lấy danh sách các _id để truy xuất Fine
        const borrowRecordIds = borrowRecords.map(record => record._id);

        const fines = await Fine.find({ borrowRecord: { $in: borrowRecordIds } });

        const fineMap = new Map();
        fines.forEach(f => {
            fineMap.set(f.borrowRecord.toString(), {
                amount: f.amount,
                reason: f.reason,
                paid: f.paid,
                note: f.note,
            });
        });

        const result = borrowRecords.map(borrowRecord => {
            const { bookcopies, ...bookIdWithoutCopies } = borrowRecord.bookId.toObject();
            const fine = fineMap.get(borrowRecord._id.toString());

            return {
                ...borrowRecord.toObject(),
                bookId: bookIdWithoutCopies,
                fine: fine || null,
                note: bookcopies?.[0]?.status === 'damaged'
                    ? 'Hỏng sách'
                    : bookcopies?.[0]?.status === 'lost'
                        ? 'Mất sách'
                        : bookcopies?.[0]?.status === 'available'
                            ? 'Tốt'
                            : 'Không xác định',
            };
        });

        const total = await BorrowRecord.countDocuments(query);

        res.status(200).json({
            message: 'User return history fetched successfully',
            data: result,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error('Error fetching return history for user:', error);
        res.status(500).json({ message: 'Failed to fetch return history', error: error.message });
    }
};

// @done: xác nhận người dùng đã lấy sách
exports.confirmBookPickup = async (req, res) => {
    try {
        const { borrowId } = req.params;

        // Tìm borrow record
        const borrowRecord = await BorrowRecord.findById(borrowId);

        if (!borrowRecord) {
            return res.status(404).json({ message: 'Borrow record not found' });
        }

        if (borrowRecord.status !== 'pendingPickup') {
            return res.status(400).json({ message: 'Borrow is not in pending pickup state' });
        }

        // Cập nhật trạng thái borrow record
        borrowRecord.status = 'borrowed';
        borrowRecord.pickupDate = new Date();
        await borrowRecord.save();

        // Cập nhật trạng thái các bản sao sách liên quan
        const bookCopyIds = borrowRecord.bookCopies.map(copy => copy._id);
        await BookCopy.updateMany(
            { _id: { $in: bookCopyIds } },
            { $set: { status: 'borrowed' } }
        );

        res.status(200).json({
            message: 'Book pickup confirmed successfully',
            borrowRecord,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @done: hủy yêu cầu mượn sách
exports.cancelBorrowRequest = async (req, res) => {
    try {
        const { borrowId } = req.params;
        const userId = req.user.id;

        const borrowRecord = await BorrowRecord.findById(borrowId);

        if (!borrowRecord) {
            return res.status(404).json({ message: 'Borrow request not found' });
        }

        if (
            borrowRecord.status !== 'pending' &&
            borrowRecord.status !== 'pendingPickup'
        ) {
            return res.status(400).json({
                message: 'Only pending or pendingPickup requests can be cancelled',
            });
        }

        // Kiểm tra quyền hủy (user phải là chủ yêu cầu hoặc là staff)
        if (
            borrowRecord.userId.toString() !== userId &&
            req.user.role !== 'staff'
        ) {
            return res.status(403).json({
                message: 'You are not authorized to cancel this borrow request',
            });
        }

        // Cập nhật trạng thái borrowRecord
        borrowRecord.status = 'cancelled';
        await borrowRecord.save();

        // Trả các bản sao sách về trạng thái 'available'
        const bookCopyIds = borrowRecord.bookCopies.map(copy => copy._id);
        await BookCopy.updateMany(
            { _id: { $in: bookCopyIds } },
            {
                $set: {
                    status: 'available',
                    currentBorrower: null,
                    dueDate: null,
                },
            }
        );

        // Cập nhật lại Inventory
        const inventory = await Inventory.findOne({ book: borrowRecord.bookId });
        if (inventory) {
            inventory.available += borrowRecord.quantity;
            inventory.borrowed -= borrowRecord.quantity;
            await inventory.save();
        }

        res.status(200).json({ message: 'Borrow request cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};