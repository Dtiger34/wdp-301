const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'hangnguyenthithu32@gmail.com',
        pass: 'oxxf kmxl thad jnpj', // App password
    },
});

exports.sendReminderEmail = async (to, name, bookTitle, dueDate) => {
    const formattedDate = new Date(dueDate).toLocaleString('vi-VN');

    const mailOptions = {
        from: 'hangnguyenthithu32@gmail.com',
        to,
        subject: 'Nhắc nhở trả sách',
        html: `
      <p>Xin chào ${name},</p>
      <p>Đây là nhắc nhở rằng bạn đã mượn sách <strong>${bookTitle}</strong>, và hạn trả là <strong>${formattedDate}</strong>.</p>
      <p>Vui lòng trả sách đúng hạn để tránh bị phạt.</p>
      <p>Trân trọng,<br/>Thư viện</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent to", to);
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
    }
};
