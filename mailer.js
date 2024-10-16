const nodemailer = require('nodemailer');

const sendAlertEmail = async (subject, message) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: 'dev@gmail.com', // Replace with actual recipient
        subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${subject}`);
    } catch (error) {
        // console.error(`Error sending email: ${error.message}`);
    }
};

module.exports = { sendAlertEmail };
