const mongoose = require("mongoose");

// =====================================================
// EMPLOYEE FIELD SCHEMA
// =====================================================

const fieldSchema = new mongoose.Schema(
    {
        fieldKey: {
            type: String,
            required: true
        },

        label: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["text", "email", "number", "date"],
            default: "text"
        },

        required: {
            type: Boolean,
            default: false
        }
    },
    {
        _id: false
    }
);

// =====================================================
// SALARY COMPONENT SCHEMA
// =====================================================

const salaryComponentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true
        },

        label: {
            type: String,
            required: true
        },

        // Used when template has multiple amount columns
        // Example:
        // Hardeep -> Standard Monthly Salary / Earnings
        // Surjeet -> Standard Rate / Amount
        // Format1 -> Rate / Current Month / Arrear
        columns: {
            type: [String],
            default: []
        }
    },
    {
        _id: false
    }
);

// =====================================================
// TEMPLATE LAYOUT SCHEMA
// =====================================================

const layoutSchema = new mongoose.Schema(
    {
        orientation: {
            type: String,
            enum: ["portrait", "landscape"],
            required: true
        },

        pageSize: {
            type: String,
            default: "A4"
        },

        renderer: {
            type: String,
            required: true
        },

        companyNamePosition: {
            type: String,
            default: "top"
        },

        hasLogo: {
            type: Boolean,
            default: true
        },

        hasFooter: {
            type: Boolean,
            default: true
        },

        footerText: {
            type: String,
            default: ""
        }
    },
    {
        _id: false
    }
);

// =====================================================
// SALARY TEMPLATE SCHEMA
// =====================================================

const salaryTemplateSchema = new mongoose.Schema(
    {
        templateKey: {
            type: String,
            required: true,
            unique: true
        },

        templateName: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        // Dynamic employee fields
        employeeFields: {
            type: [fieldSchema],
            default: []
        },

        // Earnings
        earnings: {
            type: [salaryComponentSchema],
            default: []
        },

        // Deductions
        deductions: {
            type: [salaryComponentSchema],
            default: []
        },

        // Template-specific layout information
        layout: {
            type: layoutSchema,
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const salaryTemplateModel = mongoose.model(
    "SalaryTemplate",
    salaryTemplateSchema
);

module.exports = salaryTemplateModel;