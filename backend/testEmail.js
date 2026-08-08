require("dotenv").config();

const sendEmail = require("./utils/sendEmail");

const testEmail = async () => {
  try {

    await sendEmail(
      "ayushgupta81820@gmail.com",
      "Smart Queue Test Email",
      "Email notification system is working successfully! ✅"
    );

    console.log("Test email sent successfully ✔️");

  } catch (error) {

    console.log("Email Error:", error.message);

  }
};

testEmail();