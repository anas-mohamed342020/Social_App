import { Schema, Types, model } from 'mongoose'
import cloudinary from '../../utils/multer/cloudinary.js'

const schema = new Schema({
    text: {
        type: String,
        required: function () {
            const values = Object.values(this.image)
            return (values.length && values[0]) ? false : true
        }
    },
    image: {
        public_id: String,
        secure_url: String
    },
    postId: {
        type: Types.ObjectId,
        required: true,
        ref: "Post"
    },
    createdBy: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    deletedBy: {
        type: Types.ObjectId,
        ref: "User"
    },
    likes: [{
        type: Types.ObjectId,
        ref: "User"
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    parentComment: {
        type: Types.ObjectId,
        ref: 'Comment'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, toObject: { virtuals: true }
})


schema.virtual('replays', {
    foreignField: "parentComment",
    localField: "_id",
    ref: "Comment"
})


schema.post('deleteOne', { query: false, document: true }, async function (doc, next) {
    const parentComment = doc._id;
    if (doc.image?.public_id) {
        await cloudinary.uploader.destroy(doc.image.public_id)
    }
    const replays = await this.constructor.find({ parentComment })
    if (replays.length > 0) {
        for (const replay of replays) {
            await replay.deleteOne()
        }
    }
    return next()
})







export const commentModel = model('Comment', schema)
