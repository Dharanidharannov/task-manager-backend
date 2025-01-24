import nodemailer from "nodemailer"

const fromAddress = "ddharannov14@gmail.com"
const password = "wwkj kzrn wfwh wmre"


const transportor = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: fromAddress,
        pass: password
    },
    service: 'gmail',
    secure: false,
    port: 587,
    tls: {
        rejectUnauthorized: false
    }
})

export const mailSender = async(data) =>{
    const options = {
        from: fromAddress,
        to: data.email,
        subject: data.subject,
        text: data.text
    }
    try {
        const result = await transportor.sendMail(options);
        console.log("Mail sended successfully");
        return true
    } catch (error) {
        console.log("Mail failed to send", error);
        return false
    }
}