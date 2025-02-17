import { Router } from "express";
import { changeRole, getUsersAndPosts } from "./admin.services.js";
import { asyncHandler } from "../../utils/errorHandel/asyncHandler.js";
import { allowTo, auth } from "../../middleware/auth.middleware.js";
import { roles } from "../../DB/models/user.model.js";
import { changeRoleMiddleware } from "./admin.middleware.js";

const router = Router()


router.get('/users-posts', auth(), allowTo(roles.admin, roles.superAdmin), asyncHandler(getUsersAndPosts))
router.patch('/change-role',
    auth(),
    allowTo(roles.admin, roles.superAdmin),
    changeRoleMiddleware(),
    asyncHandler(changeRole)
)


export default router