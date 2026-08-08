const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const startReminderService =
    require("./services/reminderService");


dotenv.config();

const app = express();

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.set("io", io);


const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");


app.use(cors());
app.use(express.json());


app.use(
    "/api/admin",
    adminRoutes
);

app.use("/api/appointment", appointmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);


app.get("/", (req, res) => {
    res.send("Smart Queue Backend Running");
});


// Socket Connection

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);


    socket.on("joinRoom", (userId) => {

        socket.join(userId);

        console.log(
            "User joined room:",
            userId
        );

    });


    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});


// Start Server

const startServer = async () => {

    await connectDB();

    startReminderService();

    server.listen(process.env.PORT || 5000, () => {

        console.log(
            "Server running on port " +
            (process.env.PORT || 5000)
        );

    });

};


startServer();