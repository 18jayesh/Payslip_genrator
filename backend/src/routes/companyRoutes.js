const express = require("express");

const protect =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/uploadMiddleware");

const {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany
} = require("../controllers/companyController");


const router =
    express.Router();


/* CREATE COMPANY */

router.post(
    "/create",
    protect,
    upload.single("logo"),
    createCompany
);


/* GET ALL COMPANIES */

router.get(
    "/",
    protect,
    getCompanies
);


/* GET SINGLE COMPANY */

router.get(
    "/:id",
    protect,
    getCompanyById
);


/* UPDATE COMPANY */

router.put(
    "/:id",
    protect,
    upload.single("logo"),
    updateCompany
);


module.exports = router;