const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/sendEmail");

const startReminderService = () => {

    cron.schedule("* * * * *", async () => {

        try {

            const now = new Date();

            const appointments = await Appointment.find({
                status: "confirmed",
                reminderSent: false,
                predictedEndTime: {
                    $exists: true,
                    $ne: null
                }
            }).populate("userId", "name email");

            for (const appointment of appointments) {

                const difference =
                    new Date(appointment.predictedEndTime).getTime()
                    - now.getTime();

                const minutesLeft =
                    difference / (1000 * 60);

                if (
                    minutesLeft <= 20 &&
                    minutesLeft > 0
                ) {

                    if (appointment.userId?.email) {

                        await sendEmail(

                            appointment.userId.email,

                            "Smart Queue - Your Turn is Coming",

                            `Hello ${appointment.userId.name || "Patient"},

Your appointment is expected in approximately ${Math.ceil(minutesLeft)} minutes.

Token Number: #${appointment.tokenNumber}

Please reach the hospital on time.

Thank you,
Smart Queue`
                        );

                        appointment.reminderSent = true;

                        await appointment.save();

                        console.log(
                            "20-minute reminder sent to:",
                            appointment.userId.email
                        );
                    }
                }
            }

        } catch (error) {

            console.log(
                "Reminder Service Error:",
                error.message
            );

        }

    });

    console.log(
        "Appointment reminder service started ✔️"
    );
};

module.exports = startReminderService;