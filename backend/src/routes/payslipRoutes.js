const express = require("express");

const {
    getPayslipData,
    generatePayslipPdf,
    downloadPayslipPdf,
} = require("../controllers/payslipController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


/*
|--------------------------------------------------------------------------
| GENERATE / VIEW PAYSLIP PDF
|--------------------------------------------------------------------------
*/

router.get(
    "/:employeeId/pdf",
    protect,
    generatePayslipPdf
);


/*
|--------------------------------------------------------------------------
| DOWNLOAD PAYSLIP PDF
|--------------------------------------------------------------------------
*/

router.get(
    "/:employeeId/download",
    protect,
    downloadPayslipPdf
);


/*
|--------------------------------------------------------------------------
| GET PAYSLIP DATA
|--------------------------------------------------------------------------
*/

router.get(
    "/:employeeId",
    protect,
    getPayslipData
);


module.exports = router;