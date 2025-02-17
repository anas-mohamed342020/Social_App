import * as dbServices from "../../DB/db.service.js";
import { commentModel } from "../../DB/models/comment.model.js";
import { postModel } from "../../DB/models/post.model.js";
import { roles } from "../../DB/models/user.model.js";
import cloudinary from '../../utils/multer/cloudinary.js'

export const createComment = async (req, res, next) => {
    const { text } = req.body;
    const postId = req.params.id
    const user = req.user;
    const post = await dbServices.findById({
        model: postModel,
        _id: postId,
    })
    if (!post) return next(new Error('post not found', { cause: 404 }))
    let image;
    if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: `posts/${user._id}/comments`
        })
        image = {
            public_id, secure_url
        }
    }
    const comment = await dbServices.create({
        model: commentModel,
        data: {
            text,
            image,
            createdBy: user._id,
            postId
        }
    })

    return res.status(201).json({ message: "Done", comment })
}


export const updateComment = async (req, res, next) => {
    const user = req.user;
    const commentId = req.params.commentId;
    const { text } = req.body;
    const comment = await dbServices.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            isDeleted: false
        }
    })
    if (!comment)
        return next(new Error('comment not found', { cause: 404 }))
    if (comment.createdBy.toString() != user._id) {
        return next(new Error('unauthorized', { cause: 401 }))
    }
    let image;
    if (req.file) {

        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: `posts/${user._id}/comments`
        })

        image = {
            public_id, secure_url
        }

        if (comment.image.public_id) {
            await cloudinary.uploader.destroy(comment.image.public_id)
        }

        comment.image = image;
    }
    if (text) {
        comment.text = text
    }
    comment.text = text || comment.text
    await comment.save()
    return res.status(200).json({ message: "Done", comment })
}

export const softDeleteComment = async (req, res, next) => {
    const user = req.user;
    const commentId = req.params.commentId;
    const comment = await dbServices.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            isDeleted: false
        }
    })
    if (!comment)
        return next(new Error('comment not found', { cause: 404 }))
    const commentOwner = user._id.toString() == comment.createdBy.toString();



    const post = await dbServices.findById({
        model: postModel,
        _id: comment.postId
    })

    const postOwner = user._id.toString() == post.userId.toString();

    const admin = user.role == roles.admin;

    if (!(commentOwner || postOwner || admin)) {
        return next(new Error('unauthorized', { cause: 401 }))
    }
    comment.isDeleted = true
    comment.deletedBy = user._id
    await comment.save();
    res.status(200).json({ message: "Done", comment })
}

export const getComment = async (req, res, next) => {
    const commentId = req.params.commentId;
    const comment = await dbServices.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            isDeleted: false
        }
    })
    if (!comment)
        return next(new Error('comment not found', { cause: 404 }))
    res.status(200).json({ message: "Done", comment })
}

export const getPostComments = async (req, res, next) => {
    const postId = req.params.postId
    const post = await dbServices.findOne({
        model: postModel,
        filter: {
            _id: postId,
            isDeleted: false
        },
        populate: [{
            path: "comments",
            match: { isDeleted: false, parentComment: { $exists: false } },
            populate: [{
                path: "replays",
                match: { isDeleted: false }
            }]
        }]
    })
    if (!post)
        return next(new Error('post not found', { cause: 404 }))


    res.status(200).json({ message: "Done", post })
}


export const getAllPosts = async (req, res, next) => {
    // const posts = await dbServices.find({
    //     model: postModel,
    //     filter: {
    //         isDeleted: false
    //     }
    // })
    // const result = []
    // for (const post of posts) {
    //     let comments = await dbServices.find({
    //         model: commentModel,
    //         filter: {
    //             postId: post._id,
    //             isDeleted: false
    //         }
    //     })
    //     result.push({
    //         post,
    //         comments
    //     })
    // }
    // const result = []
    // const cursor = postModel.find({ isDeleted: false }).cursor();

    // for (let post = await cursor.next(); post != null; post = await cursor.next()) {
    //     // console.log(post);
    //     let comments = await dbServices.find({
    //         model: commentModel,
    //         filter: {
    //             postId: post._id,
    //             isDeleted: false
    //         }
    //     })
    //     result.push({
    //         post,
    //         comments
    //     })
    // }


    const posts = await dbServices.find({
        model: postModel,
        filter: {
            isDeleted: false
        },
        populate: [
            {
                path: "comments",
                match: {
                    isDeleted: false
                },
                populate: [
                    {
                        path: 'createdBy'
                    },
                    {
                        path: "postId"
                    }
                ]
            }
        ]
    })
    res.status(200).json(posts)



}

export const like_unlike = async (req, res, next) => {
    const commentId = req.params.commentId;
    const user = req.user;
    const comment = await dbServices.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            isDeleted: false
        }
    })
    if (!comment)
        return next(new Error("comment not found", { cause: 404 }))
    const isExist = comment.likes.find(ele => {
        return ele.toString() == user._id.toString()
    })

    if (isExist) {
        comment.likes = comment.likes.filter(ele => {
            return ele.toString() != user._id.toString()
        })
    } else {
        comment.likes.push(user._id)
    }
    await comment.save()
    return res.status(200).json({ message: "Done", comment })
}


export const addReplay = async (req, res, next) => {
    const { commentId } = req.params;
    const { text } = req.body
    const comment = await commentModel.findOne({ _id: commentId, isDeleted: false }).populate([{
        path: "postId"
    }])
    if (!comment) {
        return next(new Error('comment not found', { cause: 404 }))
    }
    let image;
    if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
            folder: `posts/${comment.postId.userId}/comments`
        })
        image = { public_id, secure_url }
    }
    const replay = await commentModel.create({
        text,
        image,
        createdBy: req.user._id,
        postId: comment.postId._id,
        parentComment: comment._id
    })
    res.status(201).json({ message: "Done", replay })
}


export const hardDelete = async (req, res, next) => {
    const commentId = req.params.commentId;
    const comment = await dbServices.findOne({
        model: commentModel,
        filter: {
            _id: commentId,
            isDeleted: false
        }
    })
    if (!comment)
        return next(new Error('comment not found', { cause: 404 }))
    await comment.deleteOne()
    res.status(200).json({ message: "Done" })
}