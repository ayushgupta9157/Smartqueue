const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");
const sendEmail = require("../utils/sendEmail");



const {
    getMyAppointments
} = require("../controllers/appointmentController");


router.get(
    "/my-appointments",
    authMiddleware,
    getMyAppointments
);

router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const appointments = await Appointment.find()
.populate("userId", "name email")
.populate("doctorId", "name");

            res.status(200).json({
                success: true,
                appointments
            });

        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    }
);

router.post("/", authMiddleware, async (req, res) => {
    try {

        const {
    date,
    doctorId,
    patientType,
    emergencyLevel
} = req.body;
        if(!date || !doctorId){

    return res.status(400).json({
        message:"Date and Doctor are required"
    });

}


        // Find last token of same date
       const lastAppointment = await Appointment.findOne({
    date: date,
    doctorId: doctorId
}).sort({ tokenNumber: -1 });


        let tokenNumber = 1;

        if (lastAppointment) {
            tokenNumber = lastAppointment.tokenNumber + 1;
        }

        const estimatedMinutes = tokenNumber * 10;

const predictedEndTime = new Date(
    Date.now() + estimatedMinutes * 60 * 1000
);

        const appointment = new Appointment({

    userId: req.user.id,

    doctorId,

    date,

    tokenNumber,

    status: "pending",

    patientType: patientType || "normal",

    emergencyLevel:
        patientType === "emergency"
            ? Number(emergencyLevel)
            : 0,

    emergencyVerified: false,

    predictedEndTime

});


        await appointment.save();

        const io = req.app.get("io");

if (io) {
    io.emit("queueUpdated");
}


        res.json({
            message: "Appointment Booked ✔️",
            appointment
        });


    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Patient submits feedback
router.post(
    "/feedback/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const { rating, feedback } = req.body;

            // Validate rating
            if (!rating || rating < 1 || rating > 5) {

                return res.status(400).json({
                    message: "Rating must be between 1 and 5"
                });

            }

            // Find patient's own appointment
            const appointment =
                await Appointment.findOne({
                    _id: req.params.id,
                    userId: req.user.id
                });

            if (!appointment) {

                return res.status(404).json({
                    message: "Appointment not found"
                });

            }

            // Only completed appointment can be rated
            if (appointment.status !== "completed") {

                return res.status(400).json({
                    message:
                        "You can rate only completed appointments"
                });

            }

            // Prevent duplicate feedback
            if (appointment.feedbackSubmitted) {

                return res.status(400).json({
                    message:
                        "Feedback already submitted"
                });

            }

            appointment.rating = Number(rating);

            appointment.feedback =
                feedback || "";

            appointment.feedbackSubmitted = true;

            await appointment.save();

            res.json({

                success: true,

                message:
                    "Feedback submitted successfully ⭐",

                appointment

            });

        } catch (err) {

            res.status(500).json({

                error: err.message

            });

        }

    }
);


router.put(
    "/admin/status/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const allowedStatus = [
                "pending",
                "confirmed",
                "completed",
                "cancelled"
            ];

            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Invalid appointment status"
                });
            }

           const appointment = await Appointment.findById(id)
    .populate("userId", "name email")
    .populate("doctorId", "name");


if (!appointment) {

    return res.status(404).json({
        message: "Appointment not found"
    });

}



appointment.status = status;




if(status === "completed"){

    appointment.endTime = new Date();

}



await appointment.save();
// Send confirmation email
if (status === "confirmed") {

    try {

        await sendEmail(
            appointment.userId.email,

            "Smart Queue - Appointment Confirmed",

            `Hello ${appointment.userId.name},

Your appointment has been confirmed successfully.

Doctor: ${appointment.doctorId?.name || "Doctor"}
Date: ${appointment.date}
Token Number: #${appointment.tokenNumber}

Please be available at the hospital on time.

Thank you,
Smart Queue`
        );

        console.log(
            "Confirmation email sent to:",
            appointment.userId.email
        );

    } catch (emailError) {

        console.log(
            "Email sending failed:",
            emailError.message
        );

    }

}

if (!appointment) {
    return res.status(404).json({
        message: "Appointment not found"
    });
}

const io = req.app.get("io");

