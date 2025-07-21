const Book = require('../model/book');
const Inventory = require('../model/Inventory');
const BorrowInventory = require('../model/borrowHistory')
const Fine = require('../model/fine');
const BorrowRecord = require('../model/borrowHistory');
const BookCopy = require('../model/bookcopies');
const mongoose = require('mongoose');

// @done: duyệt một yêu cầu mượn sách (đổi lại status, sửa lại số lượng)
exports.acceptBorrowRequest = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const borrowRecord = await BorrowRecord.findById(borrowId);

    if (!borrowRecord) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    if (borrowRecord.status !== 'pending') {
      return res.status(400).json({ message: 'Borrow request is not pending' });
    }

    // Tìm các bản sao sách sẵn có
    const bookCopies = await BookCopy.find({
      book: borrowRecord.bookId,
      status: 'available',
    }).limit(borrowRecord.quantity);

    if (bookCopies.length < borrowRecord.quantity) {
      return res.status(400).json({ message: 'Not enough available copies' });
    }

    // Cập nhật trạng thái và người mượn cho từng bản sao
    for (let i = 0; i < bookCopies.length; i++) {
      bookCopies[i].status = 'borrowed';
      bookCopies[i].currentBorrower = borrowRecord.userId;
      bookCopies[i].dueDate = borrowRecord.dueDate; // gán sẵn ngày hết hạn cho BookCopy
      await bookCopies[i].save();
    }

    // Gán các bản sao vào borrowRecord
    borrowRecord.bookCopies = bookCopies.map(copy => copy._id);
    borrowRecord.status = 'borrowed';
    borrowRecord.borrowDate = new Date();
    borrowRecord.processedBy = req.user.id;
    await borrowRecord.save();

    // Cập nhật inventory
    const inventory = await Inventory.findOne({ book: borrowRecord.bookId });
    if (inventory) {
      const availableBooks = inventory.available - borrowRecord.quantity;
      const borrowedBooks = inventory.borrowed + borrowRecord.quantity;

      if (isNaN(availableBooks) || isNaN(borrowedBooks)) {
        return res.status(400).json({ message: 'Invalid quantity for available or borrowed books.' });
      }

      inventory.available = availableBooks;
      inventory.borrowed = borrowedBooks;
      await inventory.save();
    }

    res.status(200).json(borrowRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @done: Lấy danh sách các yêu cầu mượn sách
exports.getAllBorrowedRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10, isOverdue } = req.query;

        const query = { status: 'borrowed' };

        // Nếu chỉ lấy sách quá hạn
        if (isOverdue === 'true') {
            query.dueDate = { $lt: new Date() };
        }

        const borrowRequests = await BorrowRecord.find(query)
            .populate('userId', 'name studentId email phone')
            .populate('bookId', 'title author isbn image price') // ✅ Thêm 'price' ở đây
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



// @done: Từ chối yêu cầu mượn sách (Trạng thái pending)
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
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

////// Xử lý khi người dùng trả sách (trạng thái 'borrowed') 
//Cập nhật status thành 'returned', 'lost', hoặc giữ nguyên nếu bị damaged.
//Cập nhật kho(Inventory) tương ứng(giảm borrowed, tăng available, damaged hoặc lost).
//Nếu trả muộn hoặc sách bị hư / mất → tạo bản ghi Fine để xử phạt.
exports.returnBook = async (req, res) => {
    try {
        const requestId = req.params.id;
        const staffId = req.user.id;
        const { bookConditions, notes } = req.body;
        // bookConditions format: [{ barcode: "BC001", condition: "good" }, { barcode: "BC002", condition: "damaged" }]
        // hoặc condition chung cho tất cả: { condition: "good", notes: "..." }

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

        // Xử lý condition cho từng cuốn sách
        let conditionCounts = { good: 0, damaged: 0, lost: 0 };
        let actualReturnedCount = 0;

        // Nếu có bookConditions riêng lẻ
        if (bookConditions && Array.isArray(bookConditions)) {
            // Tạo map từ barcode đến condition
            const conditionMap = {};
            bookConditions.forEach((item) => {
                conditionMap[item.barcode] = item.condition;
            });

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
                await bookCopy.save();
                actualReturnedCount++;
            }
        } else {
            // Sử dụng condition chung cho tất cả (backward compatibility)
            const condition = req.body.condition || 'good';

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
                await bookCopy.save();
                actualReturnedCount++;
            }
        }

        // Cập nhật borrow record
        borrowRequest.status = conditionCounts.lost > 0 ? 'lost' : 'returned';
        borrowRequest.returnDate = returnDate;
        borrowRequest.processedBy = staffId;
        if (notes) borrowRequest.notes = notes;
        await borrowRequest.save();

        // Cập nhật inventory dựa trên số lượng thực tế
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
                fine = await Fine.create([
                    {
                        borrowRecord: borrowRequest._id,
                        user: borrowRequest.userId._id,
                        reason: conditionCounts.lost > 0 ? 'lost' : conditionCounts.damaged > 0 ? 'damaged' : 'overdue',
                        amount: fineAmount,
                        processedBy: staffId,
                        note: fineReasons.join(', '),
                    },
                ]);

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

// @doing: Gia hạn thời gian mượn sách (Đang mượn và không có phạt)
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

        // Check if user has any outstanding fines
        const outstandingFines = await Fine.countDocuments({
            user: borrowRequest.userId._id,
            paid: false,
        });

        // if (outstandingFines > 0) {
        //     return res.status(400).json({
        //         message: 'Cannot extend borrow period. User has outstanding fines',
        //     });
        // }

        // Extend due date
        const newDueDate = new Date(borrowRequest.dueDate);
        newDueDate.setDate(newDueDate.getDate() + parseInt(days));

        borrowRequest.dueDate = newDueDate;
        borrowRequest.updatedBrrowAt = new Date();
        await borrowRequest.save();

        res.status(200).json({
            message: `Borrow period extended by ${days} days`,
            borrowRequest,
            newDueDate,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @doing: Lấy thống kê mượn/trả sách (Lọc theo thời gian)
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

        // Get basic statistics
        const stats = await BorrowRecord.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get overdue books
        const overdueBooks = await BorrowRecord.find({
            status: 'borrowed',
            dueDate: { $lt: new Date() },
        })
            .populate('userId', 'name studentId')
            .populate('bookId', 'title author')
            .select('userId bookId dueDate');

        // Get most borrowed books
        const topBorrowedBooks = await BorrowRecord.aggregate([
            { $match: { ...matchFilter, status: { $in: ['borrowed', 'returned'] } } },
            {
                $group: {
                    _id: '$bookId',
                    borrowCount: { $sum: 1 },
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

        // Get most active borrowers
        const topBorrowers = await BorrowRecord.aggregate([
            { $match: { ...matchFilter, status: { $in: ['borrowed', 'returned'] } } },
            {
                $group: {
                    _id: '$userId',
                    borrowCount: { $sum: 1 },
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
                acc[stat._id] = stat.count;
                return acc;
            }, {}),
            overdueBooks: overdueBooks.map((record) => ({
                user: record.userId,
                book: record.bookId,
                dueDate: record.dueDate,
                daysLate: Math.ceil((new Date() - record.dueDate) / (1000 * 60 * 60 * 24)),
            })),
            topBorrowedBooks: topBorrowedBooks.map((item) => ({
                book: item.book,
                borrowCount: item.borrowCount,
            })),
            topBorrowers: topBorrowers.map((item) => ({
                user: {
                    _id: item.user._id,
                    name: item.user.name,
                    studentId: item.user.studentId,
                },
                borrowCount: item.borrowCount,
            })),
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


