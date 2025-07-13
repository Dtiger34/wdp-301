const Fine = require('../model/fine');
const BorrowRecord = require('../model/borrowHistory');
const User = require('../model/user');

// @done: Get all fines with pagination and filters
exports.getAllFines = async (req, res) => {
	try {
		const { page = 1, limit = 10, paid, userId, reason } = req.query;

		const query = {};
		if (paid !== undefined) query.paid = paid === 'true';
		if (userId) query.user = userId;
		if (reason) query.reason = reason;

		const fines = await Fine.find(query)
			.populate('user', 'name studentId email')
			.populate('borrowRecord', 'bookId dueDate returnDate')
			.populate({
				path: 'borrowRecord',
				populate: {
					path: 'bookId',
					select: 'title author isbn',
				},
			})
			.populate('processedBy', 'name studentId')
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Fine.countDocuments(query);

		res.status(200).json({
			fines,
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

// @done: Get user's fines
exports.getUserFines = async (req, res) => {
	try {
		const userId = req.user.id;
		const { paid } = req.query;

		const query = { user: userId };
		if (paid !== undefined) query.paid = paid === 'true';

		const fines = await Fine.find(query)
			.populate('borrowRecord', 'bookId dueDate returnDate')
			.populate({
				path: 'borrowRecord',
				populate: {
					path: 'bookId',
					select: 'title author isbn',
				},
			})
			.sort({ createdAt: -1 });

		const totalAmount = fines.reduce((sum, fine) => sum + fine.amount, 0);
		const unpaidAmount = fines.filter((fine) => !fine.paid).reduce((sum, fine) => sum + fine.amount, 0);

		res.status(200).json({
			fines,
			summary: {
				totalFines: fines.length,
				totalAmount,
				unpaidAmount,
				paidAmount: totalAmount - unpaidAmount,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @done: Mark fine as paid
exports.markFineAsPaid = async (req, res) => {
	try {
		const fineId = req.params.id;
		const staffId = req.user.id;
		const { paymentMethod, paymentNote } = req.body;

		const fine = await Fine.findById(fineId)
			.populate('user', 'name studentId')
			.populate('borrowRecord', 'bookId')
			.populate({
				path: 'borrowRecord',
				populate: {
					path: 'bookId',
					select: 'title author',
				},
			});

		if (!fine) {
			return res.status(404).json({ message: 'Fine not found' });
		}

		if (fine.paid) {
			return res.status(400).json({ message: 'Fine already paid' });
		}

		fine.paid = true;
		fine.paidAt = new Date();
		fine.processedBy = staffId;
		if (paymentNote) fine.note = paymentNote;

		await fine.save();

		res.status(200).json({
			message: 'Fine marked as paid successfully',
			fine,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @done: Get fine statistics
exports.getFineStatistics = async (req, res) => {
	try {
		const { fromDate, toDate } = req.query;

		const dateFilter = {};
		if (fromDate) dateFilter.$gte = new Date(fromDate);
		if (toDate) dateFilter.$lte = new Date(toDate);

		const matchFilter = {};
		if (Object.keys(dateFilter).length > 0) {
			matchFilter.createdAt = dateFilter;
		}

		// Overall statistics
		const overallStats = await Fine.aggregate([
			{ $match: matchFilter },
			{
				$group: {
					_id: null,
					totalFines: { $sum: 1 },
					totalAmount: { $sum: '$amount' },
					paidFines: { $sum: { $cond: ['$paid', 1, 0] } },
					unpaidFines: { $sum: { $cond: ['$paid', 0, 1] } },
					paidAmount: { $sum: { $cond: ['$paid', '$amount', 0] } },
					unpaidAmount: { $sum: { $cond: ['$paid', 0, '$amount'] } },
				},
			},
		]);

		// Statistics by reason
		const reasonStats = await Fine.aggregate([
			{ $match: matchFilter },
			{
				$group: {
					_id: '$reason',
					count: { $sum: 1 },
					totalAmount: { $sum: '$amount' },
					paidCount: { $sum: { $cond: ['$paid', 1, 0] } },
					unpaidCount: { $sum: { $cond: ['$paid', 0, 1] } },
				},
			},
			{ $sort: { totalAmount: -1 } },
		]);

		// Top users with most fines
		const topUsers = await Fine.aggregate([
			{ $match: matchFilter },
			{
				$group: {
					_id: '$user',
					totalFines: { $sum: 1 },
					totalAmount: { $sum: '$amount' },
					unpaidAmount: { $sum: { $cond: ['$paid', 0, '$amount'] } },
				},
			},
			{ $sort: { totalAmount: -1 } },
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

		res.status(200).json({
			overall: overallStats[0] || {
				totalFines: 0,
				totalAmount: 0,
				paidFines: 0,
				unpaidFines: 0,
				paidAmount: 0,
				unpaidAmount: 0,
			},
			byReason: reasonStats,
			topUsers: topUsers.map((item) => ({
				user: {
					_id: item.user._id,
					name: item.user.name,
					studentId: item.user.studentId,
				},
				totalFines: item.totalFines,
				totalAmount: item.totalAmount,
				unpaidAmount: item.unpaidAmount,
			})),
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @done: Create manual fine
exports.createManualFine = async (req, res) => {
	try {
		const { userId, borrowRecordId, reason, amount, note } = req.body;
		const staffId = req.user.id;

		// Validate input
		if (!userId || !reason || !amount) {
			return res.status(400).json({
				message: 'User ID, reason, and amount are required',
			});
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if borrow record exists (if provided)
		let borrowRecord = null;
		if (borrowRecordId) {
			borrowRecord = await BorrowRecord.findById(borrowRecordId);
			if (!borrowRecord) {
				return res.status(404).json({ message: 'Borrow record not found' });
			}
		}

		// Create fine
		const fine = await Fine.create({
			user: userId,
			borrowRecord: borrowRecordId || null,
			reason,
			amount,
			note,
			processedBy: staffId,
		});

		await fine.populate([
			{ path: 'user', select: 'name studentId' },
			{ path: 'borrowRecord', select: 'bookId dueDate' },
			{ path: 'processedBy', select: 'name studentId' },
		]);

		res.status(201).json({
			message: 'Fine created successfully',
			fine,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @done: Update fine
exports.updateFine = async (req, res) => {
	try {
		const fineId = req.params.id;
		const { amount, note, reason } = req.body;

		const fine = await Fine.findById(fineId);
		if (!fine) {
			return res.status(404).json({ message: 'Fine not found' });
		}

		if (fine.paid) {
			return res.status(400).json({ message: 'Cannot update paid fine' });
		}

		if (amount !== undefined) fine.amount = amount;
		if (note !== undefined) fine.note = note;
		if (reason !== undefined) fine.reason = reason;

		await fine.save();

		await fine.populate([
			{ path: 'user', select: 'name studentId' },
			{ path: 'borrowRecord', select: 'bookId dueDate' },
			{ path: 'processedBy', select: 'name studentId' },
		]);

		res.status(200).json({
			message: 'Fine updated successfully',
			fine,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// @done: Delete fine
exports.deleteFine = async (req, res) => {
	try {
		const fineId = req.params.id;

		const fine = await Fine.findById(fineId);
		if (!fine) {
			return res.status(404).json({ message: 'Fine not found' });
		}

		if (fine.paid) {
			return res.status(400).json({ message: 'Cannot delete paid fine' });
		}

		await Fine.findByIdAndDelete(fineId);

		res.status(200).json({
			message: 'Fine deleted successfully',
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
