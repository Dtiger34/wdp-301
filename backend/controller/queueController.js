const { addBorrowRequestJob, getJobStatus } = require('../queues/borrowQueue');

// @queue: Tạo yêu cầu mượn sách sử dụng message queue
exports.createBorrowRequestQueue = async (req, res) => {
	try {
		const { bookId, isReadOnSite, notes, dueDate, quantity, borrowDuration } = req.body;
		const userId = req.user.id;

		// Validate input
		if (!bookId || !dueDate || !quantity || !borrowDuration) {
			return res.status(400).json({
				message: 'Missing required fields: bookId, dueDate, quantity, borrowDuration',
			});
		}

		// Validate quantity
		if (quantity <= 0) {
			return res.status(400).json({
				message: 'Quantity must be greater than 0',
			});
		}

		// Validate dueDate
		if (isNaN(new Date(dueDate))) {
			return res.status(400).json({
				message: 'Invalid dueDate format',
			});
		}

		// Validate borrowDuration
		if (borrowDuration <= 0) {
			return res.status(400).json({
				message: 'Borrow duration must be greater than 0',
			});
		}

		// Create job data
		const jobData = {
			userId,
			bookId,
			isReadOnSite: isReadOnSite || false,
			notes: notes || '',
			dueDate,
			quantity: parseInt(quantity),
			borrowDuration: parseInt(borrowDuration),
			timestamp: new Date(),
		};

		// Add job to queue
		const job = await addBorrowRequestJob(jobData);

		res.status(202).json({
			message: 'Borrow request has been queued for processing',
			jobId: job.id,
			status: 'queued',
			estimatedWaitTime: '1-3 seconds',
		});
	} catch (error) {
		console.error('❌ Error creating borrow request job:', error);
		res.status(500).json({
			message: 'Failed to queue borrow request',
			error: error.message,
		});
	}
};

// @queue: Kiểm tra trạng thái job mượn sách
exports.getBorrowRequestJobStatus = async (req, res) => {
	try {
		const { jobId } = req.params;

		if (!jobId) {
			return res.status(400).json({
				message: 'Job ID is required',
			});
		}

		const jobStatus = await getJobStatus(jobId);

		// Map job status to user-friendly messages
		const statusMessages = {
			waiting: 'Đang chờ xử lý...',
			active: 'Đang xử lý yêu cầu...',
			completed: 'Yêu cầu mượn sách đã được tạo thành công!',
			failed: 'Yêu cầu thất bại',
			delayed: 'Yêu cầu đang được trì hoãn',
			not_found: 'Không tìm thấy yêu cầu',
		};

		const response = {
			jobId,
			status: jobStatus.status,
			message: statusMessages[jobStatus.status] || 'Trạng thái không xác định',
			progress: jobStatus.progress || 0,
		};

		// Include result data if job completed successfully
		if (jobStatus.status === 'completed' && jobStatus.result) {
			response.data = jobStatus.result;
		}

		// Include error information if job failed
		if (jobStatus.status === 'failed' && jobStatus.failedReason) {
			response.error = jobStatus.failedReason;
		}

		// Set appropriate HTTP status code
		let httpStatus = 200;
		if (jobStatus.status === 'failed') {
			httpStatus = 400;
		} else if (jobStatus.status === 'not_found') {
			httpStatus = 404;
		}

		res.status(httpStatus).json(response);
	} catch (error) {
		console.error('❌ Error getting job status:', error);
		res.status(500).json({
			message: 'Failed to get job status',
			error: error.message,
		});
	}
};

// @queue: Lấy thống kê queue
exports.getQueueStats = async (req, res) => {
	try {
		const { borrowQueue } = require('../queues/borrowQueue');

		const [waiting, active, completed, failed, delayed] = await Promise.all([
			borrowQueue.getWaiting(),
			borrowQueue.getActive(),
			borrowQueue.getCompleted(),
			borrowQueue.getFailed(),
			borrowQueue.getDelayed(),
		]);

		const stats = {
			waiting: waiting.length,
			active: active.length,
			completed: completed.length,
			failed: failed.length,
			delayed: delayed.length,
			total: waiting.length + active.length + completed.length + failed.length + delayed.length,
			isHealthy: active.length < 10 && waiting.length < 100, // Define health criteria
		};

		res.status(200).json({
			message: 'Queue statistics retrieved successfully',
			stats,
			timestamp: new Date(),
		});
	} catch (error) {
		console.error('❌ Error getting queue stats:', error);
		res.status(500).json({
			message: 'Failed to get queue statistics',
			error: error.message,
		});
	}
};
