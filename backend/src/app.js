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


connectDB();


app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);


app.use(cookieParser());

app.use(express.json());


app.use("/api/auth", authRoutes);

app.use("/api/templates", templateRoutes);

app.use("/api/company", companyRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payslip", payslipRoutes);

module.exports = app;