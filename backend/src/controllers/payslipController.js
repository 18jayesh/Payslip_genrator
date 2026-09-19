const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const Employee = require("../models/employeeModel");
const Company = require("../models/companyModel");
const SalaryTemplate = require("../models/salaryTemplateModel");

const hardeepPdf = require("../services/pdf/hardeepPdf");
const surjeetPdf = require("../services/pdf/surjeetPdf");
const pankajPdf = require("../services/pdf/pankajPdf");
const amiteshPdf = require("../services/pdf/amiteshPdf");
const format1Pdf = require("../services/pdf/format1Pdf");


/*
|--------------------------------------------------------------------------
| Template Renderer Map
|--------------------------------------------------------------------------
| templateKey database ma je value hoy ena according renderer select thase.
|--------------------------------------------------------------------------
*/

const templateRenderers = {
    hardeep: hardeepPdf,
    surjeet: surjeetPdf,
    pankaj: pankajPdf,
    amitesh: amiteshPdf,
    format1: format1Pdf,
};


/*
|--------------------------------------------------------------------------
| Helper: Find Renderer
|--------------------------------------------------------------------------
*/

const getTemplateRenderer = (templateKey) => {
    if (!templateKey) {
        return null;
    }

    const normalizedKey = String(templateKey)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[_-]/g, "");

    const rendererMap = {
        hardeep: hardeepPdf,
        surjeet: surjeetPdf,
        pankaj: pankajPdf,
        amitesh: amiteshPdf,
        format1: format1Pdf,
        format01: format1Pdf,
        format: format1Pdf,
    };

    return rendererMap[normalizedKey] || null;
};


/*
|--------------------------------------------------------------------------
| Helper: Generate Filename
|--------------------------------------------------------------------------
*/

const createFileName = (employee, company) => {
    const employeeName =
        employee?.name ||
        employee?.employeeName ||
        "Employee";

    const cleanEmployeeName = String(employeeName)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "_");

    const companyName = company?.name
        ? String(company.name)
              .trim()
              .replace(/[^a-zA-Z0-9]+/g, "_")
        : "Company";

    return `${cleanEmployeeName}_${companyName}_Payslip.pdf`;
};


/*
|--------------------------------------------------------------------------
| GET EMPLOYEE PAYSLIP DATA
|--------------------------------------------------------------------------
| GET /api/payslip/:employeeId
|--------------------------------------------------------------------------
*/

