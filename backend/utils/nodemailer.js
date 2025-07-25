const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc smtp khác
  auth: {
    user: 'hangnguyenthithu32@gmail.com',
    pass: 'oxxf kmxl thad jnpj',
  },
});

exports.sendReminderEmail = async (to, name, bookTitle, dueDate) => {
  const formattedDate = new Date(dueDate).toLocaleString('vi-VN');

  const mailOptions = {
    from: 'your.email@gmail.com',
    to,
    subject: 'Nhắc nhở trả sách',
    html: `
      <p>Xin chào ${name},</p>
      <p>Đây là nhắc nhở rằng bạn đã mượn sách <strong>${bookTitle}</strong>, và hạn trả là <strong>${formattedDate}</strong>.</p>
      <p>Vui lòng trả sách đúng hạn để tránh bị phạt.</p>
      <p>Trân trọng,<br/>Thư viện</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
