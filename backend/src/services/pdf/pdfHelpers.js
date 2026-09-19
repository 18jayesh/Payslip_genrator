const https = require("https");
const http = require("http");

/* =========================================================
   BASIC HELPERS
========================================================= */

const money = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const moneyNoDecimal = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });
};

const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
};


/* =========================================================
   MONGOOSE MAP -> NORMAL OBJECT
========================================================= */

const mapToObject = (value) => {
    if (!value) {
        return {};
    }

    if (value instanceof Map) {
        return Object.fromEntries(value.entries());
    }

    if (typeof value.toObject === "function") {
        return value.toObject();
    }

    return value;
};


/* =========================================================
   EMPLOYEE FIELD
========================================================= */

const getEmployeeField = (employee, key, fallback = "") => {
    const fields = mapToObject(employee?.employeeFields);

    const value = fields[key];

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    return value;
};


/* =========================================================
   SALARY VALUE
========================================================= */

const getSalaryValue = (
    employee,
    section,
    key,
    column = null
) => {
    const source =
        section === "earnings"
            ? mapToObject(employee?.earnings)
            : mapToObject(employee?.deductions);

    const value = source[key];

    if (value === undefined || value === null) {
        return 0;
    }

    /*
      Example:

      {
        basicSalary: {
          "Standard Monthly Salary": 25000,
          "INR Earnings": 22000
        }
      }

      OR

      {
        basicSalary: 22000
      }
    */

    if (
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        if (column && value[column] !== undefined) {
            return numberValue(value[column]);
        }

        /*
          If no column specified,
          try common salary columns.
        */

        const possibleColumns = [
            "Amount",
            "Actual",
            "Current Month",
            "INR Earnings",
            "Rs",
            "Standard Monthly Salary",
            "Full"
        ];

        for (const currentColumn of possibleColumns) {
            if (value[currentColumn] !== undefined) {
                return numberValue(value[currentColumn]);
            }
        }

        const firstValue = Object.values(value)[0];

        return numberValue(firstValue);
    }

    return numberValue(value);
};


/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};


/* =========================================================
   MONTH FORMAT
========================================================= */

const formatMonth = (value) => {
    if (!value) {
        return "";
    }

    const stringValue = String(value);

    /*
      If already something like:
      January 2026
      February 2026

      don't modify it.
    */

    if (
        stringValue.match(
            /^[A-Za-z]+\s+\d{4}$/
        )
    ) {
        return stringValue;
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );
    }

    return stringValue;
};


/* =========================================================
   TOTAL SALARY
========================================================= */

const getSalaryTotal = (
    employee,
    section,
    components,
    column = null
) => {
    if (!Array.isArray(components)) {
        return 0;
    }

    return components.reduce(
        (total, component) => {
            return (
                total +
                getSalaryValue(
                    employee,
                    section,
                    component.key,
                    column
                )
            );
        },
        0
    );
};


/* =========================================================
   COMPANY NAME
========================================================= */

const getCompanyName = (company) => {
    return (
        company?.name ||
        company?.companyName ||
        "Company Name"
    );
};


/* =========================================================
   COMPANY ADDRESS
========================================================= */

const getCompanyAddress = (company) => {
    return (
        company?.address ||
        ""
    );
};


/* =========================================================
   COMPANY CONTACT
========================================================= */

const getCompanyContact = (company) => {
    return (
        company?.contactNumber ||
        ""
    );
};


/* =========================================================
   COMPANY EMAIL
========================================================= */

const getCompanyEmail = (company) => {
    return (
        company?.email ||
        ""
    );
};


/* =========================================================
   COMPANY LOGO
========================================================= */

const getLogoBuffer = async (logoUrl) => {
    if (!logoUrl) {
        return null;
    }

    /*
      Cloudinary / HTTP image URL support.
    */

    return new Promise((resolve) => {
        try {
            const client = logoUrl.startsWith("https://")
                ? https
                : http;

            client
                .get(logoUrl, (response) => {
                    if (
                        response.statusCode >= 300 &&
                        response.statusCode < 400 &&
                        response.headers.location
                    ) {
                        getLogoBuffer(
                            response.headers.location
                        )
                            .then(resolve)
                            .catch(() => resolve(null));

                        return;
                    }

                    if (response.statusCode !== 200) {
                        resolve(null);
                        return;
                    }

                    const chunks = [];

                    response.on(
                        "data",
                        (chunk) => {
                            chunks.push(chunk);
                        }
                    );

                    response.on(
                        "end",
                        () => {
                            resolve(
                                Buffer.concat(chunks)
                            );
                        }
                    );

                    response.on(
                        "error",
                        () => resolve(null)
                    );
                })
                .on(
                    "error",
                    () => resolve(null)
                );
        } catch (error) {
            resolve(null);
        }
    });
};


