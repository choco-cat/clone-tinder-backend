const nodemailer = require('nodemailer');
const sendMail = async () => {
        //const testEmailAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'mail.rstinder.com',
            port: 465,
            secure: false,
            auth: {
                user: 'admin@rstinder.com',
                pass: 'GfP7k=b{e%lR'
            }
        });

        const result = await transporter.sendMail({
            from: '"Node js" <admin@rstinder.com>',
            to: "choco-cat@mail.ru, choco-cat2014@yandex.ru",
            subject: "Message from Node js",
            text: "This message was sent from Node js server.",
            html: "This <i>message</i> was sent from <strong>Node js</strong> server."
        });

        console.log(result);
    };

module.exports.name = 'TEST';
module.exports.info = sendMail;
