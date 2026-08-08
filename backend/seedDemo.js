const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Appointment = require("./models/Appointment");

const seedDemo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected ✔️");

    // Old patients, doctors and their appointments remove
    const oldUsers = await User.find({
      role: { $in: ["patient", "doctor"] }
    }).select("_id");

    const oldUserIds = oldUsers.map((user) => user._id);

    await Appointment.deleteMany({
      $or: [
        { userId: { $in: oldUserIds } },
        { doctorId: { $in: oldUserIds } }
      ]
    });

    await User.deleteMany({
      role: { $in: ["patient", "doctor"] }
    });

    console.log("Old demo data removed ✔️");

    const doctorPassword = await bcrypt.hash(
      "doctor123",
      10
    );

    const patientPassword = await bcrypt.hash(
      "patient123",
      10
    );

    const doctors = await User.insertMany([
      {
        name: "Dr. Sharma",
        email: "sharma@smartqueue.com",
        password: doctorPassword,
        role: "doctor",
        currentAppointment: null
      },
      {
        name: "Dr. Priya",
        email: "priya@smartqueue.com",
        password: doctorPassword,
        role: "doctor",
        currentAppointment: null
      }
    ]);

    const patients = await User.insertMany([
      {
        name: "Rahul",
        email: "rahul@smartqueue.com",
        password: patientPassword,
        role: "patient"
      },
      {
        name: "Himanshu",
        email: "himanshu@smartqueue.com",
        password: patientPassword,
        role: "patient"
      },
      {
        name: "Devendra",
        email: "devendra@smartqueue.com",
        password: patientPassword,
        role: "patient"
      },
      {
        name: "Ayush",
        email: "ayush@smartqueue.com",
        password: patientPassword,
        role: "patient"
      }
    ]);

    const today = new Date()
      .toISOString()
      .split("T")[0];

    // One completed consultation: 7 minutes
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(9, 7, 0, 0);

    await Appointment.insertMany([
      {
        userId: patients[0]._id,
        doctorId: doctors[0]._id,
        date: today,
        tokenNumber: 1,
        status: "completed",
        patientType: "normal",
        emergencyLevel: 0,
        emergencyVerified: false,
        startTime,
        endTime
      },

      {
        userId: patients[1]._id,
        doctorId: doctors[0]._id,
        date: today,
        tokenNumber: 2,
        status: "confirmed",
        patientType: "emergency",
        emergencyLevel: 3,
        emergencyVerified: true
      },

      {
        userId: patients[2]._id,
        doctorId: doctors[0]._id,
        date: today,
        tokenNumber: 3,
        status: "confirmed",
        patientType: "normal",
        emergencyLevel: 0,
        emergencyVerified: false
      },

      {
        userId: patients[3]._id,
        doctorId: doctors[1]._id,
        date: today,
        tokenNumber: 1,
        status: "confirmed",
        patientType: "normal",
        emergencyLevel: 0,
        emergencyVerified: false
      }
    ]);

    console.log("Demo data created ✔️");

    console.log("\nDoctor Login:");
    console.log("sharma@smartqueue.com / doctor123");
    console.log("priya@smartqueue.com / doctor123");

    console.log("\nPatient Login:");
    console.log("rahul@smartqueue.com / patient123");
    console.log("himanshu@smartqueue.com / patient123");

    await mongoose.disconnect();

  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
};

seedDemo();