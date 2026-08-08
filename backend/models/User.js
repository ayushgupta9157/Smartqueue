const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient"
        },
        currentAppointment:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Appointment",
    default:null
}
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);