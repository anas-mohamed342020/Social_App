import { StatusCodes } from "http-status-codes";
import { providers, roles, userModel } from "../../DB/models/user.model.js";
import { hash } from "../../utils/hashing/hash.js";
import { createOtp, emailEmitter } from "../../utils/sendEmail/Emailevents.js";
import { compare } from "../../utils/hashing/compare.js";
import { sign } from "../../utils/token/sign.js";
import { verify } from "../../utils/token/verify.js";
import { OAuth2Client } from 'google-auth-library'
import * as dbService from '../../DB/db.service.js'
import { decodedToken, tokenTypes } from "../../middleware/auth.middleware.js";
const client = new OAuth2Client();


export const register = async (req, res, next) => {
    const { userName, email, password } = req.body;
    const isEmailExist = await dbService.findOne({ model: userModel, filter: { email } });
    if (isEmailExist) {
        return next(new Error('Email already exist', StatusCodes.BAD_REQUEST));
    }

    // const user = await userModel.create({ userName, email, password: hash(password) });
    const user = await dbService.create({
        model: userModel,
        data: {
            userName,
            email,
            password
        }
    })
    emailEmitter.emit('confirmEmail', { email, userName, id: user._id });

    res.status(201).json({ message: "Done", user })
}

export const confirmEmail = async (req, res, next) => {
    const { email, code } = req.body;
    const user = await dbService.findOne({ model: userModel, filter: { email } });

    if (!user) {
        return next(new Error('User not found', StatusCodes.NOT_FOUND));
    }
    if (user.confirmEmail) {
        return next(new Error('Email already confirmed', StatusCodes.BAD_REQUEST));
    }
    if (!compare({ data: code, encrypted: user.confirmEmailOtp })) {
        return next(new Error('Invalid code', StatusCodes.BAD_REQUEST));
    }
    await dbService.updateOne({
        model: userModel,
        filter: { _id: user._id },
        data: {
            confirmEmail: true,
            $unset: {
                confirmEmailOtp: ""
            }
        }
    })
    res.status(200).json({ message: "Email confirmed" })
}

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await dbService.findOne({
        model: userModel,
        filter: { email, isDeleted: false, confirmEmail: true }
    });
    if (!user) {
        return next(new Error('User not found', StatusCodes.NOT_FOUND));
    }
    if (user.provider == providers.google) {
        return next(new Error('use google login', { cause: 400 }))
    }
    if (!compare({ data: password, encrypted: user.password })) {
        return next(new Error('Invalid password', StatusCodes.BAD_REQUEST));
    }
    let accessSignature = undefined
    let refreshSignature = undefined
    switch (user.role) {
        case roles.admin:
            accessSignature = process.env.ADMIN_ACCESS_TOKEN
            refreshSignature = process.env.ADMIN_REFRESH_TOKEN
            break;
        case roles.user:
            accessSignature = process.env.USER_ACCESS_TOKEN
            refreshSignature = process.env.USER_REFRESH_TOKEN
        default:
            break;
    }
    const accessToken = sign({ _id: user._id }, accessSignature, '15m')
    const refreshToken = sign({ _id: user._id }, refreshSignature, '7d')

    res.status(200).json({ message: "Done", accessToken, refreshToken })
}

export const refresh = async (req, res, next) => {
    const { token } = req.body; //user eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Nzk4ZDc2MGNhMTI3ZWNhNTU3OTdjYzYiLCJpYXQiOjE3MzgwNzMwMzUsImV4cCI6MTczODY3NzgzNX0.XaUGoER0qsJZXwdDNND1shIOlp7MKt0ZxIa_vZ_5VR4
    const user = await decodedToken({ authorization: token, next, tokenType: tokenTypes.refresh })
    const bearer = token.split(' ')[0]
    let accessSignature = undefined
    switch (bearer) {
        case roles.admin:
            accessSignature = process.env.ADMIN_ACCESS_TOKEN
            break;
        case roles.user:
            accessSignature = process.env.USER_ACCESS_TOKEN
            break;
        default:
            break;
    }


    const accessToken = sign({ _id: user._id }, accessSignature)
    res.status(200).json({ message: "Done", accessToken })
}

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    const user = await dbService.findOne({
        model: userModel,
        filter: {
            _id: userData._id,
            isDeleted: false,
            confirmEmail: true
        }
    })
    if (!user) {
        return next(new Error('User not found', StatusCodes.NOT_FOUND))
    }
    emailEmitter.emit('forgetPassword', { email, userName: user.userName, id: user._id })

    return res.status(200).json({ message: "check your email" })
}

export const resetPassword = async (req, res, next) => {
    const { email, code, password } = req.body
    const user = await dbService.findOne({
        model: userModel,
        filter: {
            _id: userData._id,
            isDeleted: false,
            confirmEmail: true
        }
    })
    if (!user) {
        return next(new Error('User not found', StatusCodes.NOT_FOUND))
    }
    if (!compare({ data: code, encrypted: user.resetPasswordOtp })) {
        return next(new Error('Invalid code', StatusCodes.BAD_REQUEST))
    }
    const hashedPass = hash(password)
    await dbService.updateOne({
        model: userModel,
        filter: { _id: user._id },
        data: {
            password: hashedPass,
            $unset: {
                resetPasswordOtp: ""
            }
        }
    })
    return res.status(200).json({ message: "Done" })
}

export const loginWithGoogle = async (req, res, next) => {
    const { idToken } = req.body;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload
    }
    const userData = await verify()
    //!--------------
    if (!userData.email_verified) {
        return next(new Error('Email not verified', 400));
    }
    let user = await dbService.findOne({
        model: userModel,
        filter: {
            email: userData.email
        }
    })


    if (user?.provider == providers.system) {
        return next(new Error('in-valid login method', { cause: 400 }))
    }
    if (!user) {
        user = await userModel.create({
            email: userData.email,
            userName: userData.name,
            provider: providers.google,
            confirmed: true
        })
    }
    let accessSignature = undefined
    let refreshSignature = undefined
    switch (user.role) {
        case roles.admin:
            accessSignature = process.env.ADMIN_ACCESS_TOKEN
            refreshSignature = process.env.ADMIN_REFRESH_TOKEN
            break;
        case roles.user:
            accessSignature = process.env.USER_ACCESS_TOKEN
            refreshSignature = process.env.USER_REFRESH_TOKEN
        default:
            break;
    }
    const accessToken = sign({ _id: user._id }, accessSignature, '15m')
    const refreshToken = sign({ _id: user._id }, refreshSignature, '7d')


    res.json({ message: "Done", accessToken, refreshToken })
}


