// bootstrap

import morgan from "morgan"
import DBConnection from "./DB/DBConnection.js"
import adminRouter from "./modules/admin/admin.controller.js"
import authRoute from "./modules/auth/auth.controller.js"
import commentRouter from "./modules/comment/comment.controller.js"
import postRouter from "./modules/post/post.controller.js"
import userRouter from "./modules/user/user.controller.js"
import { asyncHandler } from "./utils/errorHandel/asyncHandler.js"
import { globalErrorHandler } from "./utils/errorHandel/globalMhandelMiddleware.js"
import cors from 'cors'


export const bootstrap = async (app, express) => {
    app.use(express.json())//! parsing
    app.use(cors(
        {
            origin: function (origin, callBack) {
                const blackList = ['http://localhost:5500', "http://localhost:4200"]
                if (blackList.includes(origin)) {
                    return callBack(new Error('in-valid origin'))
                }
                return callBack(null, true)
            }
        }
    ))
    // app.use((req, res, next) => {
    //     const whiteList = ['http://localhost:5500', "http://localhost:4200"]
    //     const origin = req.headers.origin
    //     if (!whiteList.includes(origin)) {
    //         return next('in-valid origin', { cause: 501 })
    //     }
    //     res.setHeaders('Access-Control-Allow-Origin', origin)
    //     res.setHeaders('Access-Control-Allow-Methods', '*')
    //     res.setHeaders('Access-Control-Allow-Headers', '*');
    //     res.setHeaders('Access-Control-Private-Network',true)
    //     return next()
    // })


    app.use(morgan('dev'))
    DBConnection()
    //service file
    const sayHello = (req, res, next) => {
        res.json({ message: "Hello from social media app" })
    }
    // controller file
    app.get('/', asyncHandler(sayHello))
    // localhost:3000/post
    app.use('/auth', authRoute)
    app.use('/user', userRouter)
    app.use('/post', postRouter)
    app.use('/comment', commentRouter)
    app.use('/admin', adminRouter)
    app.use('/uploads', express.static('uploads'))



    app.all('*', (req, res, next) => {
        res.status(404).json({ message: "Route not found" })
    });
    app.use(globalErrorHandler)
}