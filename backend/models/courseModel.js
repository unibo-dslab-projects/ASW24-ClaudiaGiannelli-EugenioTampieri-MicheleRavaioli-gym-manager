// creation of the course model in the database
// use models to interact with the database
// to modify courses, I will use Course (module.exports = Course)
import { Schema, model } from 'mongoose';

// Definition of the schema for the course model
const courseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    schedule: [{
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            required: true
        },
        startTime: {
            type: String,
            required: true,
            match: /^(09|1[0-8]):00$/ // Regex per il formato "HH:00", tra 09 e 18
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: false
        }],
        availableSpots: {
            type: Number,
            required: false
        }
    }],

    capacity: {
        type: Number,
        required: true
    },
    trainer: {
        type: Schema.Types.ObjectId,
        ref: 'Trainer',
        required: true
    },
});


// Creation of the course model
export default model("Course", courseSchema)


