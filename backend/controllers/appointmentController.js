const Appointment = require("../models/Appointment");

const getMyAppointments = async (req, res) => {
    try {

        const appointments = await Appointment.find({
            userId: req.user.id
        })
        .populate("userId", "name email")
        .populate("doctorId", "name email")
        .sort({ date: -1 });

        res.json({
            success: true,
            appointments
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

module.exports = {
    getMyAppointments
};