import mongoose, { Schema } from "mongoose"

const participantSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'Users',required: true },
    name: {type: String, required: true},
    is_live: {type: Boolean, default:false},
    category: {
        type: String,
        required: true
    },
    thumbnail: {type: String},
    total_marks: { type: Number, default: 0 },
    marked_by: [{
        type: String
    }]
})

const Participant = mongoose.model('Participants', participantSchema)
export default Participant