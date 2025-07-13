const Book = require('../model/book');
const BorrowRecord = require('../model/borrowHistory');
const Inventory = require('../model/Inventory');
const Fine = require('../model/fine');
const Category = require('../model/categories');
const User = require('../model/user');

// 1. Lấy báo cáo tổng quan về số lượng sách mượn và trả trong một khoảng thời gian
exports.getBorrowReturnReport = async (req, res) => {
	try {
		const { fromDate, toDate, period = 'day' } = req.query; // period: day, week, month

		// Build date filter
		const dateFilter = {};
		if (fromDate) dateFilter.$gte = new Date(fromDate);
		if (toDate) dateFilter.$lte = new Date(toDate);

		// Group by period
		let groupFormat;
		switch (period) {
			case 'week':
				groupFormat = {
					year: { $year: '$createdRequestAt' },
					week: { $week: '$createdRequestAt' },
				};
				break;
			case 'month':
				groupFormat = {
					year: { $year: '$createdRequestAt' },
					month: { $month: '$createdRequestAt' },
				};
				break;
			default: // day
				groupFormat = {
					year: { $year: '$createdRequestAt' },
					month: { $month: '$createdRequestAt' },
					day: { $dayOfMonth: '$createdRequestAt' },
				};
		}

		// Build match filter
		const matchFilter = {};
		if (Object.keys(dateFilter).length > 0) {
			matchFilter.createdRequestAt = dateFilter;
		}

		// Get borrow statistics
		const borrowStats = await BorrowRecord.aggregate([
			{ $match: { ...matchFilter, status: { $in: ['borrowed', 'returned'] } } },
			{
				$group: {
					_id: groupFormat,
					totalBorrowed: { $sum: 1 },
					totalQuantity: { $sum: '$quantity' },
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
		]);

		// Get return statistics
		const returnFilter = { ...matchFilter, status: 'returned' };
		if (Object.keys(dateFilter).length > 0) {
			returnFilter.returnDate = dateFilter;
		}

		const returnStats = await BorrowRecord.aggregate([
			{ $match: returnFilter },
			{
				$group: {
					_id:
						period === 'day'
							? {
									year: { $year: '$returnDate' },
									month: { $month: '$returnDate' },
									day: { $dayOfMonth: '$returnDate' },
							  }
							: period === 'week'
							? {
									year: { $year: '$returnDate' },
									week: { $week: '$returnDate' },
							  }
							: {
									year: { $year: '$returnDate' },
									month: { $month: '$returnDate' },
							  },
					totalReturned: { $sum: 1 },
					totalReturnedQuantity: { $sum: '$quantity' },
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
		]);

		// Get overall summary
		const overallSummary = await BorrowRecord.aggregate([
			{ $match: matchFilter },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
					totalQuantity: { $sum: '$quantity' },
				},
			},
		]);

		res.status(200).json({
			period,
			dateRange: { fromDate, toDate },
			borrowStatistics: borrowStats,
			returnStatistics: returnStats,
			overallSummary: overallSummary.reduce((acc, stat) => {
				acc[stat._id] = {
					count: stat.count,
					totalQuantity: stat.totalQuantity,
				};
				return acc;
			}, {}),
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 2. Lấy danh sách các sách được mượn nhiều nhất trong một khoảng thời gian
exports.getMostBorrowedBooks = async (req, res) => {
	try {
		const { fromDate, toDate, limit = 10 } = req.query;

		// Build date filter
		const dateFilter = {};
		if (fromDate) dateFilter.$gte = new Date(fromDate);
		if (toDate) dateFilter.$lte = new Date(toDate);

		const matchFilter = { status: { $in: ['borrowed', 'returned'] } };
		if (Object.keys(dateFilter).length > 0) {
			matchFilter.createdRequestAt = dateFilter;
		}

		const mostBorrowedBooks = await BorrowRecord.aggregate([
			{ $match: matchFilter },
			{
				$group: {
					_id: '$bookId',
					borrowCount: { $sum: 1 },
					totalQuantity: { $sum: '$quantity' },
					uniqueBorrowers: { $addToSet: '$userId' },
				},
			},
			{
				$addFields: {
					uniqueBorrowersCount: { $size: '$uniqueBorrowers' },
				},
			},
			{ $sort: { borrowCount: -1 } },
			{ $limit: parseInt(limit) },
			{
				$lookup: {
					from: 'books',
					localField: '_id',
					foreignField: '_id',
					as: 'book',
				},
			},
			{ $unwind: '$book' },
			{
				$lookup: {
					from: 'inventories',
					localField: '_id',
					foreignField: 'book',
					as: 'inventory',
				},
			},
			{
				$addFields: {
					inventory: { $arrayElemAt: ['$inventory', 0] },
				},
			},
		]);

		res.status(200).json({
			dateRange: { fromDate, toDate },
			mostBorrowedBooks: mostBorrowedBooks.map((item) => ({
				book: {
					_id: item.book._id,
					title: item.book.title,
					author: item.book.author,
					isbn: item.book.isbn,
					image: item.book.image,
				},
				borrowCount: item.borrowCount,
				totalQuantity: item.totalQuantity,
				uniqueBorrowersCount: item.uniqueBorrowersCount,
				inventory: item.inventory || { total: 0, available: 0, borrowed: 0, damaged: 0, lost: 0 },
			})),
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 3. Lấy danh sách các người dùng mượn nhiều sách nhất
exports.getTopBorrowers = async (req, res) => {
	try {
		const { fromDate, toDate, limit = 10 } = req.query;

		// Build date filter
		const dateFilter = {};
		if (fromDate) dateFilter.$gte = new Date(fromDate);
		if (toDate) dateFilter.$lte = new Date(toDate);

		const matchFilter = { status: { $in: ['borrowed', 'returned'] } };
		if (Object.keys(dateFilter).length > 0) {
			matchFilter.createdRequestAt = dateFilter;
		}

		const topBorrowers = await BorrowRecord.aggregate([
			{ $match: matchFilter },
			{
				$group: {
					_id: '$userId',
					borrowCount: { $sum: 1 },
					totalQuantity: { $sum: '$quantity' },
					uniqueBooks: { $addToSet: '$bookId' },
					currentBorrowedCount: {
						$sum: { $cond: [{ $eq: ['$status', 'borrowed'] }, 1, 0] },
					},
					returnedCount: {
						$sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] },
					},
				},
			},
			{
				$addFields: {
					uniqueBooksCount: { $size: '$uniqueBooks' },
				},
			},
			{ $sort: { borrowCount: -1 } },
			{ $limit: parseInt(limit) },
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

		// Get fine information for each user
		const topBorrowersWithFines = await Promise.all(
			topBorrowers.map(async (borrower) => {
				const fines = await Fine.find({
					user: borrower._id,
					...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
				});

				const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
				const unpaidFines = fines.filter((fine) => !fine.paid).reduce((sum, fine) => sum + fine.amount, 0);

				return {
					user: {
						_id: borrower.user._id,
						name: borrower.user.name,
						studentId: borrower.user.studentId,
						email: borrower.user.email,
					},
					borrowCount: borrower.borrowCount,
					totalQuantity: borrower.totalQuantity,
					uniqueBooksCount: borrower.uniqueBooksCount,
					currentBorrowedCount: borrower.currentBorrowedCount,
					returnedCount: borrower.returnedCount,
					totalFines,
					unpaidFines,
				};
			})
		);

		res.status(200).json({
			dateRange: { fromDate, toDate },
			topBorrowers: topBorrowersWithFines,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 4. Lấy danh sách các sách chưa được trả và quá hạn
exports.getOverdueBooks = async (req, res) => {
	try {
		const { page = 1, limit = 10, sortBy = 'daysOverdue', sortOrder = 'desc' } = req.query;
		const currentDate = new Date();

		// Find overdue books
		const overdueBooks = await BorrowRecord.find({
			status: 'borrowed',
			dueDate: { $lt: currentDate },
		})
			.populate('userId', 'name studentId email phone')
			.populate('bookId', 'title author isbn image price')
			.populate('processedBy', 'name')
			.sort({ createdRequestAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await BorrowRecord.countDocuments({
			status: 'borrowed',
			dueDate: { $lt: currentDate },
		});

		// Calculate days overdue and potential fines
		const overdueWithDetails = overdueBooks.map((record) => {
			const daysOverdue = Math.ceil((currentDate - record.dueDate) / (1000 * 60 * 60 * 24));
			const potentialFine = daysOverdue * 5000; // 5000 VND per day

			return {
				_id: record._id,
				user: record.userId,
				book: record.bookId,
				borrowDate: record.borrowDate,
				dueDate: record.dueDate,
				daysOverdue,
				potentialFine,
				quantity: record.quantity,
				isReadOnSite: record.isReadOnSite,
				processedBy: record.processedBy,
			};
		});

		// Sort by specified criteria
		if (sortBy === 'daysOverdue') {
			overdueWithDetails.sort((a, b) =>
				sortOrder === 'desc' ? b.daysOverdue - a.daysOverdue : a.daysOverdue - b.daysOverdue
			);
		} else if (sortBy === 'potentialFine') {
			overdueWithDetails.sort((a, b) =>
				sortOrder === 'desc' ? b.potentialFine - a.potentialFine : a.potentialFine - b.potentialFine
			);
		}

		// Summary statistics
		const summary = {
			totalOverdueRecords: total,
			totalOverdueBooks: overdueWithDetails.reduce((sum, record) => sum + record.quantity, 0),
			totalPotentialFines: overdueWithDetails.reduce((sum, record) => sum + record.potentialFine, 0),
			averageDaysOverdue:
				overdueWithDetails.length > 0
					? Math.round(
							overdueWithDetails.reduce((sum, record) => sum + record.daysOverdue, 0) /
								overdueWithDetails.length
					  )
					: 0,
		};

		res.status(200).json({
			overdueBooks: overdueWithDetails,
			summary,
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

// 5. Lấy báo cáo thống kê về tình trạng sách theo thể loại
exports.getInventoryStatsByCategory = async (req, res) => {
	try {
		const inventoryStats = await Category.aggregate([
			{
				$lookup: {
					from: 'books',
					localField: '_id',
					foreignField: 'categories',
					as: 'books',
				},
			},
			{
				$unwind: {
					path: '$books',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'inventories',
					localField: 'books._id',
					foreignField: 'book',
					as: 'inventory',
				},
			},
			{
				$unwind: {
					path: '$inventory',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$group: {
					_id: {
						categoryId: '$_id',
						categoryName: '$name',
						categoryDescription: '$description',
					},
					totalBooks: { $sum: 1 },
					totalCopies: { $sum: { $ifNull: ['$inventory.total', 0] } },
					availableCopies: { $sum: { $ifNull: ['$inventory.available', 0] } },
					borrowedCopies: { $sum: { $ifNull: ['$inventory.borrowed', 0] } },
					damagedCopies: { $sum: { $ifNull: ['$inventory.damaged', 0] } },
					lostCopies: { $sum: { $ifNull: ['$inventory.lost', 0] } },
					books: { $push: '$books._id' },
				},
			},
			{
				$addFields: {
					availabilityRate: {
						$cond: [
							{ $gt: ['$totalCopies', 0] },
							{ $multiply: [{ $divide: ['$availableCopies', '$totalCopies'] }, 100] },
							0,
						],
					},
					utilizationRate: {
						$cond: [
							{ $gt: ['$totalCopies', 0] },
							{ $multiply: [{ $divide: ['$borrowedCopies', '$totalCopies'] }, 100] },
							0,
						],
					},
				},
			},
			{ $sort: { '_id.categoryName': 1 } },
		]);

		// Get borrowing statistics by category
		const borrowingStats = await BorrowRecord.aggregate([
			{ $match: { status: { $in: ['borrowed', 'returned'] } } },
			{
				$lookup: {
					from: 'books',
					localField: 'bookId',
					foreignField: '_id',
					as: 'book',
				},
			},
			{ $unwind: '$book' },
			{ $unwind: '$book.categories' },
			{
				$lookup: {
					from: 'categories',
					localField: 'book.categories',
					foreignField: '_id',
					as: 'category',
				},
			},
			{ $unwind: '$category' },
			{
				$group: {
					_id: '$category._id',
					categoryName: { $first: '$category.name' },
					totalBorrows: { $sum: 1 },
					totalQuantityBorrowed: { $sum: '$quantity' },
					currentlyBorrowed: {
						$sum: { $cond: [{ $eq: ['$status', 'borrowed'] }, '$quantity', 0] },
					},
					returned: {
						$sum: { $cond: [{ $eq: ['$status', 'returned'] }, '$quantity', 0] },
					},
				},
			},
		]);

		// Merge inventory and borrowing stats
		const combinedStats = inventoryStats.map((invStat) => {
			const borrowStat = borrowingStats.find((bs) => bs._id.toString() === invStat._id.categoryId.toString());

			return {
				category: {
					_id: invStat._id.categoryId,
					name: invStat._id.categoryName,
					description: invStat._id.categoryDescription,
				},
				inventory: {
					totalBooks: invStat.totalBooks,
					totalCopies: invStat.totalCopies,
					available: invStat.availableCopies,
					borrowed: invStat.borrowedCopies,
					damaged: invStat.damagedCopies,
					lost: invStat.lostCopies,
					availabilityRate: Math.round(invStat.availabilityRate * 100) / 100,
					utilizationRate: Math.round(invStat.utilizationRate * 100) / 100,
				},
				borrowing: {
					totalBorrows: borrowStat?.totalBorrows || 0,
					totalQuantityBorrowed: borrowStat?.totalQuantityBorrowed || 0,
					currentlyBorrowed: borrowStat?.currentlyBorrowed || 0,
					returned: borrowStat?.returned || 0,
				},
			};
		});

		// Overall summary
		const overallSummary = {
			totalCategories: combinedStats.length,
			totalBooks: combinedStats.reduce((sum, stat) => sum + stat.inventory.totalBooks, 0),
			totalCopies: combinedStats.reduce((sum, stat) => sum + stat.inventory.totalCopies, 0),
			totalAvailable: combinedStats.reduce((sum, stat) => sum + stat.inventory.available, 0),
			totalBorrowed: combinedStats.reduce((sum, stat) => sum + stat.inventory.borrowed, 0),
			totalDamaged: combinedStats.reduce((sum, stat) => sum + stat.inventory.damaged, 0),
			totalLost: combinedStats.reduce((sum, stat) => sum + stat.inventory.lost, 0),
		};

		res.status(200).json({
			summary: overallSummary,
			categoryStats: combinedStats,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// 6. Tính phí phạt cho sách quá hạn hoặc mất sách
exports.calculateFines = async (req, res) => {
	try {
		const { borrowRecordId } = req.params;
		const { condition = 'overdue' } = req.query; // overdue, lost, damaged

		const borrowRecord = await BorrowRecord.findById(borrowRecordId)
			.populate('bookId', 'title author price')
			.populate('userId', 'name studentId');

		if (!borrowRecord) {
			return res.status(404).json({ message: 'Borrow record not found' });
		}

		const currentDate = new Date();
		let fineAmount = 0;
		let fineDetails = {};

		switch (condition) {
			case 'overdue':
				if (borrowRecord.status === 'borrowed' && borrowRecord.dueDate < currentDate) {
					const daysLate = Math.ceil((currentDate - borrowRecord.dueDate) / (1000 * 60 * 60 * 24));
					fineAmount = daysLate * 5000; // 5000 VND per day
					fineDetails = {
						type: 'overdue',
						daysLate,
						ratePerDay: 5000,
						totalAmount: fineAmount,
					};
				}
				break;

			case 'damaged':
				fineAmount = borrowRecord.bookId.price * 0.3; // 30% of book price
				fineDetails = {
					type: 'damaged',
					bookPrice: borrowRecord.bookId.price,
					damageRate: 0.3,
					totalAmount: fineAmount,
				};
				break;

			case 'lost':
				fineAmount = borrowRecord.bookId.price; // Full book price
				fineDetails = {
					type: 'lost',
					bookPrice: borrowRecord.bookId.price,
					totalAmount: fineAmount,
				};
				break;
		}

		// Check if user has existing fines
		const existingFines = await Fine.find({ user: borrowRecord.userId._id, paid: false });
		const totalUnpaidFines = existingFines.reduce((sum, fine) => sum + fine.amount, 0);

		res.status(200).json({
			borrowRecord: {
				_id: borrowRecord._id,
				user: borrowRecord.userId,
				book: borrowRecord.bookId,
				borrowDate: borrowRecord.borrowDate,
				dueDate: borrowRecord.dueDate,
				status: borrowRecord.status,
			},
			fineCalculation: fineDetails,
			existingUnpaidFines: totalUnpaidFines,
			totalFineAfterThisCalculation: totalUnpaidFines + fineAmount,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Bonus: Get comprehensive dashboard statistics
exports.getDashboardStats = async (req, res) => {
	try {
		const currentDate = new Date();
		const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

		// Basic counts
		const [totalBooks, totalUsers, totalBorrowRecords, currentlyBorrowedCount, overdueCount, pendingCount] =
			await Promise.all([
				Book.countDocuments(),
				User.countDocuments({ role: 'user' }),
				BorrowRecord.countDocuments(),
				BorrowRecord.countDocuments({ status: 'borrowed' }),
				BorrowRecord.countDocuments({ status: 'borrowed', dueDate: { $lt: currentDate } }),
				BorrowRecord.countDocuments({ status: 'pending' }),
			]);

		// Monthly statistics
		const monthlyStats = await BorrowRecord.aggregate([
			{ $match: { createdRequestAt: { $gte: startOfMonth } } },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]);

		// Popular books this month
		const popularBooksThisMonth = await BorrowRecord.aggregate([
			{
				$match: {
					createdRequestAt: { $gte: startOfMonth },
					status: { $in: ['borrowed', 'returned'] },
				},
			},
			{
				$group: {
					_id: '$bookId',
					borrowCount: { $sum: 1 },
				},
			},
			{ $sort: { borrowCount: -1 } },
			{ $limit: 5 },
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

		// Revenue from fines
		const fineStats = await Fine.aggregate([
			{
				$group: {
					_id: null,
					totalFines: { $sum: '$amount' },
					paidFines: { $sum: { $cond: ['$paid', '$amount', 0] } },
					unpaidFines: { $sum: { $cond: ['$paid', 0, '$amount'] } },
				},
			},
		]);

		res.status(200).json({
			overview: {
				totalBooks,
				totalUsers,
				totalBorrowRecords,
				currentlyBorrowedCount,
				overdueCount,
				pendingCount,
			},
			monthlyStats: monthlyStats.reduce((acc, stat) => {
				acc[stat._id] = stat.count;
				return acc;
			}, {}),
			popularBooksThisMonth: popularBooksThisMonth.map((item) => ({
				book: item.book,
				borrowCount: item.borrowCount,
			})),
			fineStats: fineStats[0] || { totalFines: 0, paidFines: 0, unpaidFines: 0 },
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
