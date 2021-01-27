const nodemailer = require('nodemailer');

module.exports = {
  sendMailToUser: async () => {
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
      from: '"Node js" <admin@rstinder.com>',
      to: "choco-cat2014@yandex.ru, catchoco2014@gmail.com, choco-cat@mail.ru",
      subject: "TEST 2.Message from Node js",
      text: "This message was sent from Node js server.",
      html: "This <i>message</i> was sent from <strong>Node js</strong> server."
    });

    console.log(result);
  }
};

