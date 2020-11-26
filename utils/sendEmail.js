const nodemailer = require("nodemailer");

const sendEmail = async (options) =>  {



    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        },
    });


    let message = {
        from: process.env.FROM_NAME,
        to: options.email ,
        subject: options.subject,
        text : options.message,

    };
    const info = await  transporter.sendMail(message);



};

module.exports = sendEmail;
