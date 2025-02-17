import * as dbServices from "../../DB/db.service.js";
import { postModel } from "../../DB/models/post.model.js";
import { pagination } from "../../utils/pagination/pagination.js";

export const createPost = async (req, res, next) => {
    const { title, body } = req.body;
    const user = req.user._id;
    const post = await dbServices.create({
        model: postModel,
        data: {
            title,
            body,
            userId: user
        }
    })
    res.status(201).json({ message: "Done", post })
}

export const updatePost = async (req, res, next) => {
    const user = req.user
    const { title, body } = req.body;
    const { postId } = req.params;
    const post = await dbServices.findOne({
        model: postModel,
        filter: { _id: postId, isDeleted: false },
    })
    if (!post) {
        return next(new Error('post not found ', { cause: 404 }))
    }
    if (user._id.toString() != post.userId.toString())
        return next(new Error('You are not authorized to edit this post', { cause: 401 }))
    post.title = title ? title : post.title
    post.body = body ? body : post.body
    await post.save();
    return res.status(200).json({ message: "Done", post })
}


export const deletePost = async (req, res, next) => {
    const user = req.user
    const { title, body } = req.body;
    const { postId } = req.params;
    const post = await dbServices.findOne({
        model: postModel,
        filter: { _id: postId, isDeleted: false },
    })
    if (!post) {
        return next(new Error('post not found ', { cause: 404 }))
    }
    if (user._id.toString() != post.userId.toString())
        return next(new Error('You are not authorized to edit this post', { cause: 401 }))
    await dbServices.deleteOne({
        model: postModel,
        filter: { _id: postId },
    })
    return res.status(200).json({ message: "Done", post })
}


export const softDelete = async (req, res, next) => {
    const user = req.user
    const { postId } = req.params;
    const post = await dbServices.findOne({
        model: postModel,
        filter: { _id: postId, isDeleted: false },
    })
    if (!post) {
        return next(new Error('post not found ', { cause: 404 }))
    }
    if (user._id.toString() != post.userId.toString())
        return next(new Error('You are not authorized to edit this post', { cause: 401 }))
    post.isDeleted = true
    await post.save();
    return res.status(200).json({ message: "Done", post })
}


export const getPost = async (req, res, next) => {
    const filter = {
        isDeleted: false
    }
    if (req.params.postId) {
        filter._id = req.params.postId
    }
    const { page, size } = req.query
    const { skip, limit } = pagination({ page, limit: size })

    const posts = await postModel.paginate({}, {
        page,
        limit,
        customLabels: {
            docs: "posts",
            totalDocs: "totalPosts"
        }
    })


    res.status(200).json({ ...posts })
}

export const like_unlike = async (req, res, next) => {
    const { postId } = req.params;
    const user = req.user
    const post = await dbServices.findOne({
        model: postModel,
        filter: { _id: postId, isDeleted: false },
    })
    if (!post) {
        return next(new Error('post not found ', { cause: 404 }))
    }
    const isExist = post.likes.find(ele => ele.toString() == user._id.toString())
    if (isExist) {
        const likes = post.likes.filter(ele => {
            return ele.toString() != user._id.toString()
        })
        post.likes = likes
    }
    else {
        post.likes.push(req.user._id)
    }
    await post.save()
    return res.status(200).json({ message: "Done", post })
}