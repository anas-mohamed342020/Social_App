import { findById, findByIdAndUpdate, findOne, updateOne } from "../../DB/db.service.js";
import { userModel } from "../../DB/models/user.model.js";
import { compare } from "../../utils/hashing/compare.js";
import { emailEmitter } from "../../utils/sendEmail/Emailevents.js";
import path from 'path'
import fs from 'fs'
import cloudinary from "../../utils/multer/cloudinary.js";

export const shareProfile = async (req, res, next) => {
    const { profileId } = req.params;
    const user = req.user
    if (profileId == user._id.toString()) {
        return res.status(200).json({ user });
    }
    const profile = await findByIdAndUpdate({
        model: userModel,
        _id: profileId,
        data: {
            $push: {
                viewers: {
                    userId: user._id,
                    time: Date.now()
                }
            }
        },
        select: 'userName email -_id'
    });
    return user
        ? res.status(200).json({ message: "Done", profile })
        : next(new Error('user not found', { cause: 404 }))
}


export const profileData = async (req, res, next) => {
    const { name } = req.body
    console.log({ name });

    const user = await findById({
        model: userModel,
        _id: req.user._id,
        populate: [
            {
                path: 'viewers.userId',
                select: 'userName email'
            }
        ]
    })
    res.json({ user })
}


export const updateEmail = async (req, res, next) => {
    const { email } = req.body;
    const isEmailExist = await findOne({
        model: userModel,
        filter: {
            email
        }
    })
    if (isEmailExist) {
        return next(new Error('email already exists', { cause: 400 }))
    }
    await updateOne({
        model: userModel,
        filter: {
            _id: req.user._id
        },
        data: {
            tempEmail: email
        }
    })
    //{ email, userName, id }
    emailEmitter.emit('updateEmail', {
        email,
        userName: req.user.userName,
        id: req.user._id
    })
    emailEmitter.emit('confirmEmail', {
        email: req.user.email,
        userName: req.user.userName,
        id: req.user._id
    })

    return res.status(200).json({ message: "Done" })
}

export const resetEmail = async (req, res, next) => {
    const { oldOtp, newOtp } = req.body;
    console.log(
        {
            oldOtp,
            newOtp,
            tempEmailOtp: req.user.tempEmailOtp,
            confirmEmailOtp: req.user.confirmEmailOtp,
            old: compare({ data: oldOtp, encrypted: req.user.tempEmailOtp }),
            new: compare({ data: newOtp, encrypted: req.user.confirmEmailOtp })
        }
    );

    if (
        !compare({ data: newOtp, encrypted: req.user.tempEmailOtp }) ||
        !compare({ data: oldOtp, encrypted: req.user.confirmEmailOtp })
    ) {
        return next(new Error('in-valid OTP', { cause: 400 }))
    }
    await updateOne({
        model: userModel,
        filter: {
            email: req.user.email
        },
        data: {
            email: req.user.tempEmail,
            $unset: {
                tempEmail: "",
                tempEmailOtp: "",
                confirmEmailOtp: ""
            },
            changedCredentialsTime: Date.now()
        }
    })
    return res.status(200).json({ message: "Done" })
}


export const profilePic = async (req, res, next) => {
    const file = req.file
    const user = req.user
    console.log(file.path);
    
    const {secure_url,public_id} = await cloudinary.uploader.upload(file.path,{
        folder:`users/${user._id}`
    })
    user.profilePic = {
        secure_url,public_id
    }
    await user.save()
    res.json({ message: "Done",user })
}

export const deleteProfilePic = async (req,res,next)=>{
    const user =req.user;
    await cloudinary.uploader.destroy(user.profilePic.public_id)

    await userModel.updateOne({_id:user._id},{
        $unset:{
            profilePic:""
        }
    })
    res.json({user})
}