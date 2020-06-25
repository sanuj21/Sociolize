const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.user = user;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Anuj Sharma <mailtoanuj21@gmail.com>`;
  }

  // SEND THE MAIL
  async send(template, subject) {
    // RENDER HTML USING PUG
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject: subject
      }
    );

    // SEND EMAIL
    const mailOptions = {
      from: this.from,
      to: this.user.email,
      subject: subject,
      html,
      // IN SOME DEVICES HTML DOES NOT WORK IN MAILS
      text: htmlToText.fromString(html) // FOR FALLBACKS
    };

    await this.newTransport().sendMail(mailOptions);
  }

  sendResetToken() {
    this.send('resetPassword', 'Reset Password Token');
  }

  sendWelcome() {
    this.send('welcomeAndEmail', 'Welcome!!!');
  }

  sendEmailUpdateConfirm() {
    this.send('emailUpdateConfirmation', 'Email Change Request!!!');
  }
}

// ITS PROTOTYPE METHOD, AS THERE IS NO NEED TO USE THIS AS INSTANCE METHOD
Email.prototype.newTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

module.exports = Email;