/* =========================================================
   DRAW LINE
========================================================= */

const drawLine = (
    doc,
    x1,
    y1,
    x2,
    y2,
    width = 0.7
) => {
    doc
        .save()
        .lineWidth(width)
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .stroke()
        .restore();
};


/* =========================================================
   DRAW RECTANGLE
========================================================= */

const drawBox = (
    doc,
    x,
    y,
    width,
    height,
    lineWidth = 0.7
) => {
    doc
        .save()
        .lineWidth(lineWidth)
        .rect(
            x,
            y,
            width,
            height
        )
        .stroke()
        .restore();
};


/* =========================================================
   TEXT HELPER
========================================================= */

const drawText = (
    doc,
    text,
    x,
    y,
    options = {}
) => {
    const {
        width,
        align = "left",
        fontSize = 8,
        bold = false,
        lineGap = 0
    } = options;

    doc
        .font(
            bold
                ? "Helvetica-Bold"
                : "Helvetica"
        )
        .fontSize(fontSize);

    const finalText =
        text === undefined ||
        text === null
            ? ""
            : String(text);

    if (width) {
        doc.text(
            finalText,
            x,
            y,
            {
                width,
                align,
                lineGap
            }
        );
    } else {
        doc.text(
            finalText,
            x,
            y
        );
    }
};


/* =========================================================
   CENTER TEXT
========================================================= */

const drawCenteredText = (
    doc,
    text,
    x,
    y,
    width,
    options = {}
) => {
    drawText(
        doc,
        text,
        x,
        y,
        {
            ...options,
            width,
            align: "center"
        }
    );
};


/* =========================================================
   INDIAN NUMBER TO WORDS
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

const twoDigitWords = (number) => {
    if (number < 20) {
        return ones[number];
    }

    const ten = Math.floor(number / 10);
    const remainder = number % 10;

    return (
        tens[ten] +
        (remainder ? ` ${ones[remainder]}` : "")
    );
};

const numberToWordsIndian = (number) => {
    number = Math.floor(
        Math.abs(number)
    );

    if (number === 0) {
        return "Zero";
    }

    let result = "";

    const crore = Math.floor(
        number / 10000000
    );

    number %= 10000000;

    const lakh = Math.floor(
        number / 100000
    );

    number %= 100000;

    const thousand = Math.floor(
        number / 1000
    );

    number %= 1000;

    const hundred = Math.floor(
        number / 100
    );

    number %= 100;

    if (crore) {
        result +=
            `${numberToWordsIndian(crore)} Crore `;
    }

    if (lakh) {
        result +=
            `${numberToWordsIndian(lakh)} Lakh `;
    }

    if (thousand) {
        result +=
            `${numberToWordsIndian(thousand)} Thousand `;
    }

    if (hundred) {
        result +=
            `${ones[hundred]} Hundred `;
    }

    if (number) {
        result +=
            `${twoDigitWords(number)} `;
    }

    return result.trim();
};


const amountInWords = (amount) => {
    const numericAmount =
        numberValue(amount);

    const rupees =
        Math.floor(numericAmount);

    const paise =
        Math.round(
            (numericAmount - rupees) * 100
        );

    let result =
        `Rupees ${numberToWordsIndian(rupees)}`;

    if (paise > 0) {
        result +=
            ` and ${numberToWordsIndian(paise)} Paise`;
    }

    return `${result} Only`;
};


/* =========================================================
   PDF BUFFER
========================================================= */

const pdfToBuffer = (doc) => {
    return new Promise(
        (resolve, reject) => {
            const chunks = [];

            doc.on(
                "data",
                (chunk) => {
                    chunks.push(chunk);
                }
            );

            doc.on(
                "end",
                () => {
                    resolve(
                        Buffer.concat(chunks)
                    );
                }
            );

            doc.on(
                "error",
                reject
            );

            doc.end();
        }
    );
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    money,
    moneyNoDecimal,
    numberValue,
    mapToObject,

    getEmployeeField,
    getSalaryValue,
    getSalaryTotal,

    formatDate,
    formatMonth,

    getCompanyName,
    getCompanyAddress,
    getCompanyContact,
    getCompanyEmail,

    getLogoBuffer,

    drawLine,
    drawBox,
    drawText,
    drawCenteredText,

    numberToWordsIndian,
    amountInWords,

    pdfToBuffer
};