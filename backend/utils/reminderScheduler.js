const cron = require('node-cron');
const { handleReminderLogic } = require('../controller/emailReminder');

const startReminderScheduler = () => {
    console.log("🟡 Scheduler file loaded");

    // 👇 Gọi ngay khi server khởi động
    console.log("🚀 Running initial check on server start...");
    handleReminderLogic();

    // 👇 Gọi tự động lúc 7h sáng mỗi ngày
    cron.schedule(
        '0 7 * * *',
        () => {
            console.log('⏰ [Cron] Đang chạy nhắc nhở mượn sách lúc 7h sáng giờ VN...');
            handleReminderLogic();
        },
        {
            timezone: 'Asia/Ho_Chi_Minh',
        }
    );
};


module.exports = startReminderScheduler;