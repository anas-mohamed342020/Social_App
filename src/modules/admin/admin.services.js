import * as dbServices from '../../DB/db.service.js'
import { userModel } from '../../DB/models/user.model.js'
import { postModel } from '../../DB/models/post.model.js'

// all posts & all users

export const getUsersAndPosts = async (req, res, next) => {
    // const users = await dbServices.find({ model: userModel });
    // const posts = await dbServices.find({ model: postModel })

    const results = await Promise.all([userModel.find(), postModel.find()])
    // console.log({ results });

    return res.status(200).json({
        users: results[0],
        posts: results[1]
    })
}


export const changeRole = async (req, res, next) => {
    const { userId, role } = req.body
    const user = await dbServices.findByIdAndUpdate({
        model: userModel,
        _id: userId,
        data: {
            role
        },
        options: {
            new: true
        }
    })


    return res.status(200).json({ message: "Done", user })
}