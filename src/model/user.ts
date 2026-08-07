import mongoose, { Schema } from "mongoose";
import { isEmail, isMobilePhone } from 'validator';



const userSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 30  },
    last_name: { type: String ,maxLength: 30},
    suburb: {type: String, maxLength: 30},
    email: { type: String, required: true,validate: [ isEmail, 'invalid email' ]  },
    mobile: { type: String, required: true, validate: [isMobilePhone, "Invalid phone number"] },
    family_members: [{
        type: String
    }]
})

const User = mongoose.model('Users', userSchema)
export default  User