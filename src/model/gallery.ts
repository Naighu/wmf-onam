import mongoose, { Schema } from "mongoose";

const gallerySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'Users' },
    photos: [
        { type: String }
    ],
    likes: {type: Number, default: 0},
    liked: [{
        type: String
    }]
})

const Gallery = mongoose.model('Gallery', gallerySchema)
export default  Gallery