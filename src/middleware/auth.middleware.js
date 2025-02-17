import { findOne } from "../DB/db.service.js"
import { roles, userModel } from "../DB/models/user.model.js"
import { asyncHandler } from "../utils/errorHandel/asyncHandler.js"
import { verify } from "../utils/token/verify.js"

const rolesArr = Object.values(roles)
export const tokenTypes = {
    access: 'access',
    refresh: 'refresh'
}
Object.freeze(tokenTypes)
export const decodedToken = async ({ authorization, tokenType = tokenTypes.access, next }) => {
    if (!authorization) {
        return next(new Error('please send token', { cause: 400 }))
    }

    const [bearer, token] = authorization.split(' ')
    if (!bearer || !token || !rolesArr.includes(bearer)) {
        return next(new Error('in-valid token', { cause: 400 }))
    }
    let refreshSignature = undefined
    let accessSignature = undefined
    switch (bearer) {
        case roles.admin:
            accessSignature = process.env.ADMIN_ACCESS_TOKEN
            refreshSignature = process.env.ADMIN_REFRESH_TOKEN
            break;
        case roles.user:
            accessSignature = process.env.USER_ACCESS_TOKEN
            refreshSignature = process.env.USER_REFRESH_TOKEN
            break;
        default:
            break;
    }

    const signature = (tokenType == tokenTypes.access ? accessSignature : refreshSignature)

    const userData = verify(token, signature)
    const user = await findOne({
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


    if (user.changedCredentialsTime?.getTime() >= userData.iat * 1000)
        return next(new Error('in-valid token', { cause: 400 }))
    return user
}


export const auth = () => {
    return asyncHandler(async (req, res, next) => {
        const user = await decodedToken({ authorization: req.headers.authorization, token: tokenTypes.access, next })
        req.user = user
        next()
    })
}

export const allowTo = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        const user = req.user
        if (!roles.includes(user.role)) {
            return next(new Error('You are not allowed to access this endpoint', { cause: 401 }))
        }
        return next()
    })
}