import Router from "express";
import { asyncHandler } from "../../utils/errorHandel/asyncHandler.js";
import { confirmEmail, forgetPassword, login, refresh, register, resetPassword, loginWithGoogle } from "./auth.service.js";
import validation from "../../middleware/validation.middleware.js";
import { confirmEmailValidation, forgetPasswordValidation, loginValidation, refreshTokenValidation, registerValidation, resetPasswordValidation } from "./auth.validation.js";
const router = Router()

router.get('/', asyncHandler((req, res, next) => {
    return res.status(200).json({ message: 'Hello from auth' })
}))

router.post('/register', validation(registerValidation), (register))
router.post('/confirm-email', validation(confirmEmailValidation), asyncHandler(confirmEmail))
router.post('/login', validation(loginValidation), asyncHandler(login))

router.post('/refresh-token', validation(refreshTokenValidation), asyncHandler(refresh))


router.patch('/forget-password', validation(forgetPasswordValidation), asyncHandler(forgetPassword))
router.patch('/reset-password', validation(resetPasswordValidation), asyncHandler(resetPassword))

router.post('/login-with-google', loginWithGoogle)


export default router