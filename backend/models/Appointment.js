const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    doctorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    date:{
        type:String,
        required:true
    },

    tokenNumber:{
        type:Number,
        required:true
    },

    status:{
        type:String,
        default:"pending"
    },

    patientType:{
        type:String,
        enum:["normal","emergency"],
        default:"normal"
    },

    emergencyLevel:{
        type:Number,
        min:0,
        max:3,
        default:0
    },

    emergencyVerified:{
        type:Boolean,
        default:false
    },

    startTime:{
        type:Date
    },

    endTime:{
        type:Date
    },

    predictedEndTime:{
        type:Date
    },

    rating:{
        type:Number,
        min:1,
        max:5
    },

    feedback:{
        type:String,
        trim:true
    },

    feedbackSubmitted:{
        type:Boolean,
        default:false
    },
    notificationSent: {
    type: Boolean,
    default: false
},
reminderSent: {
    type: Boolean,
    default: false
}

},
{
    timestamps:true
});

module.exports = mongoose.model(
    "Appointment",
    appointmentSchema
);