const mongoose = require("mongoose");

const employeeModel = require("../models/employeeModel");
const companyModel = require("../models/companyModel");
const salaryTemplateModel = require("../models/salaryTemplateModel");

// =====================================================
// HELPERS
// =====================================================

const isValidDate = (value) => {
    if (!value) return false;

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidNumber = (value) => {
    return value !== "" &&
        value !== null &&
        value !== undefined &&
        Number.isFinite(Number(value));
};

// =====================================================
// CREATE EMPLOYEE
// =====================================================

exports.createEmployee = async (req, res) => {
    try {
        const {
            companyId,
            employeeId,
            employeeFields = {},
            earnings = {},
            deductions = {}
        } = req.body;

        // -------------------------------------------------
        // BASIC VALIDATION
        // -------------------------------------------------

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company ID is required"
            });
        }

        if (!employeeId || !employeeId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid company ID"
            });
        }

        // -------------------------------------------------
        // GET COMPANY
        // -------------------------------------------------

        const company = await companyModel
            .findOne({
                _id: companyId,
                isActive: true
            })
            .populate("templateId");

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found or inactive"
            });
        }

        if (!company.templateId) {
            return res.status(400).json({
                success: false,
                message: "No template assigned to this company"
            });
        }

        const template = company.templateId;

        // -------------------------------------------------
        // CHECK DUPLICATE EMPLOYEE
        // -------------------------------------------------

        const normalizedEmployeeId = employeeId
            .trim()
            .toUpperCase();

        const existingEmployee = await employeeModel.findOne({
            companyId: company._id,
            employeeId: normalizedEmployeeId
        });

        if (existingEmployee) {
            return res.status(409).json({
                success: false,
                message: "Employee ID already exists in this company"
            });
        }

        // =================================================
        // EMPLOYEE FIELDS VALIDATION
        // =================================================

        const allowedEmployeeFields =
            template.employeeFields.map(
                (field) => field.fieldKey
            );

        const submittedEmployeeFields =
            employeeFields || {};

        // -------------------------------------------------
        // UNKNOWN EMPLOYEE FIELDS
        // -------------------------------------------------

        const unknownEmployeeFields =
            Object.keys(submittedEmployeeFields).filter(
                (key) => !allowedEmployeeFields.includes(key)
            );

        if (unknownEmployeeFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Unknown employee fields",
                fields: unknownEmployeeFields
            });
        }

        // -------------------------------------------------
        // REQUIRED EMPLOYEE FIELDS
        // -------------------------------------------------

        for (const field of template.employeeFields) {
            if (!field.required) continue;

            const value = submittedEmployeeFields[field.fieldKey];

            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field.label} is required`
                });
            }
        }

        // -------------------------------------------------
        // EMPLOYEE FIELD TYPE VALIDATION
        // -------------------------------------------------

        for (const field of template.employeeFields) {
            const value =
                submittedEmployeeFields[field.fieldKey];

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                continue;
            }

            if (field.type === "number") {
                if (!isValidNumber(value)) {
                    return res.status(400).json({
                        success: false,
                        message: `${field.label} must be a valid number`
                    });
                }
            }

            if (field.type === "email") {
                if (!isValidEmail(String(value))) {
                    return res.status(400).json({
                        success: false,
                        message: `${field.label} must be a valid email`
                    });
                }
            }

            if (field.type === "date") {
                if (!isValidDate(value)) {
                    return res.status(400).json({
                        success: false,
                        message: `${field.label} must be a valid date`
                    });
                }
            }
        }

        // =================================================
        // EARNINGS VALIDATION
        // =================================================

        const allowedEarningKeys =
            template.earnings.map(
                (earning) => earning.key
            );

        const unknownEarnings =
            Object.keys(earnings).filter(
                (key) => !allowedEarningKeys.includes(key)
            );

        if (unknownEarnings.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Unknown earning fields",
                fields: unknownEarnings
            });
        }

        const finalEarnings = {};

        for (const earning of template.earnings) {
            const key = earning.key;

            // Nothing submitted
            if (earnings[key] === undefined) {
                continue;
            }

            const submittedValue = earnings[key];

            // -------------------------------------------------
            // Template has columns
            // -------------------------------------------------

            if (
                Array.isArray(earning.columns) &&
                earning.columns.length > 0
            ) {
                if (
                    typeof submittedValue !== "object" ||
                    submittedValue === null ||
                    Array.isArray(submittedValue)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `${earning.label} must contain column values`
                    });
                }

                const finalComponent = {};

                for (const column of earning.columns) {
                    const value = submittedValue[column];

                    if (
                        value === undefined ||
                        value === null ||
                        value === ""
                    ) {
                        finalComponent[column] = 0;
                        continue;
                    }

                    if (!isValidNumber(value)) {
                        return res.status(400).json({
                            success: false,
                            message: `${earning.label} - ${column} must be a valid number`
                        });
                    }

                    const numberValue = Number(value);

                    if (numberValue < 0) {
                        return res.status(400).json({
                            success: false,
                            message: `${earning.label} - ${column} cannot be negative`
                        });
                    }

                    finalComponent[column] = numberValue;
                }

                finalEarnings[key] = finalComponent;
            }

            // -------------------------------------------------
            // Single amount earning
            // -------------------------------------------------

            else {
                if (!isValidNumber(submittedValue)) {
                    return res.status(400).json({
                        success: false,
                        message: `${earning.label} must be a valid number`
                    });
                }

                const numberValue = Number(submittedValue);

                if (numberValue < 0) {
                    return res.status(400).json({
                        success: false,
                        message: `${earning.label} cannot be negative`
                    });
                }

                finalEarnings[key] = numberValue;
            }
        }

        // =================================================
        // DEDUCTIONS VALIDATION
        // =================================================

        const allowedDeductionKeys =
            template.deductions.map(
                (deduction) => deduction.key
            );

        const unknownDeductions =
            Object.keys(deductions).filter(
                (key) => !allowedDeductionKeys.includes(key)
            );

        if (unknownDeductions.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Unknown deduction fields",
                fields: unknownDeductions
            });
        }

        const finalDeductions = {};

        for (const deduction of template.deductions) {
            const key = deduction.key;

            if (deductions[key] === undefined) {
                continue;
            }

            const submittedValue = deductions[key];

            // -------------------------------------------------
            // Multiple columns
            // -------------------------------------------------

            if (
                Array.isArray(deduction.columns) &&
                deduction.columns.length > 0
            ) {
                if (
                    typeof submittedValue !== "object" ||
                    submittedValue === null ||
                    Array.isArray(submittedValue)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `${deduction.label} must contain column values`
                    });
                }

                const finalComponent = {};

                for (const column of deduction.columns) {
                    const value = submittedValue[column];

                    if (
                        value === undefined ||
                        value === null ||
                        value === ""
                    ) {
                        finalComponent[column] = 0;
                        continue;
                    }

                    if (!isValidNumber(value)) {
                        return res.status(400).json({
                            success: false,
                            message: `${deduction.label} - ${column} must be a valid number`
                        });
                    }

                    const numberValue = Number(value);

                    if (numberValue < 0) {
                        return res.status(400).json({
                            success: false,
                            message: `${deduction.label} - ${column} cannot be negative`
                        });
                    }

                    finalComponent[column] = numberValue;
                }

                finalDeductions[key] = finalComponent;
            }

            // -------------------------------------------------
            // Single amount deduction
            // -------------------------------------------------

            else {
                if (!isValidNumber(submittedValue)) {
                    return res.status(400).json({
                        success: false,
                        message: `${deduction.label} must be a valid number`
                    });
                }

                const numberValue = Number(submittedValue);

                if (numberValue < 0) {
                    return res.status(400).json({
                        success: false,
                        message: `${deduction.label} cannot be negative`
                    });
                }

                finalDeductions[key] = numberValue;
            }
        }

        // =================================================
        // CREATE EMPLOYEE
        // =================================================

        const employee = await employeeModel.create({
            companyId: company._id,

            employeeId: normalizedEmployeeId,

            employeeFields: submittedEmployeeFields,

            earnings: finalEarnings,

            deductions: finalDeductions,

            status: "active"
        });

        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",

            company: {
                id: company._id,
                name: company.name
            },

            template: {
                id: template._id,
                name: template.templateName,
                key: template.templateKey
            },

            employee
        });

    } catch (error) {
        console.error("Create Employee Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create employee",
            error: error.message
        });
    }
};
// =====================================================
// GET ALL EMPLOYEES
// =====================================================

exports.getEmployees = async (req, res) => {
    try {
        const { companyId } = req.query;

        const filter = {};

        // -------------------------------------------------
        // OPTIONAL COMPANY FILTER
        // -------------------------------------------------

        if (companyId) {
            if (!mongoose.Types.ObjectId.isValid(companyId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid company ID"
                });
            }

            filter.companyId = companyId;
        }

        // -------------------------------------------------
        // GET EMPLOYEES
        // -------------------------------------------------

        const employees = await employeeModel
            .find(filter)
            .populate({
                path: "companyId",
                populate: {
                    path: "templateId"
                }
            })
            .sort({
                createdAt: -1
            });

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({
            success: true,
            count: employees.length,
            employees
        });

    } catch (error) {
        console.error("Get Employees Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employees",
            error: error.message
        });
    }
};
// =====================================================
// GET EMPLOYEE BY ID
// =====================================================

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        const employee = await employeeModel
            .findById(id)
            .populate({
                path: "companyId",
                populate: {
                    path: "templateId"
                }
            });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            employee
        });

    } catch (error) {
        console.error("Get Employee Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employee",
            error: error.message
        });
    }
};