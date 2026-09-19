const companyModel = require("../models/companyModel");
const salaryTemplateModel = require("../models/salaryTemplateModel");
const cloudinary = require("../config/cloudinary");


/* =========================================================
   CREATE COMPANY
========================================================= */

const createCompany = async (req, res) => {
    try {

        const {
            name,
            email,
            contactNumber,
            address,
            gstin,
            pan,
            website,
            templateId
        } = req.body;


        if (
            !name ||
            !email ||
            !contactNumber ||
            !address ||
            !templateId
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }


        const existingCompany =
            await companyModel.findOne({
                email: email.toLowerCase()
            });


        if (existingCompany) {
            return res.status(409).json({
                success: false,
                message: "Company with this email already exists"
            });
        }


        const template =
            await salaryTemplateModel.findOne({
                _id: templateId,
                isActive: true
            });


        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Selected template not found or inactive"
            });
        }


        let logoUrl = null;


        if (req.file) {

            const result =
                await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        folder: "payslip-generator/company-logos"
                    }
                );


            logoUrl = result.secure_url;

        }


        const company =
            await companyModel.create({

                name: name.trim(),

                email: email
                    .trim()
                    .toLowerCase(),

                contactNumber:
                    contactNumber.trim(),

                address:
                    address.trim(),

                gstin:
                    gstin?.trim().toUpperCase() || "",

                pan:
                    pan?.trim().toUpperCase() || "",

                website:
                    website?.trim() || "",

                logoUrl,

                templateId,

                isActive: true

            });


        const populatedCompany =
            await companyModel
                .findById(company._id)
                .populate("templateId");


        return res.status(201).json({

            success: true,

            message:
                "Company created successfully",

            company:
                populatedCompany

        });


    } catch (error) {

        console.error(
            "Create Company Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
};


/* =========================================================
   GET ALL COMPANIES
========================================================= */

const getCompanies = async (req, res) => {

    try {

        const companies =
            await companyModel
                .find()
                .populate("templateId")
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                companies.length,

            companies

        });


    } catch (error) {

        console.error(
            "Get Companies Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};


/* =========================================================
   GET SINGLE COMPANY
========================================================= */

const getCompanyById = async (req, res) => {

    try {

        const company =
            await companyModel
                .findById(req.params.id)
                .populate("templateId");


        if (!company) {

            return res.status(404).json({

                success: false,

                message:
                    "Company not found"

            });

        }


        return res.status(200).json({

            success: true,

            company

        });


    } catch (error) {

        console.error(
            "Get Company Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};


/* =========================================================
   UPDATE COMPANY
========================================================= */

const updateCompany = async (req, res) => {

    try {

        const {
            name,
            email,
            contactNumber,
            address,
            gstin,
            pan,
            website,
            templateId,
            isActive
        } = req.body;


        const company =
            await companyModel.findById(
                req.params.id
            );


        if (!company) {

            return res.status(404).json({

                success: false,

                message:
                    "Company not found"

            });

        }


        /* ================================================
           REQUIRED VALIDATION
        ================================================= */

        if (
            !name ||
            !email ||
            !contactNumber ||
            !address ||
            !templateId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill all required fields"

            });

        }


        /* ================================================
           CHECK DUPLICATE EMAIL
        ================================================= */

        const emailExists =
            await companyModel.findOne({

                email:
                    email
                        .trim()
                        .toLowerCase(),

                _id: {
                    $ne: company._id
                }

            });


        if (emailExists) {

            return res.status(409).json({

                success: false,

                message:
                    "Another company already uses this email"

            });

        }


        /* ================================================
           CHECK TEMPLATE
        ================================================= */

        const template =
            await salaryTemplateModel.findOne({

                _id: templateId,

                isActive: true

            });


        if (!template) {

            return res.status(404).json({

                success: false,

                message:
                    "Selected template not found or inactive"

            });

        }


        /* ================================================
           UPDATE LOGO
        ================================================= */

        let logoUrl =
            company.logoUrl;


        if (req.file) {

            const result =
                await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        folder:
                            "payslip-generator/company-logos"
                    }
                );


            logoUrl =
                result.secure_url;

        }


        /* ================================================
           UPDATE COMPANY
        ================================================= */

        company.name =
            name.trim();

        company.email =
            email
                .trim()
                .toLowerCase();

        company.contactNumber =
            contactNumber.trim();

        company.address =
            address.trim();

        company.gstin =
            gstin?.trim().toUpperCase() || "";

        company.pan =
            pan?.trim().toUpperCase() || "";

        company.website =
            website?.trim() || "";

        company.logoUrl =
            logoUrl;

        company.templateId =
            templateId;


        if (typeof isActive === "boolean") {

            company.isActive =
                isActive;

        }


        await company.save();


        const updatedCompany =
            await companyModel
                .findById(company._id)
                .populate("templateId");


        return res.status(200).json({

            success: true,

            message:
                "Company updated successfully",

            company:
                updatedCompany

        });


    } catch (error) {

        console.error(
            "Update Company Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};


module.exports = {

    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany

};