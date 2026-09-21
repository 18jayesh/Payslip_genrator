const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const adminModel = require("../models/adminModel");

const cookieOption = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 1000,
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please input all fields"
        });
    }

    try {
        const admin = await adminModel
            .findOne({ email })
            .select("+password");

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Please input valid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Please input valid credentials"
            });
        }

        const adminData = {
            id: admin._id.toString(),
            email: admin.email,
            role: admin.role
        };

        const token = jwt.sign(
            adminData,
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1h"
            }
        );

        res.cookie("token", token, cookieOption);

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            admin: adminData
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = loginAdmin;

