const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },

        // Internal unique employee ID
        employeeId: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        // Dynamic fields according to selected template
        employeeFields: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {}
        },

        // Dynamic earning values according to template columns
        earnings: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {}
        },

        // Dynamic deduction values according to template columns
        deductions: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {}
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

// Same employee ID can exist in different companies,
// but cannot duplicate inside the same company.
employeeSchema.index(
    {
        companyId: 1,
        employeeId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);