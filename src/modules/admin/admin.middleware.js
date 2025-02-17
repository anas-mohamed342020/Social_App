import { findById } from "../../DB/db.service.js"
import { roles, userModel } from "../../DB/models/user.model.js"
import { asyncHandler } from "../../utils/errorHandel/asyncHandler.js"

export const changeRoleMiddleware = () => {
    return asyncHandler(async (req, res, next) => {
        const userReq = req.user
        const { userId } = req.body
        const targetUser = await findById({
            model: userModel,
            _id: userId
        })
        if (!targetUser) {
            return next(new Error("user not found", 404))
        }
        console.log({ userReq, targetUser });

        const userReqRole = userReq.role // user
        const targetUserRole = targetUser.role // admin

        const allRoles = Object.values(roles) //array

        const userReqIndex = allRoles.indexOf(userReqRole); // 2
        const targetUserIndex = allRoles.indexOf(targetUserRole); // 1

        const canModify = userReqIndex < targetUserIndex

        if (!canModify) {
            return next(new Error("you can't change this Role", 401))
        }
        return next()



    })
}