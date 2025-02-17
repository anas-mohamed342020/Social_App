import { model, Schema, Types } from 'mongoose'
import { hash } from '../../utils/hashing/hash.js'
export const gender = {
    male: 'male',
    female: 'female',
}
Object.freeze(gender)
export const roles = {
    superAdmin: 'superAdmin',//0
    admin: 'admin',          //1
    user: 'user',            //2
}
Object.freeze(roles)
export const providers = {
    system: 'system',
    google: 'google'
}
Object.freeze(providers)

const schema = new Schema({
    userName: {
        type: String,
        required: true,
        minLength: [3, 'Username must be at least 3 characters long'],
        maxLength: [15, 'Username must be at most 15 characters long'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    phone: String,
    address: String,
    DOB: Date,
    gender: {
        type: String,
        enum: Object.values(gender),
        default: gender.male
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.user,
    },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    confirmEmailOtp: {
        type: String,
    },
    resetPasswordOtp: {
        type: String,
    },
    provider: {
        type: String,
        enum: Object.values(providers),
        default: providers.system
    },
    viewers: [
        {
            userId: {
                type: Types.ObjectId,
                ref: 'User'
            },
            time: Date
        }
    ],
    tempEmail: String,
    tempEmailOtp: String,
    changedCredentialsTime: Date,
    profilePic: {
        secure_url: String,
        public_id: String
    },
    coverImages: [{
        secure_url: String,
        public_id: String
    }]
})

schema.pre('save', function (next) {
    if (this.isModified("password"))
        this.password = hash(this.password)
    next()
})


export const userModel = model('User', schema)