const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require('html-to-text');



module.exports = class Email {
    constructor (user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url
        this.from = `Natours <${process.env.FROM_EMAIL}>`
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {
            //Sendgrid
            return 1;
        }
        return  nodemailer.createTransport({
            host: process.env.STMP_HOST,
            port: process.env.STMP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.STMP_USERNAME,
                pass: process.env.STMP_PASSWORD
            },
        });
    }

    async send(template, subject) {
        // send the actual email
        // 1 . Render html base on pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //2. Define email options
        let mailOptions = {
            from: this.from,
            to: this.to ,
            subject,
            html,
            text : htmlToText.fromString(html)
        };


        //3. Create Transport and  send Email
        await  this.newTransport().sendMail(mailOptions);



    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome To The Natours');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Password Reset Token')
    }


};




