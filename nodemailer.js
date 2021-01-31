const nodemailer = require('nodemailer');

module.exports = {
  sendMailToUser: async (email, activationLink) => {
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
      from: '"Admin" <admin@rstinder.com>',
      to: email,
      subject: "Activation your account on rstinder.com",
      text: "Letter activation account",
      html: `You have registered at rsclone.com.<br />To activate your account, please follow the link:<br /> <a href="${activationLink}">${activationLink}</a>`
    });
  }
};

