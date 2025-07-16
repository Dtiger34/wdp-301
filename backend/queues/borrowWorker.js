const { borrowQueue } = require('./borrowQueue');
const Book = require('../model/book');
const Inventory = require('../model/Inventory');
const BorrowRecord = require('../model/borrowHistory');
const mongoose = require('mongoose');

// Xử lý công việc yêu cầu mượn
const processBorrowRequest = async (job) => {
	const { userId, bookId, isReadOnSite, notes, dueDate, quantity, borrowDuration } = job.data;

	console.log(`🔄 Processing borrow request job ${job.id} for user ${userId}`);

	try {
		let result;

		// Cập nhật tiến độ công việc
		job.progress(10);

		// 1. Kiểm tra xem sách có tồn tại không
		const book = await Book.findById(bookId);
		if (!book) {
			throw new Error('Book not found');
		}

		job.progress(20);

		// 2. Check inventory
		const inventory = await Inventory.findOne({ book: bookId });
		if (!inventory) {
			throw new Error('Book inventory not found');
		}

		job.progress(30);

		// 3. Kiểm tra xem có đủ bản sao không
		if (inventory.available < quantity) {
			throw new Error(`Not enough copies available. Available: ${inventory.available}, Requested: ${quantity}`);
		}

		job.progress(50);

		// 4. Kiểm tra các yêu cầu đang chờ xử lý/đã mượn cho người dùng và cuốn sách này
		const existingRequest = await BorrowRecord.findOne({
			userId,
			bookId,
			status: { $in: ['pending', 'borrowed'] },
		});

		if (existingRequest) {
			throw new Error('Bạn đã có yêu cầu mượn đang chờ xử lý hoặc đang hoạt động cho cuốn sách này');
		}

		job.progress(70);

		// 5. Xác thực ngày đáo hạn
		if (!dueDate || isNaN(new Date(dueDate))) {
			throw new Error('Invalid or missing dueDate');
		}

		// 6. Xác thực borrowDuration
		if (!borrowDuration || borrowDuration <= 0) {
			throw new Error('Invalid borrow duration');
		}

		job.progress(80);

		// 7. Tạo yêu cầu mượn
		const borrowRequest = await BorrowRecord.create([
			{
				userId,
				bookId,
				dueDate: new Date(dueDate),
				isReadOnSite: isReadOnSite || false,
				notes: notes || '',
				quantity: parseInt(quantity),
				borrowDuration: parseInt(borrowDuration),
				status: 'pending',
			},
		]);

		console.log(`✅ Created borrow request ${borrowRequest[0]._id} for user ${userId}`);

		job.progress(90);

		// 8. Điền kết quả
		await borrowRequest[0].populate(['userId', 'bookId']);

		// Cập nhật tiến độ công việc
		job.progress(100);

		result = {
			success: true,
			message: 'Borrow request created successfully',
			borrowRequest: borrowRequest[0],
		};

		return result;
	} catch (error) {
		console.error(`❌ Error processing borrow request job ${job.id}:`, error.message);

		// Cập nhật tiến độ công việc khi có lỗi
		job.progress(0);

		throw new Error(error.message);
	}
};

// Đăng ký bộ xử lý công việc với độ đồng thời là 1 để ngăn chặn tình trạng chạy đua
borrowQueue.process('processBorrowRequest', 1, async (job) => {
	try {
		return await processBorrowRequest(job);
	} catch (error) {
		console.error(`❌ Job ${job.id} failed:`, error.message);
		throw error;
	}
});

// Trình xử lý sự kiện hàng đợi
borrowQueue.on('completed', (job, result) => {
	console.log(`✅ Job ${job.id} completed successfully`);
});

borrowQueue.on('failed', (job, err) => {
	console.error(`❌ Job ${job.id} failed:`, err.message);
});

borrowQueue.on('stalled', (job) => {
	console.warn(`⚠️  Job ${job.id} stalled`);
});

borrowQueue.on('active', (job) => {
	console.log(`🔄 Job ${job.id} is now active`);
});

borrowQueue.on('waiting', (job) => {
	console.log(`⏳ Job ${job.id} is waiting`);
});

// Tắt máy nhẹ nhàng
process.on('SIGINT', async () => {
	console.log('🛑 Shutting down borrow queue worker...');
	try {
		await borrowQueue.close();
		console.log('✅ Borrow queue worker shutdown complete');
	} catch (error) {
		console.error('❌ Error during shutdown:', error);
	}
	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.log('🛑 Received SIGTERM, shutting down borrow queue worker...');
	try {
		await borrowQueue.close();
		console.log('✅ Borrow queue worker shutdown complete');
	} catch (error) {
		console.error('❌ Error during shutdown:', error);
	}
	process.exit(0);
});

console.log('🚀 Borrow queue worker started');

module.exports = {
	processBorrowRequest,
};
