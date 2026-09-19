// =====================================================
// AMITESH PDF RENDERER
// Controller-compatible renderer
// =====================================================

const {
    money,
    numberToWords,
    getSalaryValue,
    getLogoBuffer
} = require("./pdfHelpers");

// =====================================================
// SAFE TEXT
// =====================================================

const safeText = (value, fallback = "") => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return fallback;
    }

    return String(value);
};

// =====================================================
// GET EMPLOYEE FIELD
// =====================================================

const getField = (
    employee,
    key,
    fallback = ""
) => {
    const fields =
        employee?.employeeFields || {};

    // Direct field
    if (
        fields[key] !== undefined &&
        fields[key] !== null &&
        fields[key] !== ""
    ) {
        return fields[key];
    }

    // Root employee field
    if (
        employee?.[key] !== undefined &&
        employee?.[key] !== null &&
        employee?.[key] !== ""
    ) {
        return employee[key];
    }

    // Common aliases
    const aliases = {
        employeeName: [
            "fullName",
            "name"
        ],

        fullName: [
            "employeeName",
            "name"
        ],

        employeeCode: [
            "employeeId"
        ],

        employeeNumber: [
            "employeeId",
            "employeeCode"
        ],

        designation: [
            "currentDesignation"
        ],

        pan: [
            "panNumber"
        ],

        panNumber: [
            "pan"
        ],

        pfNumber: [
            "pfPensionNumber",
            "pfNo"
        ],

        bankAccountNumber: [
            "bankAccount",
            "accountNumber"
        ],

        accountNumber: [
            "bankAccountNumber",
            "bankAccount"
        ],

        bankName: [
            "bank"
        ],

        ifsc: [
            "ifscCode"
        ],

        uanNumber: [
            "uan"
        ],

        uan: [
            "uanNumber"
        ],

        joiningDate: [
            "doj"
        ],

        doj: [
            "joiningDate"
        ],

        department: [
            "dept"
        ]
    };

    const possibleKeys =
        aliases[key] || [];

    for (
        const aliasKey of possibleKeys
    ) {
        if (
            fields[aliasKey] !== undefined &&
            fields[aliasKey] !== null &&
            fields[aliasKey] !== ""
        ) {
            return fields[aliasKey];
        }

        if (
            employee?.[aliasKey] !== undefined &&
            employee?.[aliasKey] !== null &&
            employee?.[aliasKey] !== ""
        ) {
            return employee[aliasKey];
        }
    }

    return fallback;
};

