import joi from 'joi'
import { Types } from 'mongoose';
import { gender } from '../DB/models/user.model.js';
const isValidObjectId = (value, helpers) => {
    const isValid = Types.ObjectId.isValid(value)
    if (isValid) return true
    return helpers.message('Invalid id from validation')
}
export const generalValidation = {
    userName: joi.string().min(3).max(15),
    email: joi.string().email({
        tlds: { allow: ['com', 'net','pro'] },
        maxDomainSegments: 2,
        minDomainSegments: 1
    }),
    password: joi.string().min(8).max(15).pattern(
        new RegExp(/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/)
    ),
    confirmPassword: joi.string().valid(joi.ref('password')),
    phone: joi.string().pattern(new RegExp(/^01[1502][0-9]{8}$/)),
    code: joi.string().length(6),
    id: joi.custom(isValidObjectId),
    DOB:joi.date().max('now'),
    gender:joi.string().valid(...Object.values(gender)),
    address:joi.string(),
}


// Joi validation middleware
const validation = (schema) => {
    return (req, res, next) => {// body,query,params
        const data = { ...req.body, ...req.query, ...req.params }
        const result = schema.validate(data, { abortEarly: false })
        if (result.error) {
            const errors = result.error.details.map(error => {
                return error.message
            })
            return res.status(400).json({ validationError: errors })
        }
        return next()
    }
}
export default validation; 
