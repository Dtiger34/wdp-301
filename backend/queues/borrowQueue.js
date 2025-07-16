const Queue = require('bull');

// Tạo hàng đợi xử lý yêu cầu mượn sách
const borrowQueue = new Queue('borrow requests', {
	redis: {
		host: process.env.REDIS_HOST || 'localhost',  // Địa chỉ Redis
		port: process.env.REDIS_PORT || 6379,         // Cổng Redis
		password: process.env.REDIS_PASSWORD || undefined, // Mật khẩu (nếu có)
		db: process.env.REDIS_DB || 0,                // Chọn DB trong Redis (mặc định là 0)
	},
});

// Cấu hình mặc định cho mỗi job trong queue
const QUEUE_OPTIONS = {
	removeOnComplete: 10, // Xoá job hoàn thành, giữ lại tối đa 10 job gần nhất
	removeOnFail: 10,     // Xoá job thất bại, giữ lại tối đa 10 job gần nhất
	attempts: 3,          // Thử lại tối đa 3 lần nếu job bị lỗi
	backoff: {
		type: 'exponential', // Kiểu lùi thời gian theo hàm mũ (2s, 4s, 8s,...)
		delay: 2000,         // Thời gian chờ ban đầu là 2 giây
	},
};

// Thêm một job xử lý yêu cầu mượn sách vào hàng đợi
const addBorrowRequestJob = async (jobData) => {
	try {
		const job = await borrowQueue.add('processBorrowRequest', jobData, {
			...QUEUE_OPTIONS,
			delay: 0, // Xử lý ngay lập tức
		});

		console.log(`📝 Đã thêm job yêu cầu mượn sách ${job.id} vào hàng đợi`);
		return job;
	} catch (error) {
		console.error('❌ Lỗi khi thêm job vào hàng đợi:', error);
		throw error;
	}
};

// Lấy trạng thái của một job theo ID
const getJobStatus = async (jobId) => {
	try {
		const job = await borrowQueue.getJob(jobId);
		if (!job) {
			return { status: 'not_found' }; // Job không tồn tại
		}

		const state = await job.getState(); // Lấy trạng thái (waiting, active, completed, failed,...)
		return {
			status: state,              // Trạng thái hiện tại
			data: job.data,             // Dữ liệu ban đầu của job
			result: job.returnvalue,    // Kết quả trả về nếu job thành công
			failedReason: job.failedReason, // Lý do thất bại (nếu có)
			progress: job.progress(),   // Tiến trình thực hiện (0–100%)
		};
	} catch (error) {
		console.error('❌ Lỗi khi lấy trạng thái job:', error);
		throw error;
	}
};

// Bắt sự kiện khi job hoàn thành
borrowQueue.on('completed', (job, result) => {
	console.log(`✅ Job ${job.id} đã hoàn thành thành công`);
});

// Bắt sự kiện khi job bị lỗi
borrowQueue.on('failed', (job, err) => {
	console.error(`❌ Job ${job.id} bị lỗi:`, err.message);
});

// Bắt sự kiện khi job bị "kẹt"
borrowQueue.on('stalled', (job) => {
	console.warn(`⚠️  Job ${job.id} bị treo (stalled)`);
});

// Xuất các hàm và biến cần thiết ra ngoài để sử dụng
module.exports = {
	borrowQueue,
	addBorrowRequestJob,
	getJobStatus,
	QUEUE_OPTIONS,
};
