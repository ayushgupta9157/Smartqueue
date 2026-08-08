const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Register
router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;


        const existingUser = await User.findOne({ email });


        if (existingUser) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const user = new User({

            name,
            email,
            password: hashedPassword

        });


        await user.save();


        res.status(201).json({

            message: "User Registered Successfully",
            user

        });


    } catch (err) {


        res.status(500).json({

            error: err.message

        });

    }

});




// Login
router.post("/login", async (req, res) => {

    try {


        const { email, password } = req.body;


        const user = await User.findOne({ email });



        if (!user) {

            return res.status(404).json({

                message: "User not found"

            });

        }



        const isMatch = await bcrypt.compare(

            password,

            user.password

        );



        if (!isMatch) {

            return res.status(400).json({

                message: "Invalid password"

            });

        }



        const token = jwt.sign(

            {

                id: user._id,

                role: user.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "1d"

            }

        );



        res.json({

            message: "Login Successful",

            token,

            user: {

                _id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });



    } catch(err) {


        res.status(500).json({

            error: err.message

        });


    }

});





module.exports = router;