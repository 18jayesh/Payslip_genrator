const {
    money,
    numberToWords,
    getSalaryValue,
    getLogoBuffer
} = require("./pdfHelpers");

/*
|--------------------------------------------------------------------------
| Local Helpers
|--------------------------------------------------------------------------
*/

const text = (value, fallback = "") => {
    if (value === undefined || value === null) {
        return fallback;
    }

    return String(value);
};

const getFieldValue = (employee, ...keys) => {
    const employeeFields = employee?.employeeFields || {};

    for (const key of keys) {
        if (
            employeeFields[key] !== undefined &&
            employeeFields[key] !== null &&
            employeeFields[key] !== ""
        ) {
            return employeeFields[key];
        }

        if (
            employee?.[key] !== undefined &&
            employee?.[key] !== null &&
            employee?.[key] !== ""
        ) {
            return employee[key];
        }
    }

    return "";
};

const getSalary = (employee, section, ...keys) => {
    const salaryObject = employee?.[section] || {};

    for (const key of keys) {
        if (
            salaryObject[key] !== undefined &&
            salaryObject[key] !== null &&
            salaryObject[key] !== ""
        ) {
            const value = Number(salaryObject[key]);

            if (!Number.isNaN(value)) {
                return value;
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Try existing helper as fallback
    |--------------------------------------------------------------------------
    */

    for (const key of keys) {
        try {
            const value = getSalaryValue(
                employee,
                section,
                key
            );

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                const numberValue = Number(value);

                if (!Number.isNaN(numberValue)) {
                    return numberValue;
                }
            }
        } catch (error) {
            // Ignore helper errors and continue with 0
        }
    }

    return 0;
};

const formatMoney = (value) => {
    try {
        return money(Number(value) || 0);
    } catch (error) {
        return `₹ ${(Number(value) || 0).toFixed(2)}`;
    }
};

const convertNumberToWords = (value) => {
    try {
        if (typeof numberToWords === "function") {
            return numberToWords(Number(value) || 0);
        }
    } catch (error) {
        // fallback below
    }

    return "";
};


/*
|--------------------------------------------------------------------------
| Pankaj Payslip Renderer
|--------------------------------------------------------------------------
|
| IMPORTANT:
| - PDFDocument is NOT created here.
| - doc.pipe() is NOT used here.
| - doc.end() is NOT used here.
| - Controller owns the PDF document.
|
*/

const renderPankajPdf = async (
    doc,
    {
        employee = {},
        company = {},
        template = {}
    } = {}
) => {

    /*
    |--------------------------------------------------------------------------
    | Page
    |--------------------------------------------------------------------------
    */

    const pageWidth = 842;
    const pageHeight = 595;

    /*
    |--------------------------------------------------------------------------
    | Employee Information
    |--------------------------------------------------------------------------
    */

    const employeeName = text(
        getFieldValue(
            employee,
            "fullName",
            "employeeName",
            "name"
        ),
        "Employee"
    );

    const employeeCode = text(
        getFieldValue(
            employee,
            "employeeId",
            "employeeCode",
            "code"
        )
    );

    const designation = text(
        getFieldValue(
            employee,
            "designation"
        )
    );

    const department = text(
        getFieldValue(
            employee,
            "department"
        )
    );

    const joiningDate = text(
        getFieldValue(
            employee,
            "joiningDate",
            "dateOfJoining"
        )
    );

    const location = text(
        getFieldValue(
            employee,
            "location"
        )
    );

    const grade = text(
        getFieldValue(
            employee,
            "grade"
        )
    );

    const bankAccount = text(
        getFieldValue(
            employee,
            "bankAccount",
            "bankAccountNumber"
        )
    );

    const bankName = text(
        getFieldValue(
            employee,
            "bankName"
        )
    );

    const ifsc = text(
        getFieldValue(
            employee,
            "ifsc"
        )
    );

    const pan = text(
        getFieldValue(
            employee,
            "pan",
            "panNumber"
        )
    );

    const pfNumber = text(
        getFieldValue(
            employee,
            "pfNumber",
            "providentFundNumber"
        )
    );

    const uan = text(
        getFieldValue(
            employee,
            "uan",
            "uanNumber"
        )
    );

    const esic = text(
        getFieldValue(
            employee,
            "esic",
            "esicNumber"
        )
    );

    const salaryMonth = text(
        getFieldValue(
            employee,
            "salaryMonth",
            "month"
        ),
        "Salary Slip"
    );

    const standardDays = text(
        getFieldValue(
            employee,
            "standardDays"
        ),
        "30"
    );

    const lwopDays = text(
        getFieldValue(
            employee,
            "lwopDays"
        ),
        "0"
    );

    const daysWorked = text(
        getFieldValue(
            employee,
            "daysWorked"
        ),
        standardDays
    );


    /*
    |--------------------------------------------------------------------------
    | Company Information
    |--------------------------------------------------------------------------
    */

    const companyName = text(
        company?.name,
        "Company Name"
    );

    const companyAddress = text(
        company?.address
    );

    const companyEmail = text(
        company?.email
    );

    const companyContact = text(
        company?.contactNumber
    );

    const companyGstin = text(
        company?.gstin
    );

    const companyPan = text(
        company?.pan
    );


    /*
    |--------------------------------------------------------------------------
    | Earnings
    |--------------------------------------------------------------------------
    */

    const basicSalary = getSalary(
        employee,
        "earnings",
        "basicSalary",
        "basic"
    );

    const hra = getSalary(
        employee,
        "earnings",
        "houseRentAllowance",
        "hra"
    );

    const otherAllowance = getSalary(
        employee,
        "earnings",
        "otherAllowance",
        "other"
    );

    const leaveTravelAllowance = getSalary(
        employee,
        "earnings",
        "leaveTravelAllowance",
        "lta"
    );

    const performanceBonus = getSalary(
        employee,
        "earnings",
        "performanceBonus",
        "bonus"
    );


    /*
    |--------------------------------------------------------------------------
    | Deductions
    |--------------------------------------------------------------------------
    */

    const providentFund = getSalary(
        employee,
        "deductions",
        "providentFund",
        "pf"
    );

    const professionalTax = getSalary(
        employee,
        "deductions",
        "professionalTax",
        "pt"
    );

    const incomeTax = getSalary(
        employee,
        "deductions",
        "incomeTax",
        "tds"
    );


    /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

    const totalEarnings =
        basicSalary +
        hra +
        otherAllowance +
        leaveTravelAllowance +
        performanceBonus;

    const totalDeductions =
        providentFund +
        professionalTax +
        incomeTax;

    const netPay =
        totalEarnings -
        totalDeductions;


    /*
    |--------------------------------------------------------------------------
    | PAGE BACKGROUND / BORDER
    |--------------------------------------------------------------------------
    */

    doc.rect(
        20,
        20,
        pageWidth - 40,
        pageHeight - 40
    )
        .lineWidth(1)
        .stroke();


    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */
    if (template?.layout?.hasLogo && company?.logoUrl) {
        try {
            const logoBuffer = await getLogoBuffer(company.logoUrl);

            if (logoBuffer) {
                doc.image(
                    logoBuffer,
                    35,
                    32,
                    {
                        fit: [55, 45],
                        align: "center",
                        valign: "center"
                    }
                );
            }
        } catch (error) {
            console.log(
                "Pankaj PDF logo error:",
                error.message
            );
        }
    }

    doc.font("Helvetica-Bold")
        .fontSize(17)
        .text(
            companyName,
            35,
            32,
            {
                width: 500,
                align: "left"
            }
        );

    doc.font("Helvetica")
        .fontSize(8)
        .text(
            companyAddress,
            35,
            54,
            {
                width: 450
            }
        );

    doc.fontSize(8)
        .text(
            companyEmail,
            35,
            68,
            {
                width: 450
            }
        );

    doc.fontSize(8)
        .text(
            companyContact,
            35,
            80,
            {
                width: 450
            }
        );


    /*
    |--------------------------------------------------------------------------
    | Payslip Title
    |--------------------------------------------------------------------------
    */

    doc.font("Helvetica-Bold")
        .fontSize(16)
        .text(
            "SALARY SLIP",
            560,
            40,
            {
                width: 230,
                align: "right"
            }
        );

    doc.font("Helvetica")
        .fontSize(9)
        .text(
            salaryMonth,
            560,
            62,
            {
                width: 230,
                align: "right"
            }
        );


    /*
    |--------------------------------------------------------------------------
    | Header Separator
    |--------------------------------------------------------------------------
    */

    doc.moveTo(30, 100)
        .lineTo(pageWidth - 30, 100)
        .lineWidth(1)
        .stroke();


    /*
    |--------------------------------------------------------------------------
    | Employee Information Heading
    |--------------------------------------------------------------------------
    */

    doc.font("Helvetica-Bold")
        .fontSize(11)
        .text(
            "Employee Details",
            35,
            115
        );


    /*
    |--------------------------------------------------------------------------
    | Employee Details Table
    |--------------------------------------------------------------------------
    */

    const detailTop = 138;
    const rowHeight = 22;

    const leftX = 35;
    const midX = 245;
    const rightX = 430;
    const endX = 807;

    const detailRows = [
        [
            "Employee Name",
            employeeName,
            "Employee Code",
            employeeCode
        ],
        [
            "Designation",
            designation,
            "Department",
            department
        ],
        [
            "Joining Date",
            joiningDate,
            "Grade",
            grade
        ],
        [
            "Location",
            location,
            "Bank Account",
            bankAccount
        ],
        [
            "Bank Name",
            bankName,
            "IFSC",
            ifsc
        ],
        [
            "PAN",
            pan,
            "PF Number",
            pfNumber
        ],
        [
            "UAN",
            uan,
            "ESIC",
            esic
        ]
    ];


    detailRows.forEach((row, index) => {

        const y =
            detailTop +
            index * rowHeight;

        doc.rect(
            leftX,
            y,
            endX - leftX,
            rowHeight
        )
            .lineWidth(0.5)
            .stroke();

        doc.font("Helvetica-Bold")
            .fontSize(7)
            .text(
                row[0],
                leftX + 5,
                y + 7,
                {
                    width: 100
                }
            );

        doc.font("Helvetica")
            .fontSize(7)
            .text(
                row[1],
                leftX + 105,
                y + 7,
                {
                    width: 100
                }
            );

        doc.font("Helvetica-Bold")
            .fontSize(7)
            .text(
                row[2],
                rightX - 180,
                y + 7,
                {
                    width: 100
                }
            );

        doc.font("Helvetica")
            .fontSize(7)
            .text(
                row[3],
                rightX - 75,
                y + 7,
                {
                    width: 130
                }
            );
    });


    /*
    |--------------------------------------------------------------------------
    | Attendance Section
    |--------------------------------------------------------------------------
    */

    const attendanceTop =
        detailTop +
        detailRows.length * rowHeight +
        18;

    doc.font("Helvetica-Bold")
        .fontSize(10)
        .text(
            "Attendance",
            35,
            attendanceTop
        );

    const attendanceY =
        attendanceTop + 20;

    doc.rect(
        35,
        attendanceY,
        772,
        25
    )
        .lineWidth(0.5)
        .stroke();

    doc.font("Helvetica-Bold")
        .fontSize(7)
        .text(
            "Standard Days",
            45,
            attendanceY + 8
        );

    doc.font("Helvetica")
        .text(
            standardDays,
            130,
            attendanceY + 8
        );

    doc.font("Helvetica-Bold")
        .text(
            "LWOP Days",
            245,
            attendanceY + 8
        );

    doc.font("Helvetica")
        .text(
            lwopDays,
            315,
            attendanceY + 8
        );

    doc.font("Helvetica-Bold")
        .text(
            "Days Worked",
            430,
            attendanceY + 8
        );

    doc.font("Helvetica")
        .text(
            daysWorked,
            510,
            attendanceY + 8
        );


    /*
    |--------------------------------------------------------------------------
    | Salary Table
    |--------------------------------------------------------------------------
    */

    const salaryTop =
        attendanceY + 48;

    doc.font("Helvetica-Bold")
        .fontSize(10)
        .text(
            "Salary Details",
            35,
            salaryTop
        );

    const tableY = salaryTop + 20;

    const col1 = 35;
    const col2 = 285;
    const col3 = 430;
    const col4 = 580;
    const col5 = 807;

    /*
    |--------------------------------------------------------------------------
    | Table Header
    |--------------------------------------------------------------------------
    */

    doc.rect(
        col1,
        tableY,
        col5 - col1,
        27
    )
        .lineWidth(0.7)
        .stroke();

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .text(
            "Earnings",
            col1 + 8,
            tableY + 9
        );

    doc.text(
        "Amount",
        col2 + 8,
        tableY + 9
    );

    doc.text(
        "Deductions",
        col3 + 8,
        tableY + 9
    );

    doc.text(
        "Amount",
        col4 + 8,
        tableY + 9
    );


    /*
    |--------------------------------------------------------------------------
    | Salary Rows
    |--------------------------------------------------------------------------
    */

    const salaryRows = [
        [
            "Basic Salary",
            basicSalary,
            "Provident Fund",
            providentFund
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
            leaveTravelAllowance,
            "",
            0
        ],
        [
            "Performance Bonus",
            performanceBonus,
            "",
            0
        ]
    ];


    const salaryRowHeight = 24;

    salaryRows.forEach((row, index) => {

        const y =
            tableY +
            27 +
            index * salaryRowHeight;

        doc.rect(
            col1,
            y,
            col5 - col1,
            salaryRowHeight
        )
            .lineWidth(0.5)
            .stroke();

        doc.font("Helvetica")
            .fontSize(7.5)
            .text(
                row[0],
                col1 + 8,
                y + 8,
                {
                    width: 230
                }
            );

        doc.text(
            formatMoney(row[1]),
            col2 + 8,
            y + 8,
            {
                width: 130,
                align: "right"
            }
        );

        doc.text(
            row[2],
            col3 + 8,
            y + 8,
            {
                width: 135
            }
        );

        if (row[2]) {
            doc.text(
                formatMoney(row[3]),
                col4 + 8,
                y + 8,
                {
                    width: 210,
                    align: "right"
                }
            );
        }
    });


    /*
    |--------------------------------------------------------------------------
    | Total Row
    |--------------------------------------------------------------------------
    */

    const totalY =
        tableY +
        27 +
        salaryRows.length * salaryRowHeight;

    doc.rect(
        col1,
        totalY,
        col5 - col1,
        28
    )
        .lineWidth(0.8)
        .stroke();

    doc.font("Helvetica-Bold")
        .fontSize(8)
        .text(
            "Total Earnings",
            col1 + 8,
            totalY + 9
        );

    doc.text(
        formatMoney(totalEarnings),
        col2 + 8,
        totalY + 9,
        {
            width: 130,
            align: "right"
        }
    );

    doc.text(
        "Total Deductions",
        col3 + 8,
        totalY + 9
    );

    doc.text(
        formatMoney(totalDeductions),
        col4 + 8,
        totalY + 9,
        {
            width: 210,
            align: "right"
        }
    );


    /*
    |--------------------------------------------------------------------------
    | Net Pay
    |--------------------------------------------------------------------------
    */

    const netPayY =
        totalY + 42;

    doc.rect(
        35,
        netPayY,
        772,
        38
    )
        .lineWidth(1)
        .stroke();

    doc.font("Helvetica-Bold")
        .fontSize(11)
        .text(
            "NET PAY",
            48,
            netPayY + 13
        );

    doc.font("Helvetica-Bold")
        .fontSize(12)
        .text(
            formatMoney(netPay),
            600,
            netPayY + 12,
            {
                width: 155,
                align: "right"
            }
        );


    /*
    |--------------------------------------------------------------------------
    | Amount In Words
    |--------------------------------------------------------------------------
    */

    const words = convertNumberToWords(netPay);

    if (words) {

        doc.font("Helvetica")
            .fontSize(7)
            .text(
                `Amount in Words: ${text(words)}`,
                40,
                netPayY + 48,
                {
                    width: 760
                }
            );
    }


    /*
    |--------------------------------------------------------------------------
    | Company Tax Details
    |--------------------------------------------------------------------------
    */

    const taxY = 535;

    if (companyGstin || companyPan) {

        doc.font("Helvetica")
            .fontSize(6.5)
            .text(
                `GSTIN: ${companyGstin}    PAN: ${companyPan}`,
                35,
                taxY,
                {
                    width: 500
                }
            );
    }


    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    doc.font("Helvetica")
        .fontSize(6.5)
        .text(
            "This is a computer generated payslip and does not require signature and stamp.",
            35,
            552,
            {
                width: 772,
                align: "center"
            }
        );


    /*
    |--------------------------------------------------------------------------
    | Renderer Result
    |--------------------------------------------------------------------------
    */

    return {
        totalEarnings,
        totalDeductions,
        netPay
    };
};


module.exports = renderPankajPdf;