if(io){

    io.to(appointment.userId._id.toString())
    .emit("appointmentUpdated", {

        appointmentId: appointment._id,
        status: appointment.status

    });


    io.emit("queueUpdated");

}
// Update predicted end time of all confirmed patients

const waitingPatients = await Appointment.find({

    doctorId: appointment.doctorId._id,
    status: "confirmed"

})
.sort({

    emergencyLevel: -1,
    tokenNumber: 1

});

const now = new Date();

for (let i = 0; i < waitingPatients.length; i++) {

    waitingPatients[i].predictedEndTime = new Date(
        now.getTime() + (i + 1) * 10 * 60 * 1000
    );

    await waitingPatients[i].save();

}
            

            res.json({
                message: "Appointment status updated ✔️",
                appointment
            });

        } catch (err) {
            res.status(500).json({
                error: err.message
            });
        }
    }
);

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found or unauthorized"
            });
        }

        res.json({
            success: true,
            appointment
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, tokenNumber } = req.body;

        const appointment = await Appointment.findOneAndUpdate(
            {
                _id: id,
                userId: req.user.id
            },
            {
                date,
                tokenNumber
            },
            {
                new: true
            }
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found or unauthorized"
            });
        }

        res.json({
            message: "Appointment Updated ✔️",
            appointment
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findOneAndDelete({
            _id: id,
            userId: req.user.id
        });

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found or unauthorized"
            });
        }

        res.json({
            message: "Appointment Deleted ✔️",
            appointment
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get(
    "/queue/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const appointmentId = req.params.id;


            const appointment = await Appointment.findOne({

                _id: appointmentId,
                userId: req.user.id

            });


            if (!appointment) {

                return res.status(404).json({

                    message: "Appointment not found"

                });

            }


            const currentServing = await Appointment.countDocuments({

    doctorId: appointment.doctorId,

    date: appointment.date,

    status: "confirmed",

    _id: {
        $ne: appointment._id
    }

});


const priorityAhead = await Appointment.countDocuments({

    doctorId: appointment.doctorId,

    date: appointment.date,

    status: "pending",

    _id: {
        $ne: appointment._id
    },

    $or: [

        {
            emergencyLevel: {
                $gt: appointment.emergencyLevel
            }
        },

        {
            emergencyLevel: appointment.emergencyLevel,

            tokenNumber: {
                $lt: appointment.tokenNumber
            }
        }

    ]

});


const peopleAhead =
    currentServing + priorityAhead;


            const completedAppointments = await Appointment.find({

                doctorId: appointment.doctorId,

                status: "completed",

                startTime: {
                    $ne: null
                },

                endTime: {
                    $ne: null
                }

            })
            .sort({
    endTime: -1
})
.limit(20);


           let avgTime = 10;

if (completedAppointments.length > 0) {

    const validAppointments = completedAppointments.filter(item => {

        const difference =
            (new Date(item.endTime) - new Date(item.startTime))
            / (1000 * 60);

        return difference > 0 && difference <= 30;

    });

    if (validAppointments.length > 0) {

        let totalTime = 0;

        validAppointments.forEach(item => {

            totalTime +=
                (new Date(item.endTime) - new Date(item.startTime))
                / (1000 * 60);

        });

        avgTime = Math.max(
    1,
    Math.round(totalTime / validAppointments.length)
);

    }

}


let estimatedWaitTime = peopleAhead * avgTime;
if (appointment.predictedEndTime) {

    const remainingMinutes = Math.max(
        0,
        Math.ceil(
            (new Date(appointment.predictedEndTime) - new Date()) /
            (1000 * 60)
        )
    );

    estimatedWaitTime = remainingMinutes;
}

// Countdown using predicted end time

if (appointment.predictedEndTime) {

    const remainingMinutes = Math.max(
        0,
        Math.ceil(
            (new Date(appointment.predictedEndTime) - new Date()) /
            (1000 * 60)
        )
    );

    estimatedWaitTime = remainingMinutes;
}
if (appointment.predictedEndTime) {

    estimatedWaitTime = Math.max(
        0,
        Math.round(
            (new Date(appointment.predictedEndTime) - new Date()) /
            (1000 * 60)
        )
    );

}
let predictionSource = "formula";

try {

    const appointmentDate = new Date(appointment.date);

    const mlResponse = await axios.post(
    `${process.env.ML_API_URL}/predict`,
        {
            hour: appointmentDate.getHours(),
            dayOfWeek: appointmentDate.getDay(),
            doctorDailyLoad: peopleAhead + 1
        }
    );

    // AI prediction
    if (!appointment.predictedEndTime) {

    estimatedWaitTime =
        Math.round(
            mlResponse.data.predictedWaitTime
        );

}

    // Countdown
    const bookedAt = new Date(appointment.createdAt);

    const minutesPassed =
        Math.floor(
            (Date.now() - bookedAt.getTime()) /
            (1000 * 60)
        );

    estimatedWaitTime = Math.max(
        0,
        estimatedWaitTime - minutesPassed
    );

    predictionSource = "machine-learning";

} catch (error) {

    console.log("ML Error:", error.message);

    // Formula countdown
    const bookedAt = new Date(appointment.createdAt);

    const minutesPassed =
        Math.floor(
            (Date.now() - bookedAt.getTime()) /
            (1000 * 60)
        );

    estimatedWaitTime = Math.max(
        0,
        (peopleAhead * avgTime) - minutesPassed
    );

}


if (
    estimatedWaitTime <= 20 &&
    !appointment.notificationSent
) {

    try {

        const patient = await appointment.populate(
            "userId",
            "name email"
        );

        await sendEmail(
            patient.userId.email,
            "Smart Queue Alert",
            `Hello ${patient.userId.name},

Your appointment is likely within the next 20 minutes.

Please reach the hospital.

Thank you,
Smart Queue`
        );

        appointment.notificationSent = true;
        await appointment.save();

    } catch (err) {

        console.log(err.message);

    }

}

            res.json({

    tokenNumber: appointment.tokenNumber,

    peopleAhead,

    averageConsultationTime: avgTime,

    estimatedWaitTime:
        estimatedWaitTime + " minutes",

    remainingMinutes: estimatedWaitTime,

    predictionSource

});


        } catch (err) {

            res.status(500).json({

                error: err.message

            });

        }

    }
);

