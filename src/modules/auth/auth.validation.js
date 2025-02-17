import joi from 'joi'
import { generalValidation } from '../../middleware/validation.middleware.js'

export const registerValidation = joi.object({
    userName:generalValidation.userName.required(),
    email:generalValidation.email.required(),
    password:generalValidation.password.required(),
    confirmPassword:generalValidation.confirmPassword.required(),
}).required()

export const confirmEmailValidation = joi.object({
    email:generalValidation.email.required(),
    code:generalValidation.code.required(),
}).required()


export const loginValidation = joi.object({
    email:generalValidation.email.required(),
    password:generalValidation.password.required(),
}).required()

export const refreshTokenValidation = joi.object({
    token:joi.string().required(),
}).required()


export const forgetPasswordValidation = joi.object({
    email:generalValidation.email.required(),
}).required()



export const resetPasswordValidation = joi.object({
    email:generalValidation.email.required(),
    code:generalValidation.code.required(),
    password:generalValidation.password.required(),
    confirmPassword:generalValidation.confirmPassword.required(),
}).required()