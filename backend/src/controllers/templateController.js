const salaryTemplateModel = require("../models/salaryTemplateModel");


// GET ALL TEMPLATES
const getTemplates = async (req, res) => {
    try {

        const templates = await salaryTemplateModel
            .find({ isActive: true })
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: templates.length,
            templates
        });

    } catch (error) {

        console.error("Get Templates Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// GET SINGLE TEMPLATE
const getTemplateById = async (req, res) => {
    try {

        const template = await salaryTemplateModel.findById(
            req.params.id
        );

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Template not found"
            });
        }

        return res.status(200).json({
            success: true,
            template
        });

    } catch (error) {

        console.error("Get Template Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    getTemplates,
    getTemplateById
};