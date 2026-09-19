const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    createEmployee,
    getEmployees,
    getEmployeeById
} = require("../controllers/employeeController");

const router = express.Router();


// =====================================================
// CREATE EMPLOYEE
// =====================================================

router.post(
    "/create",
    protect,
    createEmployee
);
// =====================================================
// GET ALL EMPLOYEES
// =====================================================

router.get(
    "/",
    protect,
    getEmployees
);

// =====================================================
// GET EMPLOYEE BY ID
// =====================================================

router.get(
    "/:id",
    protect,
    getEmployeeById
);


module.exports = router;