// =====================================================
// DATE FORMAT
// =====================================================

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return safeText(value);
    }

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}/${month}/${year}`;
};

// =====================================================
// SALARY ALIASES
// =====================================================

const salaryAliases = {
    houseRentAllowance: "hra",
    performanceBonus: "bonus",

    hra: "houseRentAllowance",
    bonus: "performanceBonus",

    leaveTravelAllowance: "lta"
};

// =====================================================
// GET SALARY
// =====================================================

const getSalary = (
    employee,
    componentKey,
    column = 0
) => {
    const earnings =
        employee?.earnings || {};

    const deductions =
        employee?.deductions || {};

    let value;

    if (
        earnings[componentKey] !==
        undefined
    ) {
        value =
            earnings[componentKey];
    } else if (
        deductions[componentKey] !==
        undefined
    ) {
        value =
            deductions[componentKey];
    } else {
        const alias =
            salaryAliases[componentKey];

        if (
            alias &&
            earnings[alias] !==
                undefined
        ) {
            value =
                earnings[alias];
        } else if (
            alias &&
            deductions[alias] !==
                undefined
        ) {
            value =
                deductions[alias];
        }
    }

    if (
        value === undefined ||
        value === null
    ) {
        return 0;
    }

    // Object salary component
    if (
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        const numericValue =
            getSalaryValue(
                { temp: value },
                "temp",
                column
            );

        if (
            numericValue !== undefined &&
            numericValue !== null
        ) {
            return (
                Number(numericValue) || 0
            );
        }

        const possibleKeys = [
            "amount",
            "currentMonth",
            "current",
            "value",
            "rate",
            "actual",
            "monthly"
        ];

        for (
            const key of possibleKeys
        ) {
            if (
                value[key] !==
                    undefined &&
                value[key] !== null
            ) {
                return (
                    Number(value[key]) || 0
                );
            }
        }

        return 0;
    }

    return Number(value) || 0;
};

// =====================================================
// COMPONENT AMOUNT
// =====================================================

const componentAmount = (
    employee,
    componentKey
) => {
    return getSalary(
        employee,
        componentKey,
        0
    );
};

// =====================================================
// TOTAL EARNINGS
// =====================================================

const getEarningsTotal = (
    employee,
    template
) => {
    const templateRows =
        template?.salaryComponentSchema
            ?.earnings ||
        template?.earnings ||
        [];

    let total = 0;

    if (
        Array.isArray(templateRows) &&
        templateRows.length > 0
    ) {
        templateRows.forEach(
            (item) => {
                const key =
                    item?.key ||
                    item?.componentKey;

                if (!key) {
                    return;
                }

                total += componentAmount(
                    employee,
                    key
                );
            }
        );

        return total;
    }

    const earnings =
        employee?.earnings || {};

    Object.keys(earnings).forEach(
        (key) => {
            const value =
                earnings[key];

            if (
                typeof value ===
                    "object" &&
                value !== null
            ) {
                if (
                    value.amount !==
                    undefined
                ) {
                    total +=
                        Number(
                            value.amount
                        ) || 0;
                } else if (
                    value.currentMonth !==
                    undefined
                ) {
                    total +=
                        Number(
                            value.currentMonth
                        ) || 0;
                } else if (
                    value.value !==
                    undefined
                ) {
                    total +=
                        Number(
                            value.value
                        ) || 0;
                }
            } else {
                total +=
                    Number(value) || 0;
            }
        }
    );

    return total;
};

// =====================================================
// TOTAL DEDUCTIONS
// =====================================================

const getDeductionsTotal = (
    employee,
    template
) => {
    const templateRows =
        template?.salaryComponentSchema
            ?.deductions ||
        template?.deductions ||
        [];

    let total = 0;

    if (
        Array.isArray(templateRows) &&
        templateRows.length > 0
    ) {
        templateRows.forEach(
            (item) => {
                const key =
                    item?.key ||
                    item?.componentKey;

                if (!key) {
                    return;
                }

                total += componentAmount(
                    employee,
                    key
                );
            }
        );

        return total;
    }

    const deductions =
        employee?.deductions || {};

    Object.keys(deductions).forEach(
        (key) => {
            const value =
                deductions[key];

            if (
                typeof value ===
                    "object" &&
                value !== null
            ) {
                if (
                    value.amount !==
                    undefined
                ) {
                    total +=
                        Number(
                            value.amount
                        ) || 0;
                } else if (
                    value.currentMonth !==
                    undefined
                ) {
                    total +=
                        Number(
                            value.currentMonth
                        ) || 0;
                } else if (
                    value.value !==
                    undefined
                ) {
                    total +=
                        Number(
                            value.value
                        ) || 0;
                }
            } else {
                total +=
                    Number(value) || 0;
            }
        }
    );

    return total;
};

// =====================================================
// DRAW LABEL / VALUE
// =====================================================

const drawLabelValue = (
    doc,
    label,
    value,
    x,
    y,
    labelWidth = 110,
    valueWidth = 180
) => {
    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
            safeText(label),
            x,
            y,
            {
                width: labelWidth
            }
        );

    doc
        .font("Helvetica")
        .fontSize(8)
        .text(
            safeText(value, "-"),
            x + labelWidth,
            y,
            {
                width: valueWidth
            }
        );
};

// =====================================================
// MAIN AMITESH RENDERER
// =====================================================

const renderAmiteshPdf = async (
    doc,
    {
        employee = {},
        company = {},
        template = {}
    } = {}
) => {

    // =================================================
    // PAGE
    // =================================================

    const pageWidth = 595;
    const pageHeight = 842;

    // =================================================
    // COLORS
    // =================================================

    const borderColor =
        "#222222";

    const lightGray =
        "#eeeeee";

    // =================================================
    // BASIC DATA
    // =================================================

    const employeeName =
        getField(
            employee,
            "employeeName",
            "Employee"
        );

    const employeeCode =
        getField(
            employee,
            "employeeCode",
            employee?.employeeId || ""
        );

    const designation =
        getField(
            employee,
            "designation",
            ""
        );

    const department =
        getField(
            employee,
            "department",
            ""
        );

    const pan =
        getField(
            employee,
            "panNumber",
            ""
        );

    const bankAccount =
        getField(
            employee,
            "bankAccountNumber",
            ""
        );

    const bankName =
        getField(
            employee,
            "bankName",
            ""
        );

    const ifsc =
        getField(
            employee,
            "ifsc",
            ""
        );

    const pfNumber =
        getField(
            employee,
            "pfNumber",
            ""
        );

    const joiningDate =
        getField(
            employee,
            "joiningDate",
            ""
        );

    const salaryMonth =
        getField(
            employee,
            "salaryMonth",
            ""
        );

    // =================================================
    // COMPANY
    // =================================================

    const companyName =
        safeText(
            company?.name,
            "Company Name"
        );

    const companyAddress =
        safeText(
            company?.address,
            ""
        );

    // =================================================
    // SALARY VALUES
    // =================================================

    const basicSalary =
        getSalary(
            employee,
            "basicSalary"
        );

    const hra =
        getSalary(
            employee,
            "houseRentAllowance"
        );

    const otherAllowance =
        getSalary(
            employee,
            "otherAllowance"
        );

    const lta =
        getSalary(
            employee,
            "leaveTravelAllowance"
        );

    const bonus =
        getSalary(
            employee,
            "performanceBonus"
        );

    const pf =
        getSalary(
            employee,
            "providentFund"
        );

    const professionalTax =
        getSalary(
            employee,
            "professionalTax"
        );

    const incomeTax =
        getSalary(
            employee,
            "incomeTax"
        );

    const grossSalary =
        getEarningsTotal(
            employee,
            template
        );

    const totalDeductions =
        getDeductionsTotal(
            employee,
            template
        );

    const netSalary =
        grossSalary -
        totalDeductions;

    // =================================================
    // HEADER
    // =================================================

    doc
        .rect(
            25,
            25,
            pageWidth - 50,
            pageHeight - 50
        )
        .lineWidth(1)
        .stroke(borderColor);

    // =================================================
    // COMPANY LOGO
    // =================================================
    // Logo only if template supports logo
    // and company has uploaded logo.
    // =================================================

    if (
        template?.layout?.hasLogo &&
        company?.logoUrl
    ) {
        try {
            const logoBuffer =
                await getLogoBuffer(
                    company.logoUrl
                );

            if (logoBuffer) {
                doc.image(
                    logoBuffer,
                    45,
                    42,
                    {
                        fit: [55, 45],
                        align: "center",
                        valign: "center"
                    }
                );
            }
        } catch (error) {
            console.log(
                "Amitesh PDF logo error:",
                error.message
            );
        }
    }

    // =================================================
    // HEADER TITLE
    // =================================================

    doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .text(
            "ALL INDIA INSTITUTE OF MEDICAL SCIENCES",
            45,
            48,
            {
                width: pageWidth - 90,
                align: "center"
            }
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
            companyName,
            45,
            72,
            {
                width: pageWidth - 90,
                align: "center"
            }
        );

    if (companyAddress) {
        doc
            .font("Helvetica")
            .fontSize(8)
            .text(
                companyAddress,
                60,
                90,
                {
                    width: pageWidth - 120,
                    align: "center"
                }
            );
    }

    // =================================================
    // PAYSLIP TITLE
    // =================================================

    doc
        .rect(
            45,
            115,
            pageWidth - 90,
            30
        )
        .fillAndStroke(
            lightGray,
            borderColor
        );

    doc
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
            `PAY SLIP FOR ${safeText(
                salaryMonth,
                "MONTH"
            )}`,
            50,
            124,
            {
                width: pageWidth - 100,
                align: "center"
            }
        );

    // =================================================
    // REPORT DATE
    // =================================================

    doc
        .font("Helvetica")
        .fontSize(8)
        .text(
            `Report Date: ${formatDate(
                new Date()
            )}`,
            45,
            155
        );

    // =================================================
    // EMPLOYEE DETAILS
    // =================================================

    const detailsX = 45;
    const detailsY = 180;
    const detailsW = pageWidth - 90;
    const rowH = 30;
    const colW = detailsW / 2;

    const detailRows = [
        [
            "Employee Code",
            employeeCode,
            "Employee Name",
            employeeName
        ],
        [
            "Current Designation",
            designation,
            "Department",
            department
        ],
        [
            "Dealing Office",
            companyName,
            "PAN",
            pan
        ],
        [
            "Pay Details",
            salaryMonth,
            "Old Salary Code",
            employeeCode
        ],
        [
            "Bank Account",
            bankAccount,
            "PFMS",
            pfNumber
        ],
        [
            "Bank Name",
            bankName,
            "IFSC",
            ifsc
        ]
    ];

    detailRows.forEach(
        (row, index) => {
            const y =
                detailsY +
                index * rowH;

            doc
                .rect(
                    detailsX,
                    y,
                    detailsW,
                    rowH
                )
                .lineWidth(0.6)
                .stroke(borderColor);

            // Middle vertical line
            doc
                .moveTo(
                    detailsX + colW,
                    y
                )
                .lineTo(
                    detailsX + colW,
                    y + rowH
                )
                .stroke(borderColor);

            // First label/value
            doc
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    safeText(row[0]),
                    detailsX + 6,
                    y + 7,
                    {
                        width: 105
                    }
                );

            doc
                .font("Helvetica")
                .fontSize(8)
                .text(
                    safeText(
                        row[1],
                        "-"
                    ),
                    detailsX + 112,
                    y + 7,
                    {
                        width:
                            colW - 118
                    }
                );

            // Second label/value
            doc
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    safeText(row[2]),
                    detailsX +
                        colW +
                        6,
                    y + 7,
                    {
                        width: 105
                    }
                );

            doc
                .font("Helvetica")
                .fontSize(8)
                .text(
                    safeText(
                        row[3],
                        "-"
                    ),
                    detailsX +
                        colW +
                        112,
                    y + 7,
                    {
                        width:
                            colW - 118
                    }
                );
        }
    );

    // =================================================
    // SALARY TABLE
    // =================================================

    const tableX = 45;

    const tableY =
        detailsY +
        detailRows.length *
            rowH +
        25;

    const tableW =
        pageWidth - 90;

    const col1 = 210;
    const col2 = 145;
    const col3 = 150;

    // Header
    doc
        .rect(
            tableX,
            tableY,
            tableW,
            30
        )
        .fillAndStroke(
            lightGray,
            borderColor
        );

    doc
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
            "SALARY DETAILS",
            tableX + 7,
            tableY + 10,
            {
                width: col1 - 14
            }
        );

    doc
        .text(
            "AMOUNT (Rs.)",
            tableX + col1 + 7,
            tableY + 10,
            {
                width: col2 - 14,
                align: "right"
            }
        );

    doc
        .text(
            "DEDUCTIONS / RECOVERIES",
            tableX +
                col1 +
                col2 +
                7,
            tableY + 10,
            {
                width: col3 - 14
            }
        );

    const salaryRows = [
        [
            "Basic Salary",
            basicSalary,
            "Provident Fund",
            pf
        ],
        [
            "House Rent Allowance",
            hra,
            "Professional Tax",
            professionalTax
        ],
        [
            "Other Allowance",
            otherAllowance,
            "Income Tax",
            incomeTax
        ],
        [
            "Leave Travel Allowance",
            lta,
            "",
            0
        ],
        [
            "Performance Bonus",
            bonus,
            "",
            0
        ]
    ];

    let currentY =
        tableY + 30;

    const salaryRowH = 27;

    salaryRows.forEach(
        (row) => {
            doc
                .rect(
                    tableX,
                    currentY,
                    tableW,
                    salaryRowH
                )
                .lineWidth(0.5)
                .stroke(borderColor);

            // Vertical lines
            doc
                .moveTo(
                    tableX + col1,
                    currentY
                )
                .lineTo(
                    tableX + col1,
                    currentY +
                        salaryRowH
                )
                .stroke(borderColor);

            doc
                .moveTo(
                    tableX +
                        col1 +
                        col2,
                    currentY
                )
                .lineTo(
                    tableX +
                        col1 +
                        col2,
                    currentY +
                        salaryRowH
                )
                .stroke(borderColor);

            doc
                .font("Helvetica")
                .fontSize(8)
                .text(
                    safeText(row[0]),
                    tableX + 7,
                    currentY + 8,
                    {
                        width:
                            col1 - 14
                    }
                );

            doc
                .text(
                    money(row[1]),
                    tableX +
                        col1 +
                        7,
                    currentY + 8,
                    {
                        width:
                            col2 - 14,
                        align: "right"
                    }
                );

            doc
                .text(
                    safeText(
                        row[2],
                        ""
                    ),
                    tableX +
                        col1 +
                        col2 +
                        7,
                    currentY + 8,
                    {
                        width:
                            col3 - 14
                    }
                );

            if (row[2]) {
                doc
                    .text(
                        money(row[3]),
                        tableX +
                            col1 +
                            col2 +
                            7,
                        currentY + 8,
                        {
                            width:
                                col3 - 14,
                            align: "right"
                        }
                    );
            }

            currentY +=
                salaryRowH;
        }
    );

    // =================================================
    // TOTALS
    // =================================================

    const totalY =
        currentY + 10;

    doc
        .rect(
            tableX,
            totalY,
            tableW,
            30
        )
        .lineWidth(0.8)
        .stroke(borderColor);

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
            "GROSS SALARY",
            tableX + 8,
            totalY + 10
        );

    doc
        .text(
            money(grossSalary),
            tableX + 200,
            totalY + 10,
            {
                width: 100,
                align: "right"
            }
        );

    doc
        .text(
            "TOTAL DEDUCTIONS",
            tableX + 320,
            totalY + 10
        );

    doc
        .text(
            money(totalDeductions),
            tableX + 420,
            totalY + 10,
            {
                width: 75,
                align: "right"
            }
        );

    // =================================================
    // NET PAY
    // =================================================

    const netY =
        totalY + 45;

    doc
        .rect(
            tableX,
            netY,
            tableW,
            38
        )
        .fillAndStroke(
            lightGray,
            borderColor
        );

    doc
        .fillColor("#000000")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
            "NET PAY",
            tableX + 10,
            netY + 12
        );

    doc
        .fontSize(12)
        .text(
            `Rs. ${money(
                netSalary
            )}`,
            tableX + 330,
            netY + 11,
            {
                width: 165,
                align: "right"
            }
        );

    // =================================================
    // NET PAY IN WORDS
    // =================================================

    const words =
        numberToWords(
            Math.round(netSalary)
        );

    doc
        .font("Helvetica")
        .fontSize(8)
        .text(
            `Rupees ${safeText(
                words,
                ""
            )} Only`,
            tableX,
            netY + 52,
            {
                width: tableW,
                align: "left"
            }
        );

    // =================================================
    // FOOTER
    // =================================================

    const footerText =
        template?.layout
            ?.footerText ||
        "** This is a computer generated payslip and does not require signature and stamp.";

    doc
        .font("Helvetica")
        .fontSize(7)
        .text(
            footerText,
            45,
            pageHeight - 65,
            {
                width:
                    pageWidth - 90,
                align: "center"
            }
        );

    // IMPORTANT:
    // Do NOT call doc.end()
    // Do NOT create PDFDocument here
    // Do NOT pipe response here.
};

// =====================================================
// EXPORT
// =====================================================

module.exports =
    renderAmiteshPdf;

