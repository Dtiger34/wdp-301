const Inventory = require('../model/Inventory');
const BorrowRecord = require('../model/borrowHistory');
const Fine = require('../model/fine');
const BookCopy = require('../model/bookcopies');
const User = require('../model/user');

// @done: duyệt một yêu cầu mượn sách
exports.acceptBorrowRequest = async (req, res) => {
    try {
        const { borrowId } = req.params;
        const staffId = req.user.id;

        const borrowRecord = await BorrowRecord.findById(borrowId);

        if (!borrowRecord) {
            throw new Error('Borrow request not found');
        }

        if (borrowRecord.status !== 'pending') {
            throw new Error('Borrow request is not pending');
        }

        // Cập nhật BorrowRecord với trạng thái đã duyệt
        borrowRecord.status = 'borrowed';
        borrowRecord.borrowDate = new Date();
        borrowRecord.processedBy = staffId;
        await borrowRecord.save();

        // Lấy lại BorrowRecord đã được cập nhật
        const updatedRecord = await BorrowRecord.findById(borrowId)
            .populate('userId', 'name studentId')
            .populate('bookId', 'title author isbn');

        res.status(200).json({
            message: 'Borrow request approved successfully',
            borrowRecord: updatedRecord,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @done: Lấy danh sách các yêu cầu mượn sách
exports.getAllBorrowedRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, isOverdue } = req.query;

        const query = { status: 'borrowed' };
        // Build query

        // Filter overdue books
        if (isOverdue === 'true') {
            query.dueDate = { $lt: new Date() };
        }

        const borrowRequests = await BorrowRecord.find(query)
            .populate('userId', 'name studentId email phone')
            .populate('bookId', 'title author isbn image')
            .populate('processedBy', 'name studentId')
            .populate('fineId')
            .sort({ createdRequestAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BorrowRecord.countDocuments(query);

        res.status(200).json({
            borrowRequests,
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

        // Lấy tất cả các bản ghi mượn mà không lọc theo trạng thái (tất cả các trạng thái)
        const borrowRecords = await BorrowRecord.find({})
            .populate('userId', 'name studentId email')
            .populate('bookId', 'title isbn author publisher publishYear description price image')
            .skip(skip)
            .limit(limit)
            .sort({ returnDate: -1 });

        // Lọc và loại bỏ bookcopies khỏi bookId
        const result = borrowRecords.map(borrowRecord => {
            const { bookcopies, ...bookIdWithoutCopies } = borrowRecord.bookId.toObject();

            return {
                ...borrowRecord.toObject(),
                bookId: bookIdWithoutCopies,
            };
        });

        const total = await BorrowRecord.countDocuments({});

        res.status(200).json({
            message: 'Return history fetched successfully',
            data: result,
            pagination: {
                currentPage: page,
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
        const { userId } = req.params; // Get userId from the request parameters
        const { page = 1, limit = 10 } = req.query; // Pagination parameters
        const skip = (page - 1) * limit;

        // Lấy tất cả các bản ghi mượn của userId với các trạng thái đã trả
        const borrowRecords = await BorrowRecord.find({ userId })
            .populate('userId', 'name studentId email')
            .populate('bookId', 'title isbn author publisher publishYear description price image')
            .skip(skip)
            .limit(limit)
            .sort({ returnDate: -1 });

        // Lọc và loại bỏ bookcopies khỏi bookId
        const result = borrowRecords.map(borrowRecord => {
            const { bookcopies, ...bookIdWithoutCopies } = borrowRecord.bookId.toObject();

            return {
                ...borrowRecord.toObject(),
                bookId: bookIdWithoutCopies,
            };
        });

        const total = await BorrowRecord.countDocuments({ userId });

        res.status(200).json({
            message: 'Return history fetched successfully',
            data: result,
            pagination: {
                currentPage: page,
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