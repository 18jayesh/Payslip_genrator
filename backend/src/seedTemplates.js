require("dotenv").config();

const mongoose = require("mongoose");

const salaryTemplateModel = require("./models/salaryTemplateModel");

const connectDB = require("./db/db");

// =====================================================
// 5 ACTUAL PAYSLIP TEMPLATES
// =====================================================

const templates = [

    // =================================================
    // 1. HARDEEP SINGH FORMAT
    // =================================================

    {
        templateKey: "hardeep",

        templateName: "Hardeep Singh Format",

        description:
            "Landscape A4 payslip format with Standard Monthly Salary, Earnings and Deductions columns.",

        employeeFields: [

            {
                fieldKey: "employeeId",
                label: "Employee ID",
                type: "text",
                required: true
            },

            {
                fieldKey: "fullName",
                label: "Employee Name",
                type: "text",
                required: true
            },

            {
                fieldKey: "designation",
                label: "Designation",
                type: "text",
                required: true
            },

            {
                fieldKey: "joiningDate",
                label: "DOJ",
                type: "date",
                required: true
            },

            {
                fieldKey: "gender",
                label: "Gender",
                type: "text",
                required: false
            },

            {
                fieldKey: "pan",
                label: "PAN No",
                type: "text",
                required: false
            },

            {
                fieldKey: "pfPensionNumber",
                label: "PF / Pension No",
                type: "text",
                required: false
            },

            {
                fieldKey: "uan",
                label: "UAN No",
                type: "text",
                required: false
            },

            {
                fieldKey: "bankName",
                label: "Bank Name",
                type: "text",
                required: false
            },

            {
                fieldKey: "bankAccountNumber",
                label: "Bank Account No",
                type: "text",
                required: false
            },

            {
                fieldKey: "location",
                label: "Location",
                type: "text",
                required: false
            },

            {
                fieldKey: "department",
                label: "Department",
                type: "text",
                required: false
            },

            {
                fieldKey: "band",
                label: "Band",
                type: "text",
                required: false
            },

            {
                fieldKey: "daysWorked",
                label: "Days Worked in Month",
                type: "number",
                required: false
            },

            {
                fieldKey: "salaryMonth",
                label: "Salary Month",
                type: "text",
                required: true
            },

            {
                fieldKey: "payPeriodStart",
                label: "Pay Period Start",
                type: "date",
                required: false
            },

            {
                fieldKey: "payPeriodEnd",
                label: "Pay Period End",
                type: "date",
                required: false
            }
        ],

        earnings: [

            {
                key: "basicSalary",
                label: "Basic Salary",
                columns: [
                    "Standard Monthly Salary",
                    "INR Earnings"
                ]
            },

            {
                key: "hra",
                label: "HRA",
                columns: [
                    "Standard Monthly Salary",
                    "INR Earnings"
                ]
            },

            {
                key: "travelAllowance",
                label: "Travel Allowance",
                columns: [
                    "Standard Monthly Salary",
                    "INR Earnings"
                ]
            },

            {
                key: "holidayAllowance",
                label: "Holiday Allowance",
                columns: [
                    "Standard Monthly Salary",
                    "INR Earnings"
                ]
            },

            {
                key: "foodWallet",
                label: "Food Wallet",
                columns: [
                    "Standard Monthly Salary",
                    "INR Earnings"
                ]
            },

            {
                key: "incentives",
                label: "Incentives",
                columns: [
                    "INR Earnings"
                ]
            }
        ],

        deductions: [

            {
                key: "employeePfContribution",
                label: "Ee PF contribution",
                columns: [
                    "INR Deductions"
                ]
            },

            {
                key: "professionalTax",
                label: "Prof Tax - split period",
                columns: [
                    "INR Deductions"
                ]
            },

            {
                key: "incomeTax",
                label: "Income Tax",
                columns: [
                    "INR Deductions"
                ]
            },

            {
                key: "deductionFoodWallet",
                label: "Food Wallet",
                columns: [
                    "INR Deductions"
                ]
            }
        ],

        layout: {

            orientation: "landscape",

            pageSize: "A4",

            renderer: "hardeep",

            companyNamePosition: "top",

            hasLogo: true,

            hasFooter: true,

            footerText:
                "*This is a computer generated payslip and doesn't require signature or any company seal."
        },

        isActive: true
    },


    // =================================================
    // 2. SURJEET SINGH / SUSHMA FORMAT
    // =================================================

    {
        templateKey: "surjeet",

        templateName: "Surjeet Singh Format",

        description:
            "Portrait A4 Sushma Buildtech style payslip with employee details and Standard Rate / Amount salary table.",

        employeeFields: [

            {
                fieldKey: "employeeCode",
                label: "Employee Code",
                type: "text",
                required: true
            },

            {
                fieldKey: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true
            },

            {
                fieldKey: "joiningDate",
                label: "Date of Joining",
                type: "date",
                required: true
            },

            {
                fieldKey: "designation",
                label: "Designation",
                type: "text",
                required: true
            },

            {
                fieldKey: "department",
                label: "Department",
                type: "text",
                required: false
            },

            {
                fieldKey: "grade",
                label: "Grade",
                type: "text",
                required: false
            },

            {
                fieldKey: "location",
                label: "Location",
                type: "text",
                required: false
            },

            {
                fieldKey: "bankAccountNumber",
                label: "Bank Account Number",
                type: "text",
                required: false
            },

            {
                fieldKey: "ifsc",
                label: "IFSC Code",
                type: "text",
                required: false
            },

            {
                fieldKey: "bankName",
                label: "Bank Name",
                type: "text",
                required: false
            },

            {
                fieldKey: "panNumber",
                label: "PAN Number",
                type: "text",
                required: false
            },

            {
                fieldKey: "pfNumber",
                label: "PF Number",
                type: "text",
                required: false
            },

            {
                fieldKey: "uanNumber",
                label: "UAN Number",
                type: "text",
                required: false
            },

            {
                fieldKey: "esicNumber",
                label: "ESIC Number",
                type: "text",
                required: false
            },

            {
                fieldKey: "standardDays",
                label: "Standard Days",
                type: "number",
                required: false
            },

            {
                fieldKey: "lwopDays",
                label: "LWOP Days",
                type: "number",
                required: false
            },

            {
                fieldKey: "daysWorked",
                label: "Days Worked",
                type: "number",
                required: false
            },

            {
                fieldKey: "salaryMonth",
                label: "Payslip Month",
                type: "text",
                required: true
            }
        ],

        earnings: [

            {
                key: "basicSalary",
                label: "Basic Salary",
                columns: [
                    "Standard Rate",
                    "Amount"
                ]
            },

            {
                key: "houseRentAllowance",
                label: "House Rent Allowance",
                columns: [
                    "Standard Rate",
                    "Amount"
                ]
            },

            {
                key: "otherAllowance",
                label: "Other Allowance",
                columns: [
                    "Standard Rate",
                    "Amount"
                ]
            },

            {
                key: "leaveTravelAllowance",
                label: "Leave Travel Allowance",
                columns: [
                    "Standard Rate",
                    "Amount"
                ]
            },

            {
                key: "performanceBonus",
                label: "Performance Bonus",
                columns: [
                    "Amount"
                ]
            }
        ],

        deductions: [

            {
                key: "providentFund",
                label: "Provident Fund",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "professionalTax",
                label: "Professional Tax",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "incomeTax",
                label: "Income Tax",
                columns: [
                    "Amount"
                ]
            }
        ],

        layout: {

            orientation: "portrait",

            pageSize: "A4",

            renderer: "surjeet",

            companyNamePosition: "top-right",

            hasLogo: true,

            hasFooter: true,

            footerText:
                "** This is a computer generated payslip and does not require signature and stamp."
        },

        isActive: true
    },


    // =================================================
    // 3. PANKAJ / CONCENTRIX FORMAT
    // =================================================

    {
        templateKey: "pankaj",

        templateName: "Pankaj Kumar Format",

        description:
            "Portrait A4 Concentrix style payslip with Earnings Full Actual and Deductions Actual sections.",

        employeeFields: [

            {
                fieldKey: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true
            },

            {
                fieldKey: "employeeNumber",
                label: "Employee No",
                type: "text",
                required: true
            },

            {
                fieldKey: "joiningDate",
                label: "Joining Date",
                type: "date",
                required: true
            },

            {
                fieldKey: "bankName",
                label: "Bank Name",
                type: "text",
                required: false
            },

            {
                fieldKey: "designation",
                label: "Designation",
                type: "text",
                required: true
            },

            {
                fieldKey: "bankAccountNumber",
                label: "Bank Account No",
                type: "text",
                required: false
            },

            {
                fieldKey: "department",
                label: "Department",
                type: "text",
                required: false
            },

            {
                fieldKey: "panNumber",
                label: "PAN Number",
                type: "text",
                required: false
            },

            {
                fieldKey: "location",
                label: "Location",
                type: "text",
                required: false
            },

            {
                fieldKey: "pfNumber",
                label: "PF No",
                type: "text",
                required: false
            },

            {
                fieldKey: "effectiveWorkDays",
                label: "Effective Work Days",
                type: "number",
                required: false
            },

            {
                fieldKey: "pfUan",
                label: "PF UAN",
                type: "text",
                required: false
            },

            {
                fieldKey: "lop",
                label: "LOP",
                type: "number",
                required: false
            },

            {
                fieldKey: "salaryMonth",
                label: "Payslip Month",
                type: "text",
                required: true
            }
        ],

        earnings: [

            {
                key: "basic",
                label: "BASIC",
                columns: [
                    "Full",
                    "Actual"
                ]
            },

            {
                key: "hra",
                label: "HRA",
                columns: [
                    "Full",
                    "Actual"
                ]
            },

            {
                key: "lta",
                label: "LTA",
                columns: [
                    "Full",
                    "Actual"
                ]
            },

            {
                key: "specialAllowance",
                label: "SPECIAL ALLOWANCE",
                columns: [
                    "Full",
                    "Actual"
                ]
            },

            {
                key: "rmedicalAllowance",
                label: "RMEDICAL ALLOWANCE",
                columns: [
                    "Full",
                    "Actual"
                ]
            }
        ],

        deductions: [

            {
                key: "pf",
                label: "PF",
                columns: [
                    "Actual"
                ]
            },

            {
                key: "professionalTax",
                label: "PROF TAX",
                columns: [
                    "Actual"
                ]
            },

            {
                key: "incomeTax",
                label: "INCOME TAX",
                columns: [
                    "Actual"
                ]
            }
        ],

        layout: {

            orientation: "portrait",

            pageSize: "A4",

            renderer: "pankaj",

            companyNamePosition: "top",

            hasLogo: false,

            hasFooter: true,

            footerText:
                "This is a system generated payslip and does not require signature."
        },

        isActive: true
    },


    // =================================================
    // 4. AMITESH / AIIMS FORMAT
    // =================================================

    {
        templateKey: "amitesh",

        templateName: "Amitesh Kumar Yadav Format",

        description:
            "Portrait A4 AIIMS style government payslip with Salary Details and Deductions/Recoveries.",

        employeeFields: [

            {
                fieldKey: "employeeCode",
                label: "Employee Code",
                type: "text",
                required: true
            },

            {
                fieldKey: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true
            },

            {
                fieldKey: "designation",
                label: "Current Designation",
                type: "text",
                required: true
            },

            {
                fieldKey: "department",
                label: "Current Department",
                type: "text",
                required: false
            },

            {
                fieldKey: "dealingOffice",
                label: "Dealing Office",
                type: "text",
                required: false
            },

            {
                fieldKey: "panNumber",
                label: "PAN Number",
                type: "text",
                required: false
            },

            {
                fieldKey: "payDetails",
                label: "Pay Details",
                type: "text",
                required: false
            },

            {
                fieldKey: "oldSalaryCode",
                label: "Old Salary Code",
                type: "text",
                required: false
            },

            {
                fieldKey: "bankAccountNumber",
                label: "Bank Account No",
                type: "text",
                required: false
            },

            {
                fieldKey: "pfmsNumber",
                label: "PFMS-NO",
                type: "text",
                required: false
            },

            {
                fieldKey: "bankName",
                label: "Bank Name",
                type: "text",
                required: false
            },

            {
                fieldKey: "ifsc",
                label: "IFSC Code",
                type: "text",
                required: false
            },

            {
                fieldKey: "salaryMonth",
                label: "Pay Slip Month",
                type: "text",
                required: true
            },

            {
                fieldKey: "reportDate",
                label: "Report Date",
                type: "text",
                required: false
            }
        ],

        earnings: [

            {
                key: "basic",
                label: "Basic",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "dearnessAllowance",
                label: "Dearness Allowance",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "travellingAllowance",
                label: "Travelling Allowance",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "tada",
                label: "TADA",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "icuAllowance",
                label: "ICU Allowance",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "deputationPayAllowance",
                label: "Deputation Pay Allowance",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "uniformAllowance",
                label: "Uniform Allowance",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "medicalAllowance",
                label: "Medical Allowance",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "npsEmployerEarningShare",
                label: "Nps Employer Earning Share",
                columns: [
                    "Rs."
                ]
            },

            {
                key: "otherAllowance",
                label: "Other Allowance",
                columns: [
                    "Rs."
                ]
            }
        ],

        deductions: [

            {
                key: "associationFund",
                label: "Association Fund",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "empHealthScheme",
                label: "Emp Health Scheme",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "empInsuranceScheme",
                label: "Emp Insurance Scheme",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "incomeTax",
                label: "Income Tax",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "miscellaneousRecovery",
                label: "Miscellaneous Recovery",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "newPensionScheme",
                label: "New Pension Scehme-110001989995",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "npsEmployerDedShare",
                label: "Nps Employer Ded Share",
                columns: [
                    "Amount"
                ]
            },

            {
                key: "waterCharges",
                label: "Water Charges",
                columns: [
                    "Amount"
                ]
            }
        ],

        layout: {

            orientation: "portrait",

            pageSize: "A4",

            renderer: "amitesh",

            companyNamePosition: "center",

            hasLogo: false,

            hasFooter: false,

            footerText: ""
        },

        isActive: true
    },


    // =================================================
    // 5. FORMAT 1 / ARUNIMA FORMAT
    // =================================================

    {
        templateKey: "format1",

        templateName: "Format 1 - Arunima",

        description:
            "Landscape A4 Arunima style payslip with Rate, Current Month, Arrear and calendar days section.",

        employeeFields: [

            {
                fieldKey: "employeeNumber",
                label: "EMP NO",
                type: "text",
                required: true
            },

            {
                fieldKey: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true
            },

            {
                fieldKey: "gender",
                label: "Gender",
                type: "text",
                required: false
            },

            {
                fieldKey: "vertical",
                label: "Vertical",
                type: "text",
                required: false
            },

            {
                fieldKey: "designation",
                label: "Designation",
                type: "text",
                required: true
            },

            {
                fieldKey: "doj",
                label: "DEMP DOJ",
                type: "date",
                required: false
            },

            {
                fieldKey: "location",
                label: "Location",
                type: "text",
                required: false
            },

            {
                fieldKey: "bankName",
                label: "Bank Name",
                type: "text",
                required: false
            },

            {
                fieldKey: "accountNumber",
                label: "A/C No",
                type: "text",
                required: false
            },

            {
                fieldKey: "pan",
                label: "EMP PAN",
                type: "text",
                required: false
            },

            {
                fieldKey: "pfNumber",
                label: "PF_NO",
                type: "text",
                required: false
            },

            {
                fieldKey: "uan",
                label: "UAN",
                type: "text",
                required: false
            },

            {
                fieldKey: "salaryMonth",
                label: "Payslip Month",
                type: "text",
                required: true
            },

            {
                fieldKey: "calendarDays",
                label: "Calendar Days",
                type: "number",
                required: false
            },

            {
                fieldKey: "lossOfPay",
                label: "Loss Of Pay",
                type: "number",
                required: false
            },

            {
                fieldKey: "lopReversal",
                label: "LOP Reversal",
                type: "number",
                required: false
            },

            {
                fieldKey: "arrearDays",
                label: "Arrear Days",
                type: "number",
                required: false
            },

            {
                fieldKey: "daysPayable",
                label: "Days Payable",
                type: "number",
                required: false
            }
        ],

        earnings: [

            {
                key: "basic",
                label: "Basic",
                columns: [
                    "Rate",
                    "Current Month",
                    "Arrear(+/-)"
                ]
            },

            {
                key: "houseRentAllowance",
                label: "House Rent Allowance",
                columns: [
                    "Rate",
                    "Current Month",
                    "Arrear(+/-)"
                ]
            },

            {
                key: "otherAllowance",
                label: "Other Allowance",
                columns: [
                    "Rate",
                    "Current Month",
                    "Arrear(+/-)"
                ]
            },

            {
                key: "leaveTravelAllowance",
                label: "Leave Travel Allowance",
                columns: [
                    "Rate",
                    "Current Month",
                    "Arrear(+/-)"
                ]
            },

            {
                key: "performanceBonus",
                label: "Performance Bonus",
                columns: [
                    "Rate",
                    "Current Month",
                    "Arrear(+/-)"
                ]
            }
        ],

        deductions: [

            {
                key: "providentFund",
                label: "Provident Fund",
                columns: [
                    "Current Month"
                ]
            },

            {
                key: "professionalTax",
                label: "Professional Tax",
                columns: [
                    "Current Month"
                ]
            },

            {
                key: "incomeTax",
                label: "Income Tax",
                columns: [
                    "Current Month"
                ]
            }
        ],

        layout: {

            orientation: "landscape",

            pageSize: "A4",

            renderer: "format1",

            companyNamePosition: "top-left",

            hasLogo: false,

            hasFooter: true,

            footerText:
                "*This is a computer generated payslip and does not require signature."
        },

        isActive: true
    }
];


// =====================================================
// SEED FUNCTION
// =====================================================

const seedTemplates = async () => {

    try {

        await connectDB();

        // Remove old generic templates
        await salaryTemplateModel.deleteMany({});

        // Insert actual 5 formats
        await salaryTemplateModel.insertMany(templates);

        console.log(
            "=============================================="
        );

        console.log(
            "5 actual payslip templates inserted successfully"
        );

        console.log(
            "----------------------------------------------"
        );

        templates.forEach((template, index) => {

            console.log(
                `${index + 1}. ${template.templateKey} -> ${template.templateName}`
            );

        });

        console.log(
            "=============================================="
        );

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {

        console.error(
            "Template Seed Error:",
            error
        );

        process.exit(1);
    }
};


// =====================================================
// RUN SEED
// =====================================================

seedTemplates();