const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Appointment = require("../models/Appointment");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const bcrypt = require("bcrypt");


router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      // =========================
      // BASIC STATS
      // =========================

      const totalPatients = await User.countDocuments({
        role: "patient"
      });

      const totalDoctors = await User.countDocuments({
        role: "doctor"
      });

      const totalAppointments =
        await Appointment.countDocuments();


      // =========================
      // TODAY QUEUE
      // =========================

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const todayQueue =
        await Appointment.countDocuments({
          date: today,

          status: {
            $in: [
              "pending",
              "confirmed"
            ]
          }
        });


      // =========================
      // WEEKLY PATIENT TREND
      // Last 7 days
      // =========================

      const weeklyPatients = [];

      for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(
          date.getDate() - i
        );

        const dateString =
          date
            .toISOString()
            .split("T")[0];

        const count =
          await Appointment.countDocuments({
            date: dateString
          });

        const dayName =
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short"
            }
          );

        weeklyPatients.push({
          day: dayName,
          count
        });

      }


      // =========================
      // DOCTOR-WISE LOAD
      // =========================

      const doctorAppointments =
        await Appointment.aggregate([
          {
            $group: {
              _id: "$doctorId",
              count: {
                $sum: 1
              }
            }
          }
        ]);


      const doctorLoad = [];

      for (const item of doctorAppointments) {

        if (!item._id) {
          continue;
        }

        const doctor =
          await User.findById(
            item._id
          ).select("name");

        if (doctor) {

          doctorLoad.push({
            doctor: doctor.name,
            count: item.count
          });

        }

      }


      // =========================
      // RESPONSE
      // =========================

      res.json({

        totalPatients,

        totalDoctors,

        totalAppointments,

        todayQueue,

        weeklyPatients,

        doctorLoad

      });


    } catch (err) {

      res.status(500).json({

        error: err.message

      });

    }

  }
);


router.post(
    "/add-doctor",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const { name, email, password } = req.body;

            const existingDoctor = await User.findOne({
                email
            });

            if (existingDoctor) {

                return res.status(400).json({
                    message: "Doctor already exists"
                });

            }

            const hashedPassword = await bcrypt.hash(
                password,
                10
            );

            const doctor = new User({

                name,
                email,
                password: hashedPassword,
                role: "doctor"

            });

            await doctor.save();

            res.status(201).json({

                success: true,
                message: "Doctor added successfully",
                doctor

            });

        } catch (err) {

            res.status(500).json({

                error: err.message

            });

        }

    }
);

module.exports = router;