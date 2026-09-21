require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./db/db");

const authRoutes = require("./routes/authRoutes");
const templateRoutes = require("./routes/templateRoutes");
const companyRoutes = require("./routes/companyRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payslipRoutes = require("./routes/payslipRoutes");

const app = express();


// ===============================
// Database
// ===============================

connectDB();


// ===============================
// CORS
// ===============================

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://payslip-genrator.onrender.com"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without origin
            // (Postman, server-to-server, etc.)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },
        credentials: true
    })
);


// ===============================
// Middleware
// ===============================

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ===============================
// Root Route
// ===============================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Payslip Generator API is running"
    });
});


// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/templates", templateRoutes);

app.use("/api/company", companyRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/payslip", payslipRoutes);


// ===============================
// Export App
// ===============================

module.exports = app;

