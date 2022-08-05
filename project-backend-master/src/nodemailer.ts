const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'UNSWTreats@gmail.com',
    pass: 'kgslfxyklcwktqcl'
  }
});

const sendMail = (email: string, message: string) => {
  transporter.sendMail({
    from: '"donotreply@UNSWTreats.com"UNSWTreats@gmail.com',
    to: email,
    subject: 'Password Reset Code',
    text: message
  });
};

export {
  sendMail
};
