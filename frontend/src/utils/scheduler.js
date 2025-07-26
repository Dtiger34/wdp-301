const cron = require('node-cron');
const axios = require('axios');

const ADMIN_TOKEN = 'your_admin_token'; // hoặc sinh token bằng jwt.sign() nếu cần

cron.schedule('0 9 * * *', async () => {
    console.log('⏰ [Scheduler] Gửi yêu cầu đến API nhắc nhở...');

    try {
        const res = await axios.get('http://localhost:9999/api/v1/borrows/admin/send-reminder-emails', {
            headers: {
                Authorization: `Bearer ${ADMIN_TOKEN}`
            }
        });
        console.log('✅ Đã gửi yêu cầu nhắc nhở:', res.data);
    } catch (err) {
        console.error('❌ Lỗi khi gọi API nhắc nhở:', err.response?.data || err.message);
    }
});
