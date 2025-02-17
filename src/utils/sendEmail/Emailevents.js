import { customAlphabet } from 'nanoid'
import { EventEmitter } from 'events'
import { sendEmail, subject } from './sendEmail.js';
import { template } from './generateHTML.js';
import { userModel } from '../../DB/models/user.model.js';
import { hash } from '../hashing/hash.js';
import { updateOne } from '../../DB/db.service.js';
export const emailEmitter = new EventEmitter()

export const createOtp = () => {
    const otp = customAlphabet('0123456789', 6)()
    return otp;
}

const updateOtpField =async({_id,data})=>{
    await updateOne({model:userModel,filter:{_id},data})
}
emailEmitter.on('confirmEmail', async ({ email, userName, id }) => {
    const otp = createOtp()
    updateOtpField({
        _id:id,
        data:{
            confirmEmailOtp:hash(otp)
        }
    })
    sendEmail({
        to: email,
        subject: subject.register,
        html: template(otp, userName, subject.register)
    })
})
emailEmitter.on('updateEmail', async ({ email, userName, id }) => {
    const otp = createOtp()
    updateOtpField({
        _id:id,
        data:{
            tempEmailOtp:hash(otp)
        }
    })
    sendEmail({
        to: email,
        subject: subject.updateEmail,
        html: template(otp, userName, subject.updateEmail)
    })
})
emailEmitter.on('forgetPassword', async ({ email, userName, id }) => {
    const otp = createOtp()
    updateOtpField({
        _id:id,
        data:{
            resetPasswordOtp: hash(otp)
        }
    })
    sendEmail({
        to: email,
        subject: subject.resetPassword,
        html: template(otp, userName, subject.resetPassword)
    })
})