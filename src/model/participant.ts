import mongoose, { Schema } from "mongoose"

const participantSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'Users',required: true },
    category: {
        type: String,
        required: true
    },
    total_marks: { type: Number, default: 0 },
    marked_by: [{
        type: String
    }]
})

const Participant = mongoose.model('Participants', participantSchema)
export default Participant