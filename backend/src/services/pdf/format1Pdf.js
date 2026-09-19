const {
    money,
    numberToWords,
    getSalaryValue,
    getLogoBuffer
} = require("./pdfHelpers");


/*
|--------------------------------------------------------------------------
| FORMAT 1 - LOCAL HELPERS
|--------------------------------------------------------------------------
*/

const safeTextLocal = (value, fallback = "") => {
    if (
        value === undefined ||
        value === null
    ) {
        return fallback;
    }

    return String(value);
};


const getFieldLocal = (
    employee,
    ...keys
) => {

    const fields =
        employee?.employeeFields || {};

    for (const key of keys) {

        if (
            fields[key] !== undefined &&
            fields[key] !== null &&
            String(fields[key]).trim() !== ""
        ) {
            return fields[key];
        }

        if (
            employee?.[key] !== undefined &&
            employee?.[key] !== null &&
            String(employee[key]).trim() !== ""
        ) {
            return employee[key];
        }
    }

    return "";
};


const getSalaryLocal = (
    employee,
    section,
    ...keys
) => {

    const salary =
        employee?.[section] || {};

    for (const key of keys) {

        if (
            salary[key] !== undefined &&
            salary[key] !== null &&
            salary[key] !== ""
        ) {
            const value =
                Number(salary[key]);

            if (!Number.isNaN(value)) {
                return value;
            }
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Existing helper fallback
    |--------------------------------------------------------------------------
    */

    if (
        typeof getSalaryValue ===
        "function"
    ) {

        for (const key of keys) {

            try {

                const value =
                    getSalaryValue(
                        employee,
                        section,
                        key
                    );

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    const numberValue =
                        Number(value);

                    if (
                        !Number.isNaN(
                            numberValue
                        )
                    ) {
                        return numberValue;
                    }
                }

            } catch (error) {
                // Ignore helper error
            }
        }
    }

    return 0;
};


const formatMoney = (value) => {

    try {

        if (
            typeof money ===
            "function"
        ) {
            return money(
                Number(value) || 0
            );
        }

    } catch (error) {
        // fallback
    }

    return (
        Number(value) || 0
    ).toFixed(2);
};


const formatWords = (value) => {

    try {

        if (
            typeof numberToWords ===
            "function"
        ) {
            return numberToWords(
                Number(value) || 0
            );
        }

    } catch (error) {
        // fallback
    }

    return "";
};


/*
|--------------------------------------------------------------------------
| FORMAT 1 PDF RENDERER
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Controller creates PDFDocument.
| This renderer only draws on `doc`.
|
| DO NOT:
| - new PDFDocument()
| - doc.pipe()
| - doc.end()
| - new Promise()
|
|--------------------------------------------------------------------------
*/

const renderFormat1Pdf = async (
    doc,
    {
        employee = {},
        company = {},
        template = {}
    } = {}
) => {

    /*
    |--------------------------------------------------------------------------
    | Page Dimensions
    |--------------------------------------------------------------------------
    */

    const pageWidth =
        doc.page.width;

    const pageHeight =
        doc.page.height;

    const left = 35;

    const right =
        pageWidth - 35;

    const width =
        right - left;


    /*
    |--------------------------------------------------------------------------
    | Employee Fields
    |--------------------------------------------------------------------------
    */

    const empNo =
        getFieldLocal(
            employee,
            "empNo",
            "employeeNo",
            "employeeId",
            "employeeCode"
        );

    const name =
        getFieldLocal(
            employee,
            "name",
            "employeeName",
            "fullName"
        );

    const companyName =
        getFieldLocal(
            employee,
            "company"
        ) ||
        company?.name ||
        "";

    const vertical =
        getFieldLocal(
            employee,
            "vertical"
        );

    const designation =
        getFieldLocal(
            employee,
            "designation"
        );

    const deptDoj =
        getFieldLocal(
            employee,
            "deptDoj",
            "doj",
            "joiningDate",
            "dateOfJoining"
        );

    const location =
        getFieldLocal(
            employee,
            "location"
        );

    const bankName =
        getFieldLocal(
            employee,
            "bankName"
        );

    const accountNo =
        getFieldLocal(
            employee,
            "accountNo",
            "bankAccountNo",
            "bankAccount",
            "bankAccountNumber"
        );

    const gender =
        getFieldLocal(
            employee,
            "gender"
        );

    const empPan =
        getFieldLocal(
            employee,
            "empPan",
            "pan",
            "panNumber"
        );

    const pfNo =
        getFieldLocal(
            employee,
            "pfNo",
            "pfNumber"
        );

    const uan =
        getFieldLocal(
            employee,
            "uan",
            "pfUan",
            "uanNumber"
        );


    /*
    |--------------------------------------------------------------------------
    | Salary Month / Year
    |--------------------------------------------------------------------------
    */

    const salaryMonth =
        getFieldLocal(
            employee,
            "salaryMonth",
            "month"
        ) ||
        employee?.month ||
        "JANUARY";

    const salaryYear =
        getFieldLocal(
            employee,
            "year"
        ) ||
        employee?.year ||
        new Date().getFullYear();


    /*
    |--------------------------------------------------------------------------
    | Earnings
    |--------------------------------------------------------------------------
    */

    const basicSalary =
        getSalaryLocal(
            employee,
            "earnings",
            "basicSalary",
            "basic"
        );

    const hra =
        getSalaryLocal(
            employee,
            "earnings",
            "houseRentAllowance",
            "hra"
        );

    const otherAllowance =
        getSalaryLocal(
            employee,
            "earnings",
            "otherAllowance",
            "other"
        );

    const leaveTravelAllowance =
        getSalaryLocal(
            employee,
            "earnings",
            "leaveTravelAllowance",
            "lta"
        );

    const performanceBonus =
        getSalaryLocal(
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

    const providentFund =
        getSalaryLocal(
            employee,
            "deductions",
            "providentFund",
            "pf"
        );

    const professionalTax =
        getSalaryLocal(
            employee,
            "deductions",
            "professionalTax",
            "pt"
        );

    const incomeTax =
        getSalaryLocal(
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

    const grossEarnings =
        basicSalary +
        hra +
        otherAllowance +
        leaveTravelAllowance +
        performanceBonus;

    const totalDeductions =
        providentFund +
        professionalTax +
        incomeTax;

    const calculatedNetPay =
        grossEarnings -
        totalDeductions;

    const netPay =
        Number(
            employee?.netPay
        ) ||
        calculatedNetPay;


    /*
    |--------------------------------------------------------------------------
    | Attendance
    |--------------------------------------------------------------------------
    */

    const calendarDays =
        getFieldLocal(
            employee,
            "calendarDays",
            "daysInMonth"
        ) || 31;

    const lossOfPay =
        getFieldLocal(
            employee,
            "lossOfPay",
            "lop",
            "lwopDays"
        ) || 0;

    const lopReversal =
        getFieldLocal(
            employee,
            "lopReversal"
        ) || 0;

    const arrearDays =
        getFieldLocal(
            employee,
            "arrearDays"
        ) || 0;

    const daysPayable =
        getFieldLocal(
            employee,
            "daysPayable",
            "paidDays",
            "daysWorked"
        ) ||
        calendarDays;


    /*
    |--------------------------------------------------------------------------
    | Page Border
    |--------------------------------------------------------------------------
    */

    doc.lineWidth(0.7);

    doc.rect(
        20,
        20,
        pageWidth - 40,
        pageHeight - 40
    ).stroke();


    /*
    |--------------------------------------------------------------------------
    | Starting Position
    |--------------------------------------------------------------------------
    */

    let y = 45;


    /*
    |--------------------------------------------------------------------------
    | COMPANY LOGO
    |--------------------------------------------------------------------------
    |
    | Logo only if:
    | 1. Template supports logo
    | 2. Company has logo URL
    |
    |--------------------------------------------------------------------------
    */

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
                    left,
                    y - 8,
                    {
                        fit: [55, 45],
                        align: "center",
                        valign: "center"
                    }
                );
            }

        } catch (error) {

            console.log(
                "Format1 PDF logo error:",
                error.message
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Company Heading
    |--------------------------------------------------------------------------
    |
    | Logo hoy to company heading ne right side
    | thi start karaviye.
    |
    |--------------------------------------------------------------------------
    */

    const hasLogo =
        Boolean(
            template?.layout?.hasLogo &&
            company?.logoUrl
        );

    const companyTextX =
        hasLogo
            ? left + 70
            : left;

    const companyTextWidth =
        hasLogo
            ? width - 70
            : width;


    doc.font("Courier")
        .fontSize(8)
        .text(
            safeTextLocal(
                companyName ||
                "Arunima Constructions Private Limited"
            ),
            companyTextX,
            y,
            {
                width:
                    companyTextWidth
            }
        );

    y += 12;


    /*
    |--------------------------------------------------------------------------
    | Payslip Month
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(8)
        .text(
            `PAYSLIP FOR ${String(
                salaryMonth
            ).toUpperCase()} ${salaryYear}`,
            companyTextX,
            y,
            {
                width:
                    companyTextWidth
            }
        );

    y += 14;


    /*
    |--------------------------------------------------------------------------
    | Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(112),
            left,
            y
        );

    y += 12;


    /*
    |--------------------------------------------------------------------------
    | Employee Information
    |--------------------------------------------------------------------------
    */

    const leftInfo = [

        [
            "EMP NO",
            empNo
        ],

        [
            "NAME",
            name
        ],

        [
            "COMPANY",
            companyName
        ],

        [
            "VERTICAL",
            vertical
        ],

        [
            "DESIGNATION",
            designation
        ],

        [
            "DEPT DOJ",
            deptDoj
        ],

        [
            "LOCATION",
            location
        ]

    ];


    const rightInfo = [

        [
            "BANK NAME",
            bankName
        ],

        [
            "A/C NO",
            accountNo
        ],

        [
            "GENDER",
            gender
        ],

        [
            "EMP PAN",
            empPan
        ],

        [
            "PF NO",
            pfNo
        ],

        [
            "UAN",
            uan
        ]

    ];


    const lineGap = 11;

    const infoStartY = y;


    /*
    |--------------------------------------------------------------------------
    | Left Information
    |--------------------------------------------------------------------------
    */

    leftInfo.forEach(
        ([label, value], index) => {

            doc.font("Courier")
                .fontSize(7)
                .text(
                    `${label.padEnd(
                        14,
                        " "
                    )}: ${safeTextLocal(
                        value
                    )}`,
                    left,
                    infoStartY +
                    index * lineGap
                );
        }
    );


    /*
    |--------------------------------------------------------------------------
    | Right Information
    |--------------------------------------------------------------------------
    */

    const rightX =
        left + width * 0.55;


    rightInfo.forEach(
        ([label, value], index) => {

            doc.font("Courier")
                .fontSize(7)
                .text(
                    `${label.padEnd(
                        14,
                        " "
                    )}: ${safeTextLocal(
                        value
                    )}`,
                    rightX,
                    infoStartY +
                    index * lineGap
                );
        }
    );


    y +=
        Math.max(
            leftInfo.length,
            rightInfo.length
        ) *
        lineGap +
        3;


    /*
    |--------------------------------------------------------------------------
    | Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(112),
            left,
            y
        );

    y += 11;


    /*
    |--------------------------------------------------------------------------
    | Salary Table Header
    |--------------------------------------------------------------------------
    */

    const headerLine =
        "EARNINGS".padEnd(
            26,
            " "
        ) +
        "RATE".padStart(
            13,
            " "
        ) +
        "CURRENT MONTH".padStart(
            18,
            " "
        ) +
        "ARREAR (+/-)".padStart(
            16,
            " "
        ) +
        "DEDUCTIONS".padStart(
            19,
            " "
        ) +
        "CURRENT MONTH".padStart(
            17,
            " "
        );


    doc.font("Courier-Bold")
        .fontSize(7)
        .text(
            headerLine,
            left,
            y
        );

    y += 10;


    /*
    |--------------------------------------------------------------------------
    | Salary Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(112),
            left,
            y
        );

    y += 11;


    /*
    |--------------------------------------------------------------------------
    | Salary Rows
    |--------------------------------------------------------------------------
    */

    const salaryRows = [

        {
            earningLabel:
                "Basic",
            earningAmount:
                basicSalary,
            deductionLabel:
                "Provident Fund",
            deductionAmount:
                providentFund
        },

        {
            earningLabel:
                "House Rent Allowance",
            earningAmount:
                hra,
            deductionLabel:
                "Professional Tax",
            deductionAmount:
                professionalTax
        },

        {
            earningLabel:
                "Other Allowance",
            earningAmount:
                otherAllowance,
            deductionLabel:
                "Income Tax",
            deductionAmount:
                incomeTax
        },

        {
            earningLabel:
                "Leave Travel Allowance",
            earningAmount:
                leaveTravelAllowance,
            deductionLabel:
                "",
            deductionAmount:
                0
        },

        {
            earningLabel:
                "Performance Bonus",
            earningAmount:
                performanceBonus,
            deductionLabel:
                "",
            deductionAmount:
                0
        }

    ];


    salaryRows.forEach(
        (row) => {

            const earningLabel =
                safeTextLocal(
                    row.earningLabel
                );

            const deductionLabel =
                safeTextLocal(
                    row.deductionLabel
                );


            const line =
                earningLabel
                    .padEnd(
                        26,
                        " "
                    )
                    .slice(
                        0,
                        26
                    ) +

                formatMoney(
                    row.earningAmount
                )
                    .padStart(
                        14,
                        " "
                    ) +

                formatMoney(
                    row.earningAmount
                )
                    .padStart(
                        18,
                        " "
                    ) +

                formatMoney(0)
                    .padStart(
                        15,
                        " "
                    ) +

                deductionLabel
                    .padStart(
                        16,
                        " "
                    )
                    .slice(
                        -16
                    ) +

                formatMoney(
                    row.deductionAmount
                )
                    .padStart(
                        17,
                        " "
                    );


            doc.font("Courier")
                .fontSize(6.7)
                .text(
                    line,
                    left,
                    y
                );

            y += 11;
        }
    );


    /*
    |--------------------------------------------------------------------------
    | Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(112),
            left,
            y
        );

    y += 12;


    /*
    |--------------------------------------------------------------------------
    | Gross / Total Deduction
    |--------------------------------------------------------------------------
    */

    const grossLine =
        "GROSS EARNINGS".padEnd(
            26,
            " "
        ) +

        formatMoney(
            grossEarnings
        )
            .padStart(
                14,
                " "
            ) +

        formatMoney(
            grossEarnings
        )
            .padStart(
                18,
                " "
            ) +

        formatMoney(0)
            .padStart(
                15,
                " "
            ) +

        "TOTAL DEDUCTIONS"
            .padStart(
                16,
                " "
            ) +

        formatMoney(
            totalDeductions
        )
            .padStart(
                17,
                " "
            );


    doc.font("Courier-Bold")
        .fontSize(7)
        .text(
            grossLine,
            left,
            y
        );

    y += 12;


    /*
    |--------------------------------------------------------------------------
    | Net Pay Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(112),
            left,
            y
        );

    y += 12;


    /*
    |--------------------------------------------------------------------------
    | Net Pay
    |--------------------------------------------------------------------------
    */

    doc.font("Courier-Bold")
        .fontSize(8)
        .text(
            `NET PAY        ${formatMoney(
                netPay
            )}`,
            left,
            y
        );

    y += 13;


    /*
    |--------------------------------------------------------------------------
    | Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(112),
            left,
            y
        );

    y += 11;


    /*
    |--------------------------------------------------------------------------
    | Amount In Words
    |--------------------------------------------------------------------------
    */

    const amountWords =
        formatWords(netPay);


    if (amountWords) {

        doc.font("Courier")
            .fontSize(7)
            .text(
                `(${String(
                    amountWords
                ).toUpperCase()})`,
                left,
                y,
                {
                    width
                }
            );
    }


    y += 24;


    /*
    |--------------------------------------------------------------------------
    | Attendance Section
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(100),
            left,
            y
        );

    y += 11;


    const attendanceHeader =
        "CALENDAR DAYS".padEnd(
            18,
            " "
        ) +
        "|" +
        "LOSS OF PAY".padEnd(
            17,
            " "
        ) +
        "|" +
        "LOP REVERSAL".padEnd(
            18,
            " "
        ) +
        "|" +
        "ARREAR DAYS".padEnd(
            17,
            " "
        ) +
        "|" +
        "DAYS PAYABLE";


    doc.font("Courier")
        .fontSize(7)
        .text(
            attendanceHeader,
            left,
            y
        );

    y += 12;


    /*
    |--------------------------------------------------------------------------
    | Attendance Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(100),
            left,
            y
        );

    y += 12;


    /*
    |--------------------------------------------------------------------------
    | Attendance Values
    |--------------------------------------------------------------------------
    */

    const attendanceValues =
        String(
            calendarDays
        )
            .padStart(
                12,
                " "
            ) +

        "        |" +

        String(
            lossOfPay
        )
            .padStart(
                12,
                " "
            ) +

        "     |" +

        String(
            lopReversal
        )
            .padStart(
                12,
                " "
            ) +

        "       |" +

        String(
            arrearDays
        )
            .padStart(
                12,
                " "
            ) +

        "    |" +

        String(
            daysPayable
        )
            .padStart(
                12,
                " "
            );


    doc.font("Courier")
        .fontSize(7)
        .text(
            attendanceValues,
            left,
            y
        );

    y += 13;


    /*
    |--------------------------------------------------------------------------
    | Bottom Separator
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "_".repeat(100),
            left,
            y
        );

    y += 14;


    /*
    |--------------------------------------------------------------------------
    | Footer
    |--------------------------------------------------------------------------
    */

    doc.font("Courier")
        .fontSize(7)
        .text(
            "*This is a computer generated payslip and does not require signature.",
            left,
            y,
            {
                width
            }
        );


    /*
    |--------------------------------------------------------------------------
    | Renderer Result
    |--------------------------------------------------------------------------
    */

    return {
        totalEarnings:
            grossEarnings,

        totalDeductions:
            totalDeductions,

        netPay
    };
};


module.exports = renderFormat1Pdf;

