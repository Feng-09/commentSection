import mongoose from "mongoose";
const { Schema, model } = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: String
})

const userModel = model("Users", userSchema)

export default userModel