router.get(
    "/admin/queue",
    authMiddleware,
    adminMiddleware,
    async (req,res)=>{

    try{

        const queue = await Appointment.find({
            status:"confirmed"
        })
        .sort({
            tokenNumber:1
        });


        res.json({
            success:true,
            queue
        });


    }
    catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});

router.put(
    "/admin/serve-next",
    authMiddleware,
    adminMiddleware,
    async (req,res)=>{

    try{


        const currentPatient = await Appointment.findOne({

            status:"confirmed"

        })
        .sort({

            tokenNumber:1

        });



        if(!currentPatient){

            return res.status(404).json({

                message:"No patient in queue"

            });

        }



        currentPatient.status = "completed";

currentPatient.endTime = new Date();


        await currentPatient.save();

const waitingPatients = await Appointment.find({

    doctorId: currentPatient.doctorId,

    status: "confirmed"

})
.populate("userId","name email")
.sort({
    tokenNumber:1
});

const now = new Date();

for (let i = 0; i < waitingPatients.length; i++) {

    waitingPatients[i].predictedEndTime = new Date(
        now.getTime() + (i + 1) * 10 * 60 * 1000
    );

    await waitingPatients[i].save();
    const remainingMinutes = (i + 1) * 10;

if (remainingMinutes <= 20) {

    try {

        await sendEmail(

            waitingPatients[i].userId.email,

            "Smart Queue - Your Turn is Coming",

            `Hello ${waitingPatients[i].userId.name},

Your appointment is expected in about ${remainingMinutes} minutes.

Please reach the hospital.

Thank you,
Smart Queue`

        );

    } catch(err){

        console.log(err.message);

    }

}

}


        const nextPatient = await Appointment.findOne({

    status:"confirmed"

})
.sort({

    tokenNumber:1

});

const io = req.app.get("io");

if (io) {

    io.emit("queueUpdated");

}

res.json({

    message:"Patient served successfully",

    completed: currentPatient,

    nextPatient

});



    }
    catch(err){

        res.status(500).json({

            error:err.message

        });

    }


});
module.exports = router;