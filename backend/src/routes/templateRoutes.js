const express = require("express");

const {
    getTemplates,
    getTemplateById
} = require("../controllers/templateController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/", protect, getTemplates);

router.get("/:id", protect, getTemplateById);


module.exports = router;