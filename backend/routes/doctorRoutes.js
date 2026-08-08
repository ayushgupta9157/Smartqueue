const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Appointment = require("../models/Appointment");

const authMiddleware = require("../middleware/authMiddleware");
const doctorMiddleware = require("../middleware/doctorMiddleware");
const sendEmail = require("../utils/sendEmail");

// Doctor dashboard - appointments
router.get(
    "/appointments",
    authMiddleware,
    doctorMiddleware,
    async (req,res)=>{

        try{

            const today = new Date()
                .toISOString()
                .split("T")[0];

            const appointments = await Appointment.find({

                doctorId:req.user.id,
                date: today,

                status:{
                    $in:["pending","confirmed"]
                }

            })
            .populate("userId","name email")
            .sort({
                tokenNumber:1
            });


            res.json({
                success:true,
                appointments
            });


        }catch(err){

            res.status(500).json({
                error:err.message
            });

        }

    }
);

router.get(
    "/history",
    authMiddleware,
    doctorMiddleware,
    async (req, res) => {

        try {

            const history = await Appointment.find({

                doctorId: req.user.id,

                status: "completed"

            })
            .populate("userId", "name email")
            .sort({ endTime: -1 });

            res.json({
                success: true,
                history
            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }

    }
);

// Doctor calls next patient
router.put(
    "/call-next",
    authMiddleware,
    doctorMiddleware,
    async(req,res)=>{

        try{


            // check doctor current patient
            const doctor = await User.findById(req.user.id);


            if(doctor.currentAppointment){

                return res.status(400).json({

                    message:"Complete current patient first"

                });

            }



            const today = new Date()
    .toISOString()
    .split("T")[0];


const nextPatient = await Appointment.findOne({
    doctorId: req.user.id,
    date: today,
    status: "confirmed"
})
.sort({
    emergencyLevel: -1,
    tokenNumber: 1
})
.populate("userId", "name email");



            if(!nextPatient){

                return res.status(404).json({

                    message:"No patients in queue"

                });

            }




nextPatient.startTime = new Date();

await nextPatient.save();
try {

    await sendEmail(
        nextPatient.userId.email,

        "Smart Queue - Your Turn Has Arrived",

        `Hello ${nextPatient.userId.name},

Your turn has arrived.

Token Number: #${nextPatient.tokenNumber}

Please proceed for your consultation.

Thank you,
Smart Queue`
    );

    console.log(
        "Turn notification email sent to:",
        nextPatient.userId.email
    );

} catch (emailError) {

    console.log(
        "Turn email failed:",
        emailError.message
    );

}


            doctor.currentAppointment = nextPatient._id;

            await doctor.save();



            const io=req.app.get("io");


            if(io){

                io.to(nextPatient.userId.toString())
                .emit(
                    "appointmentUpdated",
                    {
                        message:"Your turn is coming",
                        appointmentId:nextPatient._id,
                        status:"confirmed"
                    }
                );

            }



            res.json({

                message:"Patient called successfully",

                patient:nextPatient

            });



        }catch(err){

            res.status(500).json({

                error:err.message

            });

        }

    }
);



// Doctor completes patient
router.put(
    "/complete/:id",
    authMiddleware,
    doctorMiddleware,
    async(req,res)=>{

        try{

            const appointment = await Appointment.findOne({

                _id:req.params.id,

                doctorId:req.user.id

            });



            if(!appointment){

                return res.status(404).json({

                    message:"Appointment not found"

                });

            }



            appointment.status = "completed";

appointment.endTime = new Date();

await appointment.save();

const waitingPatients = await Appointment.find({

    doctorId: appointment.doctorId,

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



            const doctor = await User.findById(req.user.id);

            doctor.currentAppointment=null;

            await doctor.save();



            const nextPatient = await Appointment.findOne({

    doctorId: req.user.id,

    date: appointment.date,

    status: "confirmed"

})
.sort({

    emergencyLevel: -1,

    tokenNumber: 1

});



            const io=req.app.get("io");


            if(io){

                io.to(appointment.userId.toString())
                .emit(
                    "appointmentUpdated",
                    {
                        message:"Consultation completed",
                        status:"completed"
                    }
                );



                io.emit("queueUpdated");



                if(nextPatient){

                    io.to(nextPatient.userId.toString())
                    .emit(
                        "appointmentUpdated",
                        {
                            message:"Your turn is coming next",
                            appointmentId:nextPatient._id,
                            status:"confirmed"
                        }
                    );

                }

            }



            res.json({

                message:"Patient consultation completed ✔️",

                completedAppointment:appointment,

                nextPatient

            });



        }catch(err){

            res.status(500).json({

                error:err.message

            });

        }

    }
);



// Current serving patient
router.get(
    "/current",
    authMiddleware,
    doctorMiddleware,
    async(req,res)=>{

        try{

            const doctor = await User.findById(req.user.id)
            .populate({

                path:"currentAppointment",

                populate:{

                    path:"userId",

                    select:"name email"

                }

            });



            if(!doctor.currentAppointment){

                return res.json({

                    message:"No patient currently serving"

                });

            }



            res.json({

                currentPatient:doctor.currentAppointment

            });


        }catch(err){

            res.status(500).json({

                error:err.message

            });

        }

    }
);


// Doctor Queue Status

router.get(
    "/queue-status",
    authMiddleware,
    doctorMiddleware,
    async(req,res)=>{

        try{

            const today = new Date()
    .toISOString()
    .split("T")[0];

            // current doctor
            const doctor = await User.findById(req.user.id)
            .populate({
                path:"currentAppointment",
                populate:{
                    path:"userId",
                    select:"name email"
                }
            });


            // next waiting patient
            const nextPatient = await Appointment.findOne({

    doctorId: req.user.id,
                date: today,
    status: "confirmed"

})
.sort({

    emergencyLevel: -1,

    tokenNumber: 1

})
.populate("userId", "name email");



            // count waiting patients
            const waitingPatients = await Appointment.countDocuments({

                doctorId:req.user.id,
date: today,
                status:"confirmed"

            });



            res.json({

                currentPatient:
                    doctor.currentAppointment || null,


                nextPatient:
                    nextPatient || null,


                waitingPatients

            });



        }catch(err){

            res.status(500).json({

                error:err.message

            });

        }

    }
);

// Doctor completed patients history

router.get(
    "/history",
    authMiddleware,
    doctorMiddleware,
    async(req,res)=>{

        try{

            const history = await Appointment.find({

                doctorId:req.user.id,

                status:"completed"

            })
            .populate("userId","name email")
            .sort({
                date:-1
            });


            res.json({

                success:true,

                totalCompleted:history.length,

                history

            });


        }catch(err){

            res.status(500).json({

                error:err.message

            });

        }

    }
);
// Doctor Dashboard Summary

router.get(
    "/dashboard",
    authMiddleware,
    doctorMiddleware,
    async(req,res)=>{

        try{

            const today = new Date()
    .toISOString()
    .split("T")[0];

            const doctor = await User.findById(req.user.id)
            .populate({
                path:"currentAppointment",
                populate:{
                    path:"userId",
                    select:"name email"
                }
            });


            const nextPatient = await Appointment.findOne({

                doctorId:req.user.id,
date: today,
                status:"confirmed"

            })
            .sort({
                emergencyLevel: -1,

    tokenNumber: 1
            })
            .populate("userId","name email");



            const waitingPatients = await Appointment.countDocuments({

                doctorId:req.user.id,
date: today,
                status:"confirmed"

            });



            const completedPatients = await Appointment.countDocuments({

                doctorId:req.user.id,
date: today,
                status:"completed"

            });



            res.json({

                doctorName: doctor.name,
                currentPatient:
                    doctor.currentAppointment || null,


                nextPatient:
                    nextPatient || null,


                waitingPatients,

                completedPatients

            });



        }catch(err){

            res.status(500).json({

                error:err.message

            });

        }

    }
);

// Get all doctors for patients

router.get(
    "/",
    async(req,res)=>{

        try{


            const doctors = await User.find({

                role:"doctor"

            })
            .select("name email");



            res.json({

                success:true,

                doctors

            });


        }
        catch(err){

            res.status(500).json({

                error:err.message

            });

        }

    }
);

// Doctor verifies emergency patient

router.put(
    "/verify-emergency/:id",
    authMiddleware,
    doctorMiddleware,
    async (req, res) => {

        try {

            const { emergencyLevel } = req.body;


            if (
                emergencyLevel < 1 ||
                emergencyLevel > 3
            ) {

                return res.status(400).json({

                    message: "Emergency level must be 1 to 3"

                });

            }


            const appointment =
                await Appointment.findOne({

                    _id: req.params.id,

                    doctorId: req.user.id,

                    patientType: "emergency"

                });


            if (!appointment) {

                return res.status(404).json({

                    message: "Emergency appointment not found"

                });

            }


            appointment.emergencyVerified = true;

            appointment.emergencyLevel =
                Number(emergencyLevel);


            await appointment.save();


            const io = req.app.get("io");


            if (io) {

                io.emit("queueUpdated");

            }


            res.json({

                message: "Emergency verified successfully",

                appointment

            });


        } catch (err) {

            res.status(500).json({

                error: err.message

            });

        }

    }
);
module.exports = router;