const {
    money,
    getEmployeeField,
    getSalaryValue,
    getCompanyName,
    getCompanyAddress,
    getCompanyContact,
    getCompanyEmail,
    formatDate,
    formatMonth,
    drawLine,
    drawBox,
    drawText,
    drawCenteredText,
    getLogoBuffer
} = require("./pdfHelpers");


/* =========================================================
   SURJEET SINGH PDF RENDERER

   Controller call:
   renderer(doc, { employee, company, template })

   This renderer therefore receives:
   1. doc
   2. payslipData
========================================================= */

const renderSurjeetPdf = async (
    doc,
    {
        employee,
        company,
        template
    }
) => {

    /* =====================================================
       A4 PORTRAIT
       595 x 842 points
    ===================================================== */

    const PAGE_WIDTH = 595;
    const PAGE_HEIGHT = 842;

    const margin = 32;

    const contentWidth =
        PAGE_WIDTH - margin * 2;


    /* =====================================================
       EMPLOYEE DATA
    ===================================================== */

    const employeeCode =
        getEmployeeField(
            employee,
            "employeeCode",
            employee?.employeeId || ""
        );

    /*
      Your current employee document has:

      employee.employeeFields.fullName

      while template uses:

      employeeName

      getEmployeeField() should handle this.
      Fallback is also added for safety.
    */

    const employeeName =
        getEmployeeField(
            employee,
            "employeeName",
            employee?.employeeFields?.fullName || ""
        );

    const joiningDate =
        getEmployeeField(
            employee,
            "joiningDate",
            ""
        );

    const designation =
        getEmployeeField(
            employee,
            "designation",
            employee?.employeeFields?.designation || ""
        );

    const department =
        getEmployeeField(
            employee,
            "department",
            employee?.employeeFields?.department || ""
        );

    const grade =
        getEmployeeField(
            employee,
            "grade",
            ""
        );

    const location =
        getEmployeeField(
            employee,
            "location",
            ""
        );

    const bankAccountNumber =
        getEmployeeField(
            employee,
            "bankAccountNumber",
            employee?.employeeFields?.bankAccount || ""
        );

    const ifsc =
        getEmployeeField(
            employee,
            "ifsc",
            employee?.employeeFields?.ifsc || ""
        );

    const bankName =
        getEmployeeField(
            employee,
            "bankName",
            ""
        );

    const panNumber =
        getEmployeeField(
            employee,
            "panNumber",
            ""
        );

    const pfNumber =
        getEmployeeField(
            employee,
            "pfNumber",
            employee?.employeeFields?.pfNumber || ""
        );

    const uanNumber =
        getEmployeeField(
            employee,
            "uanNumber",
            ""
        );

    const esicNumber =
        getEmployeeField(
            employee,
            "esicNumber",
            ""
        );

    const standardDays =
        getEmployeeField(
            employee,
            "standardDays",
            ""
        );

    const lwopDays =
        getEmployeeField(
            employee,
            "lwopDays",
            ""
        );

    const daysWorked =
        getEmployeeField(
            employee,
            "daysWorked",
            ""
        );

    const salaryMonth =
        getEmployeeField(
            employee,
            "salaryMonth",
            ""
        );


    /* =====================================================
       COMPANY DATA
    ===================================================== */

    const companyName =
        getCompanyName(company);

    const companyAddress =
        getCompanyAddress(company);

    const companyContact =
        getCompanyContact(company);

    const companyEmail =
        getCompanyEmail(company);


    /* =====================================================
       TEMPLATE COMPONENTS
    ===================================================== */

    const earnings =
        Array.isArray(template?.earnings)
            ? template.earnings
            : [];

    const deductions =
        Array.isArray(template?.deductions)
            ? template.deductions
            : [];


    /* =====================================================
       SALARY HELPERS
    ===================================================== */

    /*
      Current employee data example:

      earnings:
        basicSalary
        hra
        otherAllowance
        bonus

      Template example:

        basicSalary
        houseRentAllowance
        otherAllowance
        performanceBonus

      pdfHelpers.getSalaryValue() should resolve the
      actual employee salary values.

      Additional aliases are handled below.
    */

    const salaryAliases = {
        houseRentAllowance: "hra",
        performanceBonus: "bonus"
    };


    const getEarning = (
        key,
        column = "Amount"
    ) => {

        let value =
            getSalaryValue(
                employee,
                "earnings",
                key,
                column
            );

        /*
          If template key doesn't exist in employee,
          try known aliases.
        */

        if (
            (!value || Number(value) === 0) &&
            salaryAliases[key]
        ) {

            value =
                getSalaryValue(
                    employee,
                    "earnings",
                    salaryAliases[key],
                    column
                );
        }

        return Number(value) || 0;
    };


    const getDeduction = (
        key,
        column = "Amount"
    ) => {

        const value =
            getSalaryValue(
                employee,
                "deductions",
                key,
                column
            );

        return Number(value) || 0;
    };


    /* =====================================================
       TOTALS
    ===================================================== */

    const grossEarnings =
        earnings.reduce(
            (total, item) => {

                return (
                    total +
                    getEarning(
                        item.key,
                        "Amount"
                    )
                );

            },
            0
        );


    const grossDeductions =
        deductions.reduce(
            (total, item) => {

                return (
                    total +
                    getDeduction(
                        item.key,
                        "Amount"
                    )
                );

            },
            0
        );


    const netPay =
        grossEarnings -
        grossDeductions;


    /* =====================================================
       PAGE
    ===================================================== */

    /*
      IMPORTANT:

      PDFKit automatically creates the first page.

      The controller creates:

          new PDFDocument({
              size: "A4",
              margin: 0,
              autoFirstPage: true
          });

      Therefore we DO NOT need another addPage()
      here.

      This was the direct cause of the previous crash.
    */


    /* =====================================================
       OUTER BORDER
    ===================================================== */

    drawBox(
        doc,
        margin,
        margin,
        contentWidth,
        PAGE_HEIGHT - margin * 2,
        0.8
    );


    let currentY =
        margin + 12;


    /* =====================================================
       HEADER / LOGO
    ===================================================== */

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
                    margin + 10,
                    currentY,
                    {
                        fit: [55, 48],
                        align: "center",
                        valign: "center"
                    }
                );

            }

        } catch (error) {

            console.log(
                "Surjeet PDF logo error:",
                error.message
            );

        }

    }


    /* =====================================================
       COMPANY HEADER
    ===================================================== */

    drawText(
        doc,
        companyName,
        margin + 72,
        currentY + 2,
        {
            width: contentWidth - 82,
            fontSize: 16,
            bold: true
        }
    );


    currentY += 21;


    if (companyAddress) {

        drawText(
            doc,
            companyAddress,
            margin + 72,
            currentY,
            {
                width: contentWidth - 82,
                fontSize: 8
            }
        );

        currentY += 13;
    }


    if (
        companyContact ||
        companyEmail
    ) {

        const contactText =
            [
                companyContact,
                companyEmail
            ]
                .filter(Boolean)
                .join("  |  ");


        drawText(
            doc,
            contactText,
            margin + 72,
            currentY,
            {
                width: contentWidth - 82,
                fontSize: 7.5
            }
        );

        currentY += 15;
    }


    /* =====================================================
       PAYSLIP TITLE
    ===================================================== */

    drawCenteredText(
        doc,
        "SALARY SLIP",
        margin,
        currentY + 3,
        contentWidth,
        {
            fontSize: 14,
            bold: true
        }
    );


    currentY += 21;


    drawCenteredText(
        doc,
        formatMonth(salaryMonth),
        margin,
        currentY + 2,
        contentWidth,
        {
            fontSize: 9,
            bold: true
        }
    );


    currentY += 20;


    /* =====================================================
       EMPLOYEE INFORMATION
    ===================================================== */

    const infoY =
        currentY;

    const infoHeight =
        156;


    drawBox(
        doc,
        margin,
        infoY,
        contentWidth,
        infoHeight,
        0.7
    );


    /*
      4 columns

      Label | Value | Label | Value
    */

    const label1Width = 92;

    const value1Width = 155;

    const label2Width = 92;

    const value2Width =
        contentWidth -
        label1Width -
        value1Width -
        label2Width;


    const rows = [

        [
            "Employee Code",
            employeeCode,
            "Employee Name",
            employeeName
        ],

        [
            "Joining Date",
            formatDate(joiningDate),
            "Designation",
            designation
        ],

        [
            "Department",
            department,
            "Grade",
            grade
        ],

        [
            "Location",
            location,
            "Bank Name",
            bankName
        ],

        [
            "Bank Account No",
            bankAccountNumber,
            "IFSC",
            ifsc
        ],

        [
            "PAN Number",
            panNumber,
            "PF Number",
            pfNumber
        ],

        [
            "UAN Number",
            uanNumber,
            "ESIC Number",
            esicNumber
        ],

        [
            "Standard Days",
            standardDays,
            "LWOP Days",
            lwopDays
        ],

        [
            "Days Worked",
            daysWorked,
            "Salary Month",
            formatMonth(salaryMonth)
        ]

    ];


    const infoRowHeight =
        infoHeight /
        rows.length;


    /* =====================================================
       INFO VERTICAL LINES
    ===================================================== */

    drawLine(
        doc,
        margin + label1Width,
        infoY,
        margin + label1Width,
        infoY + infoHeight,
        0.4
    );


    drawLine(
        doc,
        margin +
            label1Width +
            value1Width,
        infoY,
        margin +
            label1Width +
            value1Width,
        infoY + infoHeight,
        0.4
    );


    drawLine(
        doc,
        margin +
            label1Width +
            value1Width +
            label2Width,
        infoY,
        margin +
            label1Width +
            value1Width +
            label2Width,
        infoY + infoHeight,
        0.4
    );


    /* =====================================================
       INFO ROWS
    ===================================================== */

    rows.forEach(
        (row, index) => {

            const y =
                infoY +
                index *
                    infoRowHeight;


            if (index > 0) {

                drawLine(
                    doc,
                    margin,
                    y,
                    margin + contentWidth,
                    y,
                    0.35
                );

            }


            drawText(
                doc,
                row[0],
                margin + 4,
                y + 4,
                {
                    width:
                        label1Width - 8,
                    fontSize: 6.8,
                    bold: true
                }
            );


            drawText(
                doc,
                row[1],
                margin +
                    label1Width +
                    4,
                y + 4,
                {
                    width:
                        value1Width - 8,
                    fontSize: 7
                }
            );


            drawText(
                doc,
                row[2],
                margin +
                    label1Width +
                    value1Width +
                    4,
                y + 4,
                {
                    width:
                        label2Width - 8,
                    fontSize: 6.8,
                    bold: true
                }
            );


            drawText(
                doc,
                row[3],
                margin +
                    label1Width +
                    value1Width +
                    label2Width +
                    4,
                y + 4,
                {
                    width:
                        value2Width - 8,
                    fontSize: 7
                }
            );

        }
    );


    currentY =
        infoY +
        infoHeight +
        12;


    /* =====================================================
       EARNINGS + DEDUCTIONS TABLE
    ===================================================== */

    const tableX =
        margin;

    const tableY =
        currentY;

    const tableWidth =
        contentWidth;

    const descriptionWidth =
        255;

    const standardRateWidth =
        120;

    const amountWidth =
        tableWidth -
        descriptionWidth -
        standardRateWidth;

    const tableHeaderHeight =
        28;

    const salaryRowHeight =
        18;


    /* =====================================================
       TABLE HEADER
    ===================================================== */

    drawBox(
        doc,
        tableX,
        tableY,
        tableWidth,
        tableHeaderHeight,
        0.8
    );


    drawLine(
        doc,
        tableX + descriptionWidth,
        tableY,
        tableX + descriptionWidth,
        tableY + tableHeaderHeight
    );


    drawLine(
        doc,
        tableX +
            descriptionWidth +
            standardRateWidth,
        tableY,
        tableX +
            descriptionWidth +
            standardRateWidth,
        tableY + tableHeaderHeight
    );


    drawCenteredText(
        doc,
        "Earnings / Deductions",
        tableX,
        tableY + 5,
        descriptionWidth,
        {
            fontSize: 8,
            bold: true
        }
    );


    drawCenteredText(
        doc,
        "Standard Rate",
        tableX + descriptionWidth,
        tableY + 5,
        standardRateWidth,
        {
            fontSize: 8,
            bold: true
        }
    );


    drawCenteredText(
        doc,
        "Amount",
        tableX +
            descriptionWidth +
            standardRateWidth,
        tableY + 5,
        amountWidth,
        {
            fontSize: 8,
            bold: true
        }
    );


    currentY =
        tableY +
        tableHeaderHeight;


    /* =====================================================
       EARNINGS SECTION
    ===================================================== */

    const earningsTitleY =
        currentY;


    drawBox(
        doc,
        tableX,
        earningsTitleY,
        tableWidth,
        18,
        0.5
    );


    drawText(
        doc,
        "EARNINGS",
        tableX + 5,
        earningsTitleY + 5,
        {
            fontSize: 8,
            bold: true
        }
    );


    currentY += 18;


    earnings.forEach(
        (item) => {

            const rowY =
                currentY;


            drawBox(
                doc,
                tableX,
                rowY,
                tableWidth,
                salaryRowHeight,
                0.4
            );


            drawLine(
                doc,
                tableX + descriptionWidth,
                rowY,
                tableX + descriptionWidth,
                rowY + salaryRowHeight,
                0.4
            );


            drawLine(
                doc,
                tableX +
                    descriptionWidth +
                    standardRateWidth,
                rowY,
                tableX +
                    descriptionWidth +
                    standardRateWidth,
                rowY + salaryRowHeight,
                0.4
            );


            drawText(
                doc,
                item.label,
                tableX + 5,
                rowY + 5,
                {
                    width:
                        descriptionWidth - 10,
                    fontSize: 7.5
                }
            );


            drawText(
                doc,
                money(
                    getEarning(
                        item.key,
                        "Standard Rate"
                    )
                ),
                tableX +
                    descriptionWidth +
                    4,
                rowY + 5,
                {
                    width:
                        standardRateWidth - 8,
                    align: "right",
                    fontSize: 7.5
                }
            );


            drawText(
                doc,
                money(
                    getEarning(
                        item.key,
                        "Amount"
                    )
                ),
                tableX +
                    descriptionWidth +
                    standardRateWidth +
                    4,
                rowY + 5,
                {
                    width:
                        amountWidth - 8,
                    align: "right",
                    fontSize: 7.5
                }
            );


            currentY +=
                salaryRowHeight;

        }
    );


    /* =====================================================
       GROSS EARNINGS
    ===================================================== */

    drawBox(
        doc,
        tableX,
        currentY,
        tableWidth,
        20,
        0.7
    );


    drawText(
        doc,
        "Gross Earnings",
        tableX + 5,
        currentY + 6,
        {
            width:
                descriptionWidth +
                standardRateWidth -
                10,
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        money(grossEarnings),
        tableX +
            descriptionWidth +
            standardRateWidth +
            4,
        currentY + 6,
        {
            width:
                amountWidth - 8,
            align: "right",
            fontSize: 8,
            bold: true
        }
    );


    currentY += 20;


    /* =====================================================
       DEDUCTIONS SECTION
    ===================================================== */

    drawBox(
        doc,
        tableX,
        currentY,
        tableWidth,
        18,
        0.5
    );


    drawText(
        doc,
        "DEDUCTIONS",
        tableX + 5,
        currentY + 5,
        {
            fontSize: 8,
            bold: true
        }
    );


    currentY += 18;


    deductions.forEach(
        (item) => {

            const rowY =
                currentY;


            drawBox(
                doc,
                tableX,
                rowY,
                tableWidth,
                salaryRowHeight,
                0.4
            );


            drawLine(
                doc,
                tableX + descriptionWidth,
                rowY,
                tableX + descriptionWidth,
                rowY + salaryRowHeight,
                0.4
            );


            drawLine(
                doc,
                tableX +
                    descriptionWidth +
                    standardRateWidth,
                rowY,
                tableX +
                    descriptionWidth +
                    standardRateWidth,
                rowY + salaryRowHeight,
                0.4
            );


            drawText(
                doc,
                item.label,
                tableX + 5,
                rowY + 5,
                {
                    width:
                        descriptionWidth - 10,
                    fontSize: 7.5
                }
            );


            /*
              Surjeet deductions don't have
              Standard Rate in the reference format.
            */

            drawText(
                doc,
                "",
                tableX +
                    descriptionWidth +
                    4,
                rowY + 5,
                {
                    width:
                        standardRateWidth - 8,
                    fontSize: 7.5
                }
            );


            drawText(
                doc,
                money(
                    getDeduction(
                        item.key,
                        "Amount"
                    )
                ),
                tableX +
                    descriptionWidth +
                    standardRateWidth +
                    4,
                rowY + 5,
                {
                    width:
                        amountWidth - 8,
                    align: "right",
                    fontSize: 7.5
                }
            );


            currentY +=
                salaryRowHeight;

        }
    );


    /* =====================================================
       GROSS DEDUCTIONS
    ===================================================== */

    drawBox(
        doc,
        tableX,
        currentY,
        tableWidth,
        20,
        0.7
    );


    drawText(
        doc,
        "Gross Deductions",
        tableX + 5,
        currentY + 6,
        {
            width:
                descriptionWidth +
                standardRateWidth -
                10,
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        money(grossDeductions),
        tableX +
            descriptionWidth +
            standardRateWidth +
            4,
        currentY + 6,
        {
            width:
                amountWidth - 8,
            align: "right",
            fontSize: 8,
            bold: true
        }
    );


    currentY += 20;


    /* =====================================================
       NET PAY
    ===================================================== */

    drawBox(
        doc,
        tableX,
        currentY,
        tableWidth,
        27,
        0.9
    );


    drawText(
        doc,
        "NET PAY",
        tableX + 8,
        currentY + 8,
        {
            fontSize: 10,
            bold: true
        }
    );


    drawText(
        doc,
        `INR ${money(netPay)}`,
        tableX +
            descriptionWidth,
        currentY + 7,
        {
            width:
                standardRateWidth +
                amountWidth -
                12,
            align: "right",
            fontSize: 10,
            bold: true
        }
    );


    currentY += 34;


    /* =====================================================
       AMOUNT IN WORDS
    ===================================================== */

    drawText(
        doc,
        `Amount in Words: Rupees ${numberToWords(netPay)} Only`,
        tableX,
        currentY,
        {
            width: tableWidth,
            fontSize: 7.5
        }
    );


    /* =====================================================
       FOOTER
    ===================================================== */

    if (
        template?.layout?.hasFooter !== false
    ) {

        const footerText =
            template?.layout?.footerText ||
            "** This is a computer generated payslip and does not require signature and stamp.";


        drawCenteredText(
            doc,
            footerText,
            margin,
            PAGE_HEIGHT - 42,
            contentWidth,
            {
                fontSize: 6.5
            }
        );

    }


    /* =====================================================
       RETURN TOTALS
    ===================================================== */

    return {
        grossEarnings,
        grossDeductions,
        netPay
    };
};


/* =========================================================
   NUMBER TO WORDS
   Indian Numbering System
========================================================= */

const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
];


