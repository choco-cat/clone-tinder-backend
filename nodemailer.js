const nodemailer = require('nodemailer');

module.exports = {
  sendMailToUser: async (email, subject, html, from, replyTo) => {
    console.log(email, subject, html, from);
    //const testEmailAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'mail.rstinder.com',
      port: 465,
      secure: true,
      auth: {
        user: 'admin@rstinder.com',
        pass: 'GfP7k=b{e%lR'
      }
    });

    const result = await transporter.sendMail({
      from: from,
      to: email,
      subject: subject,
  //    text: "Letter activation account",
      html: html,
      replyTo: replyTo
    });
  }
};

