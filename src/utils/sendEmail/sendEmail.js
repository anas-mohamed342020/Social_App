import nodemailer from 'nodemailer'

export const sendEmail = ({to,subject,html}) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 465,
        service:'gmail',
        secure: true, // true for port 465, false for other ports
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD,
        },
    });

    async function main() {
        const info = await transporter.sendMail({
            from: `social App "<${process.env.USER_EMAIL}>"`, // sender address
            to, 
            subject, // Subject line
            html, // html body
        });

       
    }

    main().catch(console.error);

}


export const subject= {
    register : 'Activate Account',
    resetPassword : 'Reset Password',
    updateEmail:'Update Email'
}