const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
];


const twoDigitWords = (num) => {

    if (num < 20) {
        return ones[num];
    }


    const ten =
        Math.floor(num / 10);


    const remainder =
        num % 10;


    return (
        tens[ten] +
        (
            remainder
                ? ` ${ones[remainder]}`
                : ""
        )
    );
};


const numberToWordIndian = (num) => {

    num =
        Math.floor(
            Math.abs(
                Number(num) || 0
            )
        );


    if (num === 0) {
        return "Zero";
    }


    let result = "";


    const crore =
        Math.floor(
            num / 10000000
        );


    num %= 10000000;


    const lakh =
        Math.floor(
            num / 100000
        );


    num %= 100000;


    const thousand =
        Math.floor(
            num / 1000
        );


    num %= 1000;


    const hundred =
        Math.floor(
            num / 100
        );


    num %= 100;


    if (crore) {

        result +=
            `${numberToWordIndian(crore)} Crore `;

    }


    if (lakh) {

        result +=
            `${numberToWordIndian(lakh)} Lakh `;

    }


    if (thousand) {

        result +=
            `${numberToWordIndian(thousand)} Thousand `;

    }


    if (hundred) {

        result +=
            `${ones[hundred]} Hundred `;

    }


    if (num) {

        result +=
            `${twoDigitWords(num)} `;

    }


    return result.trim();
};


const numberToWords = (amount) => {

    return numberToWordIndian(
        amount
    );

};


module.exports = renderSurjeetPdf;

