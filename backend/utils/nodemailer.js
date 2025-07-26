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
exports.sendPickupConfirmationEmail = async (to, name, bookTitle) => {
    const mailOptions = {
        from: 'hangnguyenthithu32@gmail.com',
        to,
        subject: 'Xác nhận nhận sách thành công',
        html: `
      <p>Xin chào ${name},</p>
      <p>Yêu cầu mượn sách của bạn đã được chấp nhận: <strong>${bookTitle}</strong>.</p>
      <p>Chúc bạn đọc sách vui vẻ và đừng quên trả đúng hạn nhé!</p>
      <p>Trân trọng,<br/>Thư viện</p>
    `,
    };

    await transporter.sendMail(mailOptions);
};

exports.sendmailbyloginfirst = async (to, name, link) => {
    const mailOptions = {
        from: 'hangnguyenthithu32@gmail.com',
        to,
        subject: 'Yêu cầu đổi mật khẩu',
        html: `
            <p>Xin chào <strong>${name}</strong>,</p>
            <p>Bạn đã đăng nhập lần đầu vào hệ thống thư viện.</p>
            <p>Vui lòng nhấn vào liên kết bên dưới để đổi mật khẩu:</p>
          <p><a href="${link}">Nhấn vào đây</a></p>
            <p>Sau khi truy cập, bạn sẽ được yêu cầu nhập mật khẩu mới.</p>
        `
    };
    await transporter.sendMail(mailOptions);
    console.log("✅ Email xác nhận đổi mật khẩu gửi đến:", to);
};
