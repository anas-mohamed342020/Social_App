import { Router } from "express";
import * as authServices from "./user.services.js";
import { auth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/errorHandel/asyncHandler.js";
import { fileTypes, uploadFile } from "../../utils/multer/multer.js";

const router = Router();



router.get('/', auth(), asyncHandler(authServices.profileData))

router.get('/get-profile/:profileId', auth(), authServices.shareProfile)

router.patch('/update-email', auth(), authServices.updateEmail)

router.patch('/reset-email', auth(), authServices.resetEmail)


router.patch('/profile-pic',
    auth(),
    uploadFile(fileTypes.image,'uploads/user').single('image'),
    asyncHandler(authServices.profilePic)
)

router.patch('/delete-profile-pic',auth(),authServices.deleteProfilePic)

export default router