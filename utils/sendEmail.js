const nodemailer = require("nodemailer");

const sendEmail = async (options) =>  {


    const transporter = nodemailer.createTransport({
        host: process.env.STMP_HOST,
        port: process.env.STMP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.STMP_USERNAME,
            pass: process.env.STMP_PASSWORD
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
