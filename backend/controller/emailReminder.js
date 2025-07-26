const User = require('../model/user');
const XLSX = require('xlsx');
const jwtConfig = require('../config/jwtconfig');
const { sendReminderEmail } = require('../utils/nodemailer');
const BorrowRecord = require('../model/borrowHistory');

const handleReminderLogic = async () => {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log('📌 Bắt đầu kiểm tra nhắc nhở mượn sách...');
    console.log('🕒 Thời gian hiện tại:', now.toISOString());
    console.log('⏳ Mốc nhắc nhở trước 24H:', in48Hours.toISOString());

    const query = {
        dueDate: { $lte: in48Hours, $gt: now },
        status: 'borrowed',
        hasReminderEmailSent: false,
    };

    console.log('🔍 Đang tìm bản ghi mượn sách có điều kiện:');
    console.log(query);

    const records = await BorrowRecord.find(query)
        .populate('userId', 'email name')
        .populate('bookId', 'title');

    console.log(`📄 Tìm thấy ${records.length} bản ghi cần gửi nhắc nhở.`);

    let successCount = 0;

    for (const record of records) {
        const { userId, bookId, dueDate } = record;
        const userEmail = userId?.email;
        const userName = userId?.name;
        const bookTitle = bookId?.title;

        if (!userEmail || !userName || !bookTitle) {
            console.warn(`⚠️ Thiếu thông tin trong bản ghi ${record._id}:`, {
                userEmail,
                userName,
                bookTitle,
            });
            continue;
        }

        try {
            await sendReminderEmail(userEmail, userName, bookTitle, dueDate);

            record.hasReminderEmailSent = true;
            await record.save();

            console.log(`✅ Đã gửi email nhắc nhở tới: ${userEmail}`);
            successCount++;
        } catch (err) {
            console.error(`❌ Lỗi gửi email tới ${userEmail}:`, err.message);
        }
    }

    console.log(`🎉 Hoàn tất. Tổng số email gửi thành công: ${successCount}`);
    return { total: records.length, sent: successCount };
};

exports.checkAndSendReminders = async (req, res) => {
    try {
        await runReminderJob();
        res.status(200).json({ message: 'Reminder job executed.' });
    } catch (err) {
        console.error('❌ Error in reminder API:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { handleReminderLogic };