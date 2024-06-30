import mongoose from "mongoose";
const { Schema, model } = mongoose

const commentSchema = new Schema({
    id: Number,
    postId: Number,
    content: String,
    createdTime: Number,
    score: Number,
    user: {
        image: {
          webp: String
        },
        username: String
    },
    replies: [],
    replyingTo: String,
    replyingToId: Number
})

const commentModel = model("Comments", commentSchema)

export default commentModel