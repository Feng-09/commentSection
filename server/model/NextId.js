import mongoose from "mongoose";
const { Schema, model } = mongoose

const idSchema = new Schema({
    nextId: Number,
})

const idModel = model("Idtracker", idSchema)

export default idModel