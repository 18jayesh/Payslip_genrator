const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        contactNumber: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        gstin: {
            type: String,
            trim: true,
            uppercase: true
        },

        pan: {
            type: String,
            trim: true,
            uppercase: true
        },

        website: {
            type: String,
            trim: true
        },

        logoUrl: {
            type: String,
            default: null
        },

        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryTemplate",
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

const companyModel = mongoose.model(
    "Company",
    companySchema
);

module.exports = companyModel;