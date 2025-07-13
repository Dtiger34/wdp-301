const Book = require('../model/book');
const Inventory = require('../model/Inventory');
const BorrowRecord = require('../model/borrowHistory');
const Fine = require('../model/fine');
const BookCopy = require('../model/bookcopies');
const mongoose = require('mongoose');

// @done: duyệt một yêu cầu mượn sách
exports.acceptBorrowRequest = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const { borrowId } = req.params;
            const staffId = req.user.id;

            const borrowRecord = await BorrowRecord.findById(borrowId).session(session);

            if (!borrowRecord) {
                throw new Error('Borrow request not found');
            }

            if (borrowRecord.status !== 'pending') {
                throw new Error('Borrow request is not pending');
            }

            // Lấy các bản sao sách có sẵn
            const bookCopies = await BookCopy.find({
                book: borrowRecord.bookId,
                status: 'available',
            })
                .limit(borrowRecord.quantity)
                .session(session);

            if (bookCopies.length < borrowRecord.quantity) {
                throw new Error('Not enough available copies');
            }

            // Cập nhật trạng thái bản sao sách
            for (const bookCopy of bookCopies) {
                bookCopy.status = 'borrowed';
                bookCopy.currentBorrower = borrowRecord.userId;
                bookCopy.borrowRecordId = borrowRecord._id; // FIX: Thêm liên kết
                bookCopy.dueDate = borrowRecord.dueDate;
                await bookCopy.save({ session });
            }

            // Cập nhật borrow record
            borrowRecord.status = 'borrowed';
            borrowRecord.borrowDate = new Date();
            borrowRecord.processedBy = staffId;
            await borrowRecord.save({ session });

            // Cập nhật inventory
            const inventory = await Inventory.findOne({ book: borrowRecord.bookId }).session(session);
            if (inventory) {
                inventory.available -= borrowRecord.quantity;
                inventory.borrowed += borrowRecord.quantity;
                await inventory.save({ session });
            }
        });

        const updatedRecord = await BorrowRecord.findById(req.params.borrowId)
            .populate('userId', 'name studentId')
            .populate('bookId', 'title author isbn');

        res.status(200).json({
            message: 'Borrow request approved successfully',
            borrowRecord: updatedRecord,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
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
            query.status = 'borrowed';
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
                currentPage: page,
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

        borrowRequest.status = 'declined';
        borrowRequest.processedBy = staffId;
        if (reason) borrowRequest.notes = reason;
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
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const requestId = req.params.id;
            const staffId = req.user.id;
            const { condition = 'good', notes } = req.body;

            const borrowRequest = await BorrowRecord.findById(requestId)
                .populate('userId', 'name studentId')
                .populate('bookId', 'title author isbn price')
                .session(session);

            if (!borrowRequest) {
                throw new Error('Borrow record not found');
            }

            if (borrowRequest.status !== 'borrowed') {
                throw new Error('Only borrowed books can be returned');
            }

            const returnDate = new Date();
            const isOverdue = returnDate > borrowRequest.dueDate;

            // Cập nhật borrow record
            borrowRequest.status = condition === 'lost' ? 'lost' : 'returned';
            borrowRequest.returnDate = returnDate;
            borrowRequest.processedBy = staffId;
            if (notes) borrowRequest.notes = notes;
            await borrowRequest.save({ session });

            // Cập nhật BookCopy status - FIX: Tìm chính xác BookCopy của borrow record này
            const bookCopies = await BookCopy.find({
                book: borrowRequest.bookId._id,
                currentBorrower: borrowRequest.userId._id,
                status: 'borrowed',
            })
                .limit(borrowRequest.quantity)
                .session(session);

            // FIX: Kiểm tra số lượng BookCopy tìm được
            if (bookCopies.length !== borrowRequest.quantity) {
                throw new Error(`Expected ${borrowRequest.quantity} book copies, but found ${bookCopies.length}`);
            }

            let actualReturnedCount = 0;
            for (const bookCopy of bookCopies) {
                switch (condition) {
                    case 'good':
                        bookCopy.status = 'available';
                        break;
                    case 'damaged':
                        bookCopy.status = 'damaged';
                        break;
                    case 'lost':
                        bookCopy.status = 'lost';
                        break;
                }
                bookCopy.currentBorrower = null;
                bookCopy.dueDate = null;
                await bookCopy.save({ session });
                actualReturnedCount++;
            }

            // FIX: Cập nhật inventory dựa trên số lượng thực tế được trả
            const inventory = await Inventory.findOne({ book: borrowRequest.bookId._id }).session(session);
            if (inventory) {
                inventory.borrowed -= actualReturnedCount;

                switch (condition) {
                    case 'good':
                        inventory.available += actualReturnedCount;
                        break;
                    case 'damaged':
                        inventory.damaged += actualReturnedCount;
                        break;
                    case 'lost':
                        inventory.lost += actualReturnedCount;
                        break;
                }
                await inventory.save({ session });
            }

            // Tạo fine nếu cần
            let fine = null;
            if (isOverdue || condition === 'damaged' || condition === 'lost') {
                let fineAmount = 0;
                let fineReason = '';

                if (isOverdue) {
                    const daysLate = Math.ceil((returnDate - borrowRequest.dueDate) / (1000 * 60 * 60 * 24));
                    fineAmount += daysLate * 5000;
                    fineReason = 'overdue';
                }

                if (condition === 'damaged') {
                    fineAmount += borrowRequest.bookId.price * 0.3;
                    fineReason = fineReason ? 'overdue' : 'damaged';
                }

                if (condition === 'lost') {
                    fineAmount += borrowRequest.bookId.price;
                    fineReason = 'lost';
                }

                if (fineAmount > 0) {
                    fine = await Fine.create(
                        [
                            {
                                borrowRecord: borrowRequest._id,
                                user: borrowRequest.userId._id,
                                reason: fineReason,
                                amount: fineAmount,
                                processedBy: staffId,
                                note: `${condition === 'lost' ? 'Book lost' : condition === 'damaged' ? 'Book damaged' : ''
                                    } ${isOverdue
                                        ? `Late return: ${Math.ceil(
                                            (returnDate - borrowRequest.dueDate) / (1000 * 60 * 60 * 24)
                                        )} days`
                                        : ''
                                    }`.trim(),
                            },
                        ],
                        { session }
                    );

                    borrowRequest.fineId = fine[0]._id;
                    await borrowRequest.save({ session });
                }
            }
        });

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
    } finally {
        await session.endSession();
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
