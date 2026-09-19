const {
    money,
    numberValue,
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
   HARDEEP SINGH PDF RENDERER

   Reference Format:
   Landscape A4

   Controller calls:

   renderer(doc, {
       employee,
       company,
       template
   });

========================================================= */


const renderHardeepPdf = async (
    doc,
    {
        employee,
        company,
        template
    }
) => {


    /* =====================================================
       A4 LANDSCAPE
       PDFKit points:
       842 x 595
    ===================================================== */

    const PAGE_WIDTH = 842;
    const PAGE_HEIGHT = 595;

    const margin = 28;

    const contentWidth =
        PAGE_WIDTH - margin * 2;


    /* =====================================================
       EMPLOYEE DATA
    ===================================================== */

    const employeeId =
        getEmployeeField(
            employee,
            "employeeId",
            employee?.employeeId || ""
        );


    const fullName =
        getEmployeeField(
            employee,
            "fullName",
            employee?.employeeFields?.fullName || ""
        );


    const designation =
        getEmployeeField(
            employee,
            "designation",
            employee?.employeeFields?.designation || ""
        );


    const joiningDate =
        getEmployeeField(
            employee,
            "joiningDate",
            ""
        );


    const gender =
        getEmployeeField(
            employee,
            "gender",
            ""
        );


    const pan =
        getEmployeeField(
            employee,
            "pan",
            employee?.employeeFields?.panNumber || ""
        );


    const pfPensionNumber =
        getEmployeeField(
            employee,
            "pfPensionNumber",
            employee?.employeeFields?.pfNumber || ""
        );


    const uan =
        getEmployeeField(
            employee,
            "uan",
            employee?.employeeFields?.uanNumber || ""
        );


    const bankName =
        getEmployeeField(
            employee,
            "bankName",
            ""
        );


    const bankAccountNumber =
        getEmployeeField(
            employee,
            "bankAccountNumber",
            employee?.employeeFields?.bankAccount || ""
        );


    const location =
        getEmployeeField(
            employee,
            "location",
            ""
        );


    const department =
        getEmployeeField(
            employee,
            "department",
            employee?.employeeFields?.department || ""
        );


    const band =
        getEmployeeField(
            employee,
            "band",
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


    const payPeriodStart =
        getEmployeeField(
            employee,
            "payPeriodStart",
            ""
        );


    const payPeriodEnd =
        getEmployeeField(
            employee,
            "payPeriodEnd",
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
       SALARY COMPONENTS
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
       EARNINGS
    ===================================================== */

    const earningAliases = {
        houseRentAllowance: "hra",
        performanceBonus: "bonus"
    };


    const getEarning = (
        key,
        column
    ) => {

        let value =
            getSalaryValue(
                employee,
                "earnings",
                key,
                column
            );


        /*
          Support current employee data where
          some salary keys may differ from template keys.
        */

        if (
            (!value || Number(value) === 0) &&
            earningAliases[key]
        ) {

            value =
                getSalaryValue(
                    employee,
                    "earnings",
                    earningAliases[key],
                    column
                );

        }


        return Number(value) || 0;
    };


    /* =====================================================
       DEDUCTIONS
    ===================================================== */

    const getDeduction = (
        key,
        column
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

    /*
      Reference Hardeep format:

      Standard Monthly Salary
      INR Earnings
      INR Deductions
    */


    const standardSalary =
        earnings.reduce(
            (total, item) => {

                return (
                    total +
                    getEarning(
                        item.key,
                        "Standard Monthly Salary"
                    )
                );

            },
            0
        );


    const grossEarnings =
        earnings.reduce(
            (total, item) => {

                return (
                    total +
                    getEarning(
                        item.key,
                        "INR Earnings"
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
                        "INR Deductions"
                    )
                );

            },
            0
        );


    const netPay =
        grossEarnings -
        grossDeductions;


    /* =====================================================
       PAGE SETUP
    ===================================================== */

    /*
      IMPORTANT:

      The controller already creates the first page:

      new PDFDocument({
          size: "A4",
          margin: 0,
          autoFirstPage: true
      });

      Therefore do NOT call doc.addPage() here.

      Also, the controller creates A4 in portrait mode,
      but this renderer is specifically designed for the
      Hardeep landscape format.

      PDFKit page orientation is therefore set here only
      if the current page is not already suitable.

      We intentionally avoid addPage() because the current
      controller owns the PDF page lifecycle.
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


    /* =====================================================
       HEADER
    ===================================================== */

    let currentY = 38;


    /* =====================================================
       COMPANY LOGO
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
                    margin + 8,
                    currentY,
                    {
                        fit: [55, 45],
                        align: "center",
                        valign: "center"
                    }
                );

            }

        } catch (error) {

            console.log(
                "Hardeep PDF logo error:",
                error.message
            );

        }

    }


    /* =====================================================
       COMPANY HEADING
    ===================================================== */

    drawCenteredText(
        doc,
        companyName,
        margin + 65,
        currentY,
        contentWidth - 130,
        {
            fontSize: 15,
            bold: true
        }
    );


    currentY += 20;


    /* =====================================================
       COMPANY ADDRESS
    ===================================================== */

    if (companyAddress) {

        drawCenteredText(
            doc,
            companyAddress,
            margin + 65,
            currentY,
            contentWidth - 130,
            {
                fontSize: 8
            }
        );


        currentY += 13;
    }


    /* =====================================================
       COMPANY CONTACT
    ===================================================== */

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


        drawCenteredText(
            doc,
            contactText,
            margin + 65,
            currentY,
            contentWidth - 130,
            {
                fontSize: 7.5
            }
        );


        currentY += 15;
    }


    /* =====================================================
       PAYSLIP HEADING
    ===================================================== */

    drawCenteredText(
        doc,
        "SALARY SLIP",
        margin,
        currentY,
        contentWidth,
        {
            fontSize: 13,
            bold: true
        }
    );


    currentY += 17;


    /* =====================================================
       SALARY MONTH
    ===================================================== */

    drawCenteredText(
        doc,
        formatMonth(salaryMonth),
        margin,
        currentY,
        contentWidth,
        {
            fontSize: 9,
            bold: true
        }
    );


    currentY += 19;


    /* =====================================================
       EMPLOYEE INFORMATION
    ===================================================== */

    const infoX =
        margin;


    const infoY =
        currentY;


    const infoWidth =
        contentWidth;


    const infoHeight =
        104;


    drawBox(
        doc,
        infoX,
        infoY,
        infoWidth,
        infoHeight,
        0.7
    );


    /*
      4 columns

      Label | Value | Label | Value
    */

    const col1 = 90;

    const col2 = 150;

    const col3 = 110;

    const col4 =
        infoWidth -
        col1 -
        col2 -
        col3;


    const rowHeight = 13;


    const employeeRows = [

        [
            "Employee ID",
            employeeId,
            "Designation",
            designation
        ],

        [
            "DOJ",
            formatDate(joiningDate),
            "Gender",
            gender
        ],

        [
            "PAN",
            pan,
            "PF/Pension No",
            pfPensionNumber
        ],

        [
            "UAN",
            uan,
            "Bank Name",
            bankName
        ],

        [
            "Bank Account No",
            bankAccountNumber,
            "Location",
            location
        ],

        [
            "Department",
            department,
            "Band",
            band
        ],

        [
            "Days Worked",
            daysWorked,
            "Pay Period",
            payPeriodStart &&
            payPeriodEnd
                ? `${formatDate(payPeriodStart)} - ${formatDate(payPeriodEnd)}`
                : ""
        ]

    ];


    /* =====================================================
       VERTICAL COLUMN LINES
    ===================================================== */

    drawLine(
        doc,
        infoX + col1,
        infoY,
        infoX + col1,
        infoY + infoHeight
    );


    drawLine(
        doc,
        infoX +
            col1 +
            col2,
        infoY,
        infoX +
            col1 +
            col2,
        infoY + infoHeight
    );


    drawLine(
        doc,
        infoX +
            col1 +
            col2 +
            col3,
        infoY,
        infoX +
            col1 +
            col2 +
            col3,
        infoY + infoHeight
    );


    /* =====================================================
       EMPLOYEE ROWS
    ===================================================== */

    employeeRows.forEach(
        (row, index) => {

            const y =
                infoY +
                index *
                    rowHeight;


            if (index > 0) {

                drawLine(
                    doc,
                    infoX,
                    y,
                    infoX + infoWidth,
                    y,
                    0.4
                );

            }


            drawText(
                doc,
                row[0],
                infoX + 4,
                y + 3,
                {
                    fontSize: 7,
                    bold: true
                }
            );


            drawText(
                doc,
                row[1],
                infoX + col1 + 4,
                y + 3,
                {
                    width: col2 - 8,
                    fontSize: 7
                }
            );


            drawText(
                doc,
                row[2],
                infoX +
                    col1 +
                    col2 +
                    4,
                y + 3,
                {
                    fontSize: 7,
                    bold: true
                }
            );


            drawText(
                doc,
                row[3],
                infoX +
                    col1 +
                    col2 +
                    col3 +
                    4,
                y + 3,
                {
                    width: col4 - 8,
                    fontSize: 7
                }
            );

        }
    );


    currentY =
        infoY +
        infoHeight +
        10;


    /* =====================================================
       SALARY TABLE
    ===================================================== */

    const tableX =
        margin;


    const tableY =
        currentY;


    const tableWidth =
        contentWidth;


    const descriptionWidth =
        210;


    const standardWidth =
        145;


    const earningWidth =
        145;


    const deductionWidth =
        tableWidth -
        descriptionWidth -
        standardWidth -
        earningWidth;


    const headerHeight =
        27;


    const rowHeightSalary =
        16;


    /* =====================================================
       TABLE HEADER
    ===================================================== */

    drawBox(
        doc,
        tableX,
        tableY,
        tableWidth,
        headerHeight,
        0.8
    );


    /* =====================================================
       HEADER VERTICAL LINES
    ===================================================== */

    drawLine(
        doc,
        tableX +
            descriptionWidth,
        tableY,
        tableX +
            descriptionWidth,
        tableY +
            headerHeight
    );


    drawLine(
        doc,
        tableX +
            descriptionWidth +
            standardWidth,
        tableY,
        tableX +
            descriptionWidth +
            standardWidth,
        tableY +
            headerHeight
    );


    drawLine(
        doc,
        tableX +
            descriptionWidth +
            standardWidth +
            earningWidth,
        tableY,
        tableX +
            descriptionWidth +
            standardWidth +
            earningWidth,
        tableY +
            headerHeight
    );


    /* =====================================================
       TABLE HEADINGS
    ===================================================== */

    drawCenteredText(
        doc,
        "Salary Structure",
        tableX,
        tableY + 4,
        descriptionWidth,
        {
            fontSize: 8,
            bold: true
        }
    );


    drawCenteredText(
        doc,
        "Standard Monthly Salary",
        tableX +
            descriptionWidth,
        tableY + 4,
        standardWidth,
        {
            fontSize: 8,
            bold: true
        }
    );


    drawCenteredText(
        doc,
        "INR Earnings",
        tableX +
            descriptionWidth +
            standardWidth,
        tableY + 4,
        earningWidth,
        {
            fontSize: 8,
            bold: true
        }
    );


    drawCenteredText(
        doc,
        "INR Deductions",
        tableX +
            descriptionWidth +
            standardWidth +
            earningWidth,
        tableY + 4,
        deductionWidth,
        {
            fontSize: 8,
            bold: true
        }
    );


    currentY =
        tableY +
        headerHeight;


    /* =====================================================
       SALARY ROWS
    ===================================================== */

    const maxRows =
        Math.max(
            earnings.length,
            deductions.length
        );


    for (
        let index = 0;
        index < maxRows;
        index++
    ) {

        const earning =
            earnings[index];


        const deduction =
            deductions[index];


        const rowY =
            currentY +
            index *
                rowHeightSalary;


        drawBox(
            doc,
            tableX,
            rowY,
            tableWidth,
            rowHeightSalary,
            0.4
        );


        /* =================================================
           VERTICAL LINES
        ================================================= */

        drawLine(
            doc,
            tableX +
                descriptionWidth,
            rowY,
            tableX +
                descriptionWidth,
            rowY +
                rowHeightSalary,
            0.4
        );


        drawLine(
            doc,
            tableX +
                descriptionWidth +
                standardWidth,
            rowY,
            tableX +
                descriptionWidth +
                standardWidth,
            rowY +
                rowHeightSalary,
            0.4
        );


        drawLine(
            doc,
            tableX +
                descriptionWidth +
                standardWidth +
                earningWidth,
            rowY,
            tableX +
                descriptionWidth +
                standardWidth +
                earningWidth,
            rowY +
                rowHeightSalary,
            0.4
        );


        /* =================================================
           EARNING DESCRIPTION
        ================================================= */

        if (earning) {

            drawText(
                doc,
                earning.label,
                tableX + 5,
                rowY + 4,
                {
                    width:
                        descriptionWidth - 10,
                    fontSize: 7.5
                }
            );


            /* =============================================
               STANDARD MONTHLY SALARY
            ============================================= */

            drawText(
                doc,
                money(
                    getEarning(
                        earning.key,
                        "Standard Monthly Salary"
                    )
                ),
                tableX +
                    descriptionWidth +
                    5,
                rowY + 4,
                {
                    width:
                        standardWidth - 10,
                    align: "right",
                    fontSize: 7.5
                }
            );


            /* =============================================
               INR EARNINGS
            ============================================= */

            drawText(
                doc,
                money(
                    getEarning(
                        earning.key,
                        "INR Earnings"
                    )
                ),
                tableX +
                    descriptionWidth +
                    standardWidth +
                    5,
                rowY + 4,
                {
                    width:
                        earningWidth - 10,
                    align: "right",
                    fontSize: 7.5
                }
            );

        }


        /* =================================================
           DEDUCTION SIDE
        ================================================= */

        if (deduction) {

            /*
              Hardeep reference has deductions in
              a separate right-side column.

              We intentionally render the label first.
            */

            drawText(
                doc,
                deduction.label,
                tableX +
                    descriptionWidth +
                    standardWidth +
                    earningWidth +
                    5,
                rowY + 4,
                {
                    width:
                        deductionWidth - 10,
                    fontSize: 7.5
                }
            );


            /*
              Amount is aligned right in the same
              deduction column.

              This keeps the original Hardeep
              table structure.
            */

            drawText(
                doc,
                money(
                    getDeduction(
                        deduction.key,
                        "INR Deductions"
                    )
                ),
                tableX +
                    descriptionWidth +
                    standardWidth +
                    earningWidth +
                    5,
                rowY + 4,
                {
                    width:
                        deductionWidth - 10,
                    align: "right",
                    fontSize: 7.5
                }
            );

        }

    }


    currentY =
        currentY +
        maxRows *
            rowHeightSalary;


    /* =====================================================
       TOTAL ROWS
    ===================================================== */

    const totalRowHeight =
        19;


    /* =====================================================
       TOTAL STANDARD SALARY
    ===================================================== */

    drawBox(
        doc,
        tableX,
        currentY,
        tableWidth,
        totalRowHeight,
        0.7
    );


    drawText(
        doc,
        "Total Standard Salary",
        tableX + 5,
        currentY + 5,
        {
            width:
                descriptionWidth - 10,
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        money(standardSalary),
        tableX +
            descriptionWidth +
            5,
        currentY + 5,
        {
            width:
                standardWidth - 10,
            align: "right",
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        "Gross Earnings",
        tableX +
            descriptionWidth +
            standardWidth +
            5,
        currentY + 5,
        {
            width:
                earningWidth - 10,
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        money(grossEarnings),
        tableX +
            descriptionWidth +
            standardWidth +
            earningWidth +
            5,
        currentY + 5,
        {
            width:
                deductionWidth - 10,
            align: "right",
            fontSize: 8,
            bold: true
        }
    );


    currentY +=
        totalRowHeight;


    /* =====================================================
       GROSS DEDUCTIONS + NET PAY
    ===================================================== */

    drawBox(
        doc,
        tableX,
        currentY,
        tableWidth,
        totalRowHeight,
        0.7
    );


    drawText(
        doc,
        "Gross Deductions",
        tableX + 5,
        currentY + 5,
        {
            width:
                descriptionWidth - 10,
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        money(grossDeductions),
        tableX +
            descriptionWidth +
            standardWidth +
            earningWidth +
            5,
        currentY + 5,
        {
            width:
                deductionWidth - 10,
            align: "right",
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        "Net Pay",
        tableX +
            descriptionWidth +
            5,
        currentY + 5,
        {
            width:
                standardWidth - 10,
            fontSize: 8,
            bold: true
        }
    );


    drawText(
        doc,
        money(netPay),
        tableX +
            descriptionWidth +
            5,
        currentY + 5,
        {
            width:
                standardWidth - 10,
            align: "right",
            fontSize: 8,
            bold: true
        }
    );


    currentY +=
        totalRowHeight +
        8;


    /* =====================================================
       NET PAY
    ===================================================== */

    drawText(
        doc,
        `Net Pay: INR ${money(netPay)}`,
        tableX,
        currentY,
        {
            width: tableWidth,
            fontSize: 9,
            bold: true
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
            "*This is a computer generated payslip and doesn't require signature or any company seal.";


        drawCenteredText(
            doc,
            footerText,
            margin,
            PAGE_HEIGHT - 38,
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
        netPay,
        standardSalary
    };

};


module.exports = renderHardeepPdf;