const getPayslipData = async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        const employee = await Employee.findById(employeeId)
            .populate({
                path: "companyId",
                populate: {
                    path: "templateId",
                    model: "SalaryTemplate",
                },
            })
            .lean();

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const company = employee.companyId;

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found for this employee",
            });
        }

        let template = company.templateId;

        /*
         * If populate did not return template object,
         * fetch it separately.
         */

        if (
            company.templateId &&
            typeof company.templateId === "object"
        ) {
            template = company.templateId;
        } else if (company.templateId) {
            template = await SalaryTemplate.findById(
                company.templateId
            ).lean();
        }

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Salary template not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                employee,
                company,
                template,
            },
        });

    } catch (error) {
        console.error("Get Payslip Data Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get payslip data",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| GENERATE PAYSLIP PDF
|--------------------------------------------------------------------------
| GET /api/payslip/:employeeId/pdf
|--------------------------------------------------------------------------
*/

const generatePayslipPdf = async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get Employee
        |--------------------------------------------------------------------------
        */

        const employee = await Employee.findById(employeeId)
            .populate({
                path: "companyId",
                populate: {
                    path: "templateId",
                    model: "SalaryTemplate",
                },
            })
            .lean();

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get Company
        |--------------------------------------------------------------------------
        */

        const company = employee.companyId;

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found for this employee",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get Template
        |--------------------------------------------------------------------------
        */

        let template = company.templateId;

        if (
            company.templateId &&
            typeof company.templateId === "object"
        ) {
            template = company.templateId;
        } else if (company.templateId) {
            template = await SalaryTemplate.findById(
                company.templateId
            ).lean();
        }

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Salary template not found",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Template Key
        |--------------------------------------------------------------------------
        */

        const templateKey = template.templateKey;

        if (!templateKey) {
            return res.status(400).json({
                success: false,
                message: "Template key is missing",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Find PDF Renderer
        |--------------------------------------------------------------------------
        */

        const renderer = getTemplateRenderer(templateKey);

        if (!renderer) {
            return res.status(400).json({
                success: false,
                message: `PDF renderer not found for template: ${templateKey}`,
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Response Headers
        |--------------------------------------------------------------------------
        */

        const fileName = createFileName(employee, company);

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename="${fileName}"`
        );

        /*
        |--------------------------------------------------------------------------
        | Create PDF Document
        |--------------------------------------------------------------------------
        */

        const doc = new PDFDocument({
            size: "A4",
            margin: 0,
            autoFirstPage: true,
        });

        /*
        |--------------------------------------------------------------------------
        | Pipe PDF directly to browser
        |--------------------------------------------------------------------------
        */

        doc.pipe(res);

        /*
        |--------------------------------------------------------------------------
        | Renderer Data
        |--------------------------------------------------------------------------
        |
        | Every template renderer gets the same object.
        | Renderer potani required fields use kari shake.
        |--------------------------------------------------------------------------
        */

        const payslipData = {
            employee,
            company,
            template,
        };

        /*
        |--------------------------------------------------------------------------
        | Generate Template PDF
        |--------------------------------------------------------------------------
        */

        await renderer(doc, payslipData);

        /*
        |--------------------------------------------------------------------------
        | Finish PDF
        |--------------------------------------------------------------------------
        */

        doc.end();

    } catch (error) {
        console.error("Generate Payslip PDF Error:", error);

        /*
         * Important:
         * If PDF response already started, don't try to send JSON.
         */

        if (res.headersSent) {
            try {
                res.end();
            } catch (endError) {
                console.error(
                    "PDF Response End Error:",
                    endError
                );
            }

            return;
        }

        return res.status(500).json({
            success: false,
            message: "Failed to generate payslip PDF",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| DOWNLOAD PAYSLIP PDF
|--------------------------------------------------------------------------
| GET /api/payslip/:employeeId/download
|--------------------------------------------------------------------------
*/

const downloadPayslipPdf = async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get Employee
        |--------------------------------------------------------------------------
        */

        const employee = await Employee.findById(employeeId)
            .populate({
                path: "companyId",
                populate: {
                    path: "templateId",
                    model: "SalaryTemplate",
                },
            })
            .lean();

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const company = employee.companyId;

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Get Template
        |--------------------------------------------------------------------------
        */

        let template = company.templateId;

        if (
            company.templateId &&
            typeof company.templateId === "object"
        ) {
            template = company.templateId;
        } else if (company.templateId) {
            template = await SalaryTemplate.findById(
                company.templateId
            ).lean();
        }

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Salary template not found",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Renderer
        |--------------------------------------------------------------------------
        */

        const renderer = getTemplateRenderer(
            template.templateKey
        );

        if (!renderer) {
            return res.status(400).json({
                success: false,
                message: `PDF renderer not found for template: ${template.templateKey}`,
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filename
        |--------------------------------------------------------------------------
        */

        const fileName = createFileName(
            employee,
            company
        );

        /*
        |--------------------------------------------------------------------------
        | Headers
        |--------------------------------------------------------------------------
        */

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        /*
        |--------------------------------------------------------------------------
        | PDF
        |--------------------------------------------------------------------------
        */

        const doc = new PDFDocument({
            size: "A4",
            margin: 0,
            autoFirstPage: true,
        });

        doc.pipe(res);

        await renderer(doc, {
            employee,
            company,
            template,
        });

        doc.end();

    } catch (error) {
        console.error(
            "Download Payslip PDF Error:",
            error
        );

        if (res.headersSent) {
            try {
                res.end();
            } catch (endError) {
                console.error(
                    "Download PDF Response End Error:",
                    endError
                );
            }

            return;
        }

        return res.status(500).json({
            success: false,
            message: "Failed to download payslip PDF",
            error: error.message,
        });
    }
};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
    getPayslipData,
    generatePayslipPdf,
    downloadPayslipPdf,
};