import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import {
    ArrowLeft,
    Download,
    Edit3,
    FileText,
    Loader2,
    Move,
    Printer,
    RotateCcw,
    Save,
    X
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// =====================================================
// HELPERS
// =====================================================

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
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

const getValue = (object, keys = [], fallback = "") => {
    if (!object) {
        return fallback;
    }

    for (const key of keys) {
        const value = object[key];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }
    }

    return fallback;
};

const getSalaryValue = (
    salaryData,
    componentKey,
    column = 0
) => {
    if (!salaryData || !componentKey) {
        return 0;
    }

    /*
     * Backend salary keys and template keys are not always identical.
     * Example:
     *   houseRentAllowance -> hra
     *   performanceBonus   -> bonus
     *   leaveTravelAllowance -> lta
     */
    const aliases = {
        basicSalary: [
            "basicSalary",
            "basic",
            "basicPay"
        ],
        houseRentAllowance: [
            "houseRentAllowance",
            "hra"
        ],
        hra: [
            "hra",
            "houseRentAllowance"
        ],
        otherAllowance: [
            "otherAllowance",
            "otherAllowances",
            "specialAllowance"
        ],
        leaveTravelAllowance: [
            "leaveTravelAllowance",
            "lta"
        ],
        lta: [
            "lta",
            "leaveTravelAllowance"
        ],
        performanceBonus: [
            "performanceBonus",
            "bonus"
        ],
        bonus: [
            "bonus",
            "performanceBonus"
        ],
        providentFund: [
            "providentFund",
            "pf"
        ],
        professionalTax: [
            "professionalTax",
            "pt"
        ],
        incomeTax: [
            "incomeTax",
            "tds"
        ],
        lossOfPay: [
            "lossOfPay",
            "lop",
            "lwop"
        ]
    };

    const possibleKeys =
        aliases[componentKey] || [
            componentKey
        ];

    let component;

    for (const key of possibleKeys) {
        if (
            salaryData[key] !== undefined &&
            salaryData[key] !== null
        ) {
            component = salaryData[key];
            break;
        }
    }

    if (
        component === undefined ||
        component === null
    ) {
        return 0;
    }

    // Normal backend shape: { basicSalary: 50000 }
    if (
        typeof component === "number" ||
        typeof component === "string"
    ) {
        const value = Number(component);
        return Number.isFinite(value) ? value : 0;
    }

    // Array shape: [full, actual, arrear]
    if (Array.isArray(component)) {
        const value = Number(
            component[column]
        );

        if (Number.isFinite(value)) {
            return value;
        }

        return 0;
    }

    // Object shape used by some salary schemas.
    if (
        typeof component === "object"
    ) {
        const preferredKeys =
            column === 2
                ? [
                      "arrear",
                      "arrears",
                      "arrearAmount",
                      "2"
                  ]
                : column === 1
                ? [
                      "actual",
                      "currentMonth",
                      "amount",
                      "value",
                      "monthly",
                      "full",
                      "1"
                  ]
                : [
                      "actual",
                      "currentMonth",
                      "amount",
                      "value",
                      "monthly",
                      "full",
                      "0"
                  ];

        for (const key of preferredKeys) {
            if (
                component[key] !==
                    undefined &&
                component[key] !== null &&
                component[key] !== ""
            ) {
                const value = Number(
                    component[key]
                );

                if (Number.isFinite(value)) {
                    return value;
                }
            }
        }

        // Last fallback for an object with numeric values.
        const numericValues =
            Object.values(component)
                .filter(
                    (item) =>
                        typeof item ===
                            "number" ||
                        (
                            typeof item ===
                                "string" &&
                            item.trim() !== "" &&
                            Number.isFinite(
                                Number(item)
                            )
                        )
                )
                .map((item) =>
                    Number(item)
                );

        if (numericValues.length) {
            return (
                numericValues[
                    Math.min(
                        column,
                        numericValues.length - 1
                    )
                ] || 0
            );
        }
    }

    return 0;
};

const getAmount = (
    salaryData,
    componentKey
) => {
    return getSalaryValue(
        salaryData,
        componentKey,
        1
    );
};

const getTotal = (salaryData) => {
    if (!salaryData) {
        return 0;
    }

    return Object.values(salaryData).reduce(
        (total, value) => {
            if (
                typeof value === "number" ||
                typeof value === "string"
            ) {
                return (
                    total +
                    (Number(value) || 0)
                );
            }

            if (
                value &&
                typeof value === "object"
            ) {
                const numbers =
                    Object.values(value)
                        .filter(
                            (item) =>
                                typeof item ===
                                    "number" ||
                                (
                                    typeof item ===
                                        "string" &&
                                    item.trim() !== ""
                                )
                        )
                        .map(
                            (item) =>
                                Number(item) || 0
                        );

                if (numbers.length > 0) {
                    return (
                        total +
                        numbers[numbers.length - 1]
                    );
                }
            }

            return total;
        },
        0
    );
};

const getTemplateTotal = (
    salaryData,
    rows = [],
    column = 1
) => {
    if (!salaryData || !rows.length) {
        return getTotal(salaryData);
    }

    return rows.reduce(
        (total, row) => {
            const key =
                typeof row === "string"
                    ? row
                    : row?.key;

            if (!key) {
                return total;
            }

            return (
                total +
                getSalaryValue(
                    salaryData,
                    key,
                    column
                )
            );
        },
        0
    );
};

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-GB");
};

const getTemplateKey = (template) => {
    const key =
        template?.templateKey ||
        template?.renderer ||
        "";

    const normalized =
        String(key)
            .toLowerCase()
            .replace(/[\s_-]/g, "");

    if (normalized === "hardeep") {
        return "hardeep";
    }

    if (normalized === "surjeet") {
        return "surjeet";
    }

    if (normalized === "pankaj") {
        return "pankaj";
    }

    if (normalized === "amitesh") {
        return "amitesh";
    }

    if (
        normalized === "format1" ||
        normalized === "format01" ||
        normalized === "format"
    ) {
        return "format1";
    }

    return normalized;
};

const safeText = (value) => {
    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value);
};

const getEmployeeField = (
    employee,
    key,
    fallback = ""
) => {
    const fields =
        employee?.employeeFields || {};

    const aliases = {
        employeeName: [
            "employeeName",
            "fullName",
            "name"
        ],

        fullName: [
            "fullName",
            "employeeName",
            "name"
        ],

        employeeCode: [
            "employeeCode",
            "employeeId"
        ],

        employeeNumber: [
            "employeeNumber",
            "employeeCode",
            "employeeId"
        ],

        designation: [
            "designation"
        ],

        department: [
            "department"
        ],

        joiningDate: [
            "joiningDate",
            "doj"
        ],

        doj: [
            "doj",
            "joiningDate"
        ],

        bankAccountNumber: [
            "bankAccountNumber",
            "bankAccount",
            "accountNumber"
        ],

        accountNumber: [
            "accountNumber",
            "bankAccountNumber",
            "bankAccount"
        ],

        bankName: [
            "bankName"
        ],

        ifsc: [
            "ifsc",
            "ifscCode"
        ],

        panNumber: [
            "panNumber",
            "pan"
        ],

        pan: [
            "pan",
            "panNumber"
        ],

        pfNumber: [
            "pfNumber",
            "pfPensionNumber"
        ],

        uanNumber: [
            "uanNumber",
            "uan"
        ],

        esicNumber: [
            "esicNumber",
            "esic"
        ],

        location: [
            "location"
        ],

        grade: [
            "grade"
        ],

        standardDays: [
            "standardDays"
        ],

        daysWorked: [
            "daysWorked"
        ],

        lwopDays: [
            "lwopDays",
            "lossOfPay"
        ],

        salaryMonth: [
            "salaryMonth",
            "month"
        ],

        gender: [
            "gender"
        ],

        vertical: [
            "vertical"
        ],

        oldSalaryCode: [
            "oldSalaryCode",
            "salaryCode"
        ],

        dealingOffice: [
            "dealingOffice"
        ],

        pfms: [
            "pfms"
        ]
    };

    const keys =
        aliases[key] || [key];

    return getValue(
        fields,
        keys,
        fallback
    );
};

// =====================================================
// EDITABLE VALUE
// =====================================================

const EditableValue = ({
    value,
    onChange,
    editing,
    className = ""
}) => {
    if (!editing) {
        return (
            <span className={className}>
                {safeText(value)}
            </span>
        );
    }

    return (
        <input
            value={safeText(value)}
            onChange={(event) =>
                onChange(event.target.value)
            }
            className={`bg-blue-50 border border-blue-300 rounded px-1 outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
        />
    );
};

const EditableMoney = ({
    value,
    onChange,
    editing,
    className = ""
}) => {
    if (!editing) {
        return (
            <span className={className}>
                {money(value)}
            </span>
        );
    }

    return (
        <input
            type="number"
            value={
                value === undefined ||
                value === null
                    ? ""
                    : value
            }
            onChange={(event) =>
                onChange(
                    event.target.value
                )
            }
            className={`w-full bg-blue-50 border border-blue-300 rounded px-1 text-right outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
        />
    );
};

// =====================================================
// TABLE CELLS
// =====================================================

const Cell = ({
    children,
    className = ""
}) => {
    return (
        <td
            className={`border border-slate-800 px-2 py-1.5 ${className}`}
        >
            {children}
        </td>
    );
};

const HeaderCell = ({
    children,
    className = ""
}) => {
    return (
        <th
            className={`border border-slate-800 px-2 py-1.5 ${className}`}
        >
            {children}
        </th>
    );
};

// =====================================================
// DRAGGABLE LOGO
// =====================================================

const DraggableLogo = ({
    src,
    position,
    setPosition,
    editing
}) => {
    const [dragging, setDragging] =
        useState(false);

    const [startPoint, setStartPoint] =
        useState({
            x: 0,
            y: 0,
            left: 0,
            top: 0
        });

    useEffect(() => {
        const handleMouseMove = (
            event
        ) => {
            if (!dragging) {
                return;
            }

            const deltaX =
                event.clientX -
                startPoint.x;

            const deltaY =
                event.clientY -
                startPoint.y;

            setPosition({
                left:
                    startPoint.left +
                    deltaX,
                top:
                    startPoint.top +
                    deltaY
            });
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        document.addEventListener(
            "mousemove",
            handleMouseMove
        );

        document.addEventListener(
            "mouseup",
            handleMouseUp
        );

        return () => {
            document.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            document.removeEventListener(
                "mouseup",
                handleMouseUp
            );
        };
    }, [
        dragging,
        startPoint,
        setPosition
    ]);

    if (!src) {
        return null;
    }

    return (
        <div
            className={`absolute z-20 select-none ${
                editing
                    ? "cursor-move ring-2 ring-blue-400 ring-offset-2"
                    : ""
            }`}
            style={{
                left: position.left,
                top: position.top,
                width: 70,
                height: 70
            }}
            onMouseDown={(event) => {
                if (!editing) {
                    return;
                }

                event.preventDefault();

                setDragging(true);

                setStartPoint({
                    x: event.clientX,
                    y: event.clientY,
                    left: position.left,
                    top: position.top
                });
            }}
        >
            <img
                src={src}
                alt="Company Logo"
                className="w-full h-full object-contain pointer-events-none"
            />

            {editing && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                    Drag Logo
                </div>
            )}
        </div>
    );
};

// =====================================================
// HARDEEP TEMPLATE
// =====================================================

const HardeepTemplate = ({
    employee,
    company,
    template,
    editing,
    updateField,
    updateSalary,
    logoPosition,
    setLogoPosition
}) => {
    const fields =
        employee?.employeeFields || {};

    const earnings =
        employee?.earnings || {};

    const deductions =
        employee?.deductions || {};

    const earningRows =
        template?.salaryComponentSchema ||
        template?.earnings ||
        [];

    const deductionRows =
        template?.deductionComponentSchema ||
        template?.deductions ||
        [];

    const defaultEarnings = [
        {
            key: "basicSalary",
            label: "Basic Salary"
        },
        {
            key: "houseRentAllowance",
            label: "House Rent Allowance"
        },
        {
            key: "otherAllowance",
            label: "Other Allowance"
        },
        {
            key: "leaveTravelAllowance",
            label: "Leave Travel Allowance"
        },
        {
            key: "performanceBonus",
            label: "Performance Bonus"
        }
    ];

    const defaultDeductions = [
        {
            key: "providentFund",
            label: "Provident Fund"
        },
        {
            key: "professionalTax",
            label: "Professional Tax"
        },
        {
            key: "incomeTax",
            label: "Income Tax"
        }
    ];

    const earningsList =
        Array.isArray(earningRows) &&
        earningRows.length
            ? earningRows
            : defaultEarnings;

    const deductionsList =
        Array.isArray(deductionRows) &&
        deductionRows.length
            ? deductionRows
            : defaultDeductions;

    const gross =
        getTemplateTotal(
            earnings,
            earningsList,
            1
        );

    const totalDeductions =
        getTemplateTotal(
            deductions,
            deductionsList,
            0
        );

    const net =
        gross - totalDeductions;

    const month =
        getEmployeeField(
            employee,
            "salaryMonth",
            ""
        );

    return (
        <div
            className="payslip-landscape relative bg-white text-slate-900 shadow-xl border border-slate-300 overflow-hidden"
            style={{
                width: "1120px",
                minHeight: "795px",
                fontFamily:
                    "Arial, sans-serif"
            }}
        >
            <DraggableLogo
                src={company?.logoUrl}
                position={logoPosition}
                setPosition={
                    setLogoPosition
                }
                editing={editing}
            />

            <div className="p-8">

                <div className="text-center border-b-2 border-slate-900 pb-3">
                    <h1 className="text-2xl font-bold uppercase">
                        Payslip for the Month of{" "}
                        <EditableValue
                            value={month}
                            editing={editing}
                            onChange={(value) =>
                                updateField(
                                    "salaryMonth",
                                    value
                                )
                            }
                        />
                    </h1>

                    <p className="text-sm mt-1">
                        Pay Period:{" "}
                        {month}
                    </p>
                </div>

                <div className="mt-4 flex justify-between">
                    <div>
                        <h2 className="font-bold text-lg">
                            {
                                company?.name
                            }
                        </h2>

                        <p className="text-sm whitespace-pre-line">
                            {
                                company?.address
                            }
                        </p>

                        <p className="text-sm mt-1">
                            GSTIN:{" "}
                            {
                                company?.gstin ||
                                "-"
                            }
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold">
                            Employee
                        </p>

                        <p className="text-lg font-bold">
                            <EditableValue
                                value={getEmployeeField(
                                    employee,
                                    "fullName"
                                )}
                                editing={
                                    editing
                                }
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        "fullName",
                                        value
                                    )
                                }
                            />
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-4 border border-slate-800 mt-5 text-sm">
                    {[
                        [
                            "Employee Code",
                            getEmployeeField(
                                employee,
                                "employeeCode"
                            )
                        ],
                        [
                            "Designation",
                            getEmployeeField(
                                employee,
                                "designation"
                            )
                        ],
                        [
                            "Department",
                            getEmployeeField(
                                employee,
                                "department"
                            )
                        ],
                        [
                            "PAN",
                            getEmployeeField(
                                employee,
                                "panNumber"
                            )
                        ],
                        [
                            "Joining Date",
                            formatDate(
                                getEmployeeField(
                                    employee,
                                    "joiningDate"
                                )
                            )
                        ],
                        [
                            "PF Number",
                            getEmployeeField(
                                employee,
                                "pfNumber"
                            )
                        ],
                        [
                            "UAN",
                            getEmployeeField(
                                employee,
                                "uanNumber"
                            )
                        ],
                        [
                            "Bank Account",
                            getEmployeeField(
                                employee,
                                "bankAccountNumber"
                            )
                        ]
                    ].map(
                        (
                            [label, value],
                            index
                        ) => (
                            <div
                                key={index}
                                className="border-r border-b border-slate-800 p-2"
                            >
                                <div className="font-semibold">
                                    {label}
                                </div>

                                <EditableValue
                                    value={value}
                                    editing={
                                        editing
                                    }
                                    onChange={(
                                        newValue
                                    ) =>
                                        updateField(
                                            label
                                                .toLowerCase()
                                                .replace(
                                                    /\s/g,
                                                    ""
                                                ),
                                            newValue
                                        )
                                    }
                                />
                            </div>
                        )
                    )}
                </div>

                <table className="w-full border-collapse mt-5 text-sm">
                    <thead>
                        <tr className="font-bold text-center">
                            <HeaderCell className="w-[35%]">
                                Standard Monthly Salary
                            </HeaderCell>

                            <HeaderCell>
                                INR
                            </HeaderCell>

                            <HeaderCell className="w-[35%]">
                                Earnings
                            </HeaderCell>

                            <HeaderCell>
                                INR
                            </HeaderCell>

                            <HeaderCell className="w-[35%]">
                                Deductions
                            </HeaderCell>

                            <HeaderCell>
                                INR
                            </HeaderCell>
                        </tr>
                    </thead>

                    <tbody>
                        {earningsList.map(
                            (row, index) => {
                                const key =
                                    typeof row ===
                                    "string"
                                        ? row
                                        : row?.key;

                                const label =
                                    typeof row ===
                                    "string"
                                        ? row
                                        : row?.label ||
                                          key;

                                const amount =
                                    getSalaryValue(
                                        earnings,
                                        key,
                                        1
                                    );

                                const deduction =
                                    deductionsList[
                                        index
                                    ];

                                const deductionKey =
                                    typeof deduction ===
                                    "string"
                                        ? deduction
                                        : deduction?.key;

                                const deductionLabel =
                                    typeof deduction ===
                                    "string"
                                        ? deduction
                                        : deduction?.label ||
                                          deductionKey;

                                const deductionAmount =
                                    getSalaryValue(
                                        deductions,
                                        deductionKey,
                                        0
                                    );

                                return (
                                    <tr
                                        key={index}
                                    >
                                        <Cell>
                                            {label}
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    amount
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "earnings",
                                                        key,
                                                        1,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>

                                        <Cell>
                                            {label}
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    amount
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "earnings",
                                                        key,
                                                        1,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>

                                        <Cell>
                                            {
                                                deductionLabel
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    deductionAmount
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "deductions",
                                                        deductionKey,
                                                        0,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>
                                    </tr>
                                );
                            }
                        )}

                        <tr className="font-bold">
                            <Cell colSpan={3}>
                                Gross Earnings
                            </Cell>

                            <Cell className="text-right">
                                {money(gross)}
                            </Cell>

                            <Cell>
                                Total Deductions
                            </Cell>

                            <Cell className="text-right">
                                {money(
                                    totalDeductions
                                )}
                            </Cell>
                        </tr>

                        <tr className="font-bold text-lg">
                            <Cell colSpan={4}>
                                Net Pay
                            </Cell>

                            <Cell
                                colSpan={2}
                                className="text-right"
                            >
                                ₹ {money(net)}
                            </Cell>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-5 text-sm">
                    <p>
                        Net Pay in words:
                        <strong className="ml-2">
                            Rupees{" "}
                            {moneyNoDecimal(
                                net
                            )}{" "}
                            only
                        </strong>
                    </p>
                </div>

                <div className="mt-8 text-xs text-slate-600 text-center">
                    ** This is a computer generated
                    payslip and does not require
                    signature and stamp.
                </div>
            </div>
        </div>
    );
};

// =====================================================
// SURJEET TEMPLATE
// =====================================================

const SurjeetTemplate = ({
    employee,
    company,
    template,
    editing,
    updateField,
    updateSalary,
    logoPosition,
    setLogoPosition
}) => {
    const earnings =
        employee?.earnings || {};

    const deductions =
        employee?.deductions || {};

    const earningRows = [
        {
            key: "basicSalary",
            label: "Basic Salary"
        },
        {
            key: "houseRentAllowance",
            label: "House Rent Allowance"
        },
        {
            key: "otherAllowance",
            label: "Other Allowance"
        },
        {
            key: "leaveTravelAllowance",
            label: "Leave Travel Allowance"
        },
        {
            key: "performanceBonus",
            label: "Performance Bonus"
        }
    ];

    const deductionRows = [
        {
            key: "providentFund",
            label: "Provident Fund"
        },
        {
            key: "professionalTax",
            label: "Professional Tax"
        },
        {
            key: "incomeTax",
            label: "Income Tax"
        }
    ];

    const gross =
        getTemplateTotal(
            earnings,
            earningRows,
            1
        );

    const totalDeductions =
        getTemplateTotal(
            deductions,
            deductionRows,
            0
        );

    const net =
        gross - totalDeductions;

    return (
        <div
            className="payslip-portrait relative bg-white text-black shadow-xl border border-slate-300"
            style={{
                width: "790px",
                minHeight: "1117px",
                fontFamily:
                    "Arial, sans-serif"
            }}
        >
            <DraggableLogo
                src={company?.logoUrl}
                position={logoPosition}
                setPosition={
                    setLogoPosition
                }
                editing={editing}
            />

            <div className="p-8">

                <div className="text-center">
                    <h1 className="text-2xl font-bold">
                        SUSHMA BUILDTECH
                    </h1>

                    <p className="text-xs mt-1">
                        {company?.address ||
                            ""}
                    </p>

                    <div className="border-t border-b border-black mt-3 py-2">
                        <h2 className="font-bold text-lg">
                            SALARY SLIP
                        </h2>

                        <p className="text-sm">
                            Salary Month:{" "}
                            <EditableValue
                                value={getEmployeeField(
                                    employee,
                                    "salaryMonth"
                                )}
                                editing={
                                    editing
                                }
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        "salaryMonth",
                                        value
                                    )
                                }
                            />
                        </p>
                    </div>
                </div>

                <table className="w-full border-collapse mt-5 text-sm">
                    <tbody>
                        {[
                            [
                                "Employee Code",
                                getEmployeeField(
                                    employee,
                                    "employeeCode"
                                ),
                                "UAN Number",
                                getEmployeeField(
                                    employee,
                                    "uanNumber"
                                )
                            ],
                            [
                                "Employee Name",
                                getEmployeeField(
                                    employee,
                                    "fullName"
                                ),
                                "PF Number",
                                getEmployeeField(
                                    employee,
                                    "pfNumber"
                                )
                            ],
                            [
                                "Joining Date",
                                formatDate(
                                    getEmployeeField(
                                        employee,
                                        "joiningDate"
                                    )
                                ),
                                "ESIC Number",
                                getEmployeeField(
                                    employee,
                                    "esicNumber"
                                )
                            ],
                            [
                                "Designation",
                                getEmployeeField(
                                    employee,
                                    "designation"
                                ),
                                "Bank Account",
                                getEmployeeField(
                                    employee,
                                    "bankAccountNumber"
                                )
                            ],
                            [
                                "Department",
                                getEmployeeField(
                                    employee,
                                    "department"
                                ),
                                "IFSC",
                                getEmployeeField(
                                    employee,
                                    "ifsc"
                                )
                            ],
                            [
                                "Grade",
                                getEmployeeField(
                                    employee,
                                    "grade"
                                ),
                                "Standard Days",
                                getEmployeeField(
                                    employee,
                                    "standardDays"
                                )
                            ],
                            [
                                "Location",
                                getEmployeeField(
                                    employee,
                                    "location"
                                ),
                                "Days Worked",
                                getEmployeeField(
                                    employee,
                                    "daysWorked"
                                )
                            ]
                        ].map(
                            (
                                row,
                                index
                            ) => (
                                <tr
                                    key={index}
                                >
                                    <Cell className="font-semibold w-[18%]">
                                        {
                                            row[0]
                                        }
                                    </Cell>

                                    <Cell className="w-[32%]">
                                        {row[1]}
                                    </Cell>

                                    <Cell className="font-semibold w-[18%]">
                                        {
                                            row[2]
                                        }
                                    </Cell>

                                    <Cell className="w-[32%]">
                                        {row[3]}
                                    </Cell>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                <table className="w-full border-collapse mt-5 text-sm">
                    <thead>
                        <tr className="font-bold text-center">
                            <HeaderCell>
                                Earnings
                            </HeaderCell>

                            <HeaderCell>
                                Standard Rate
                            </HeaderCell>

                            <HeaderCell>
                                Amount
                            </HeaderCell>

                            <HeaderCell>
                                Deductions
                            </HeaderCell>

                            <HeaderCell>
                                Amount
                            </HeaderCell>
                        </tr>
                    </thead>

                    <tbody>
                        {earningRows.map(
                            (
                                row,
                                index
                            ) => {
                                const amount =
                                    getSalaryValue(
                                        earnings,
                                        row.key,
                                        1
                                    );

                                const deduction =
                                    deductionRows[
                                        index
                                    ];

                                const deductionAmount =
                                    deduction
                                        ? getSalaryValue(
                                              deductions,
                                              deduction.key,
                                              0
                                          )
                                        : 0;

                                return (
                                    <tr
                                        key={index}
                                    >
                                        <Cell>
                                            {
                                                row.label
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    amount
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "earnings",
                                                        row.key,
                                                        1,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>

                                        <Cell className="text-right">
                                            {money(
                                                amount
                                            )}
                                        </Cell>

                                        <Cell>
                                            {
                                                deduction?.label ||
                                                ""
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            {deduction ? (
                                                <EditableMoney
                                                    value={
                                                        deductionAmount
                                                    }
                                                    editing={
                                                        editing
                                                    }
                                                    onChange={(
                                                        value
                                                    ) =>
                                                        updateSalary(
                                                            "deductions",
                                                            deduction.key,
                                                            0,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </Cell>
                                    </tr>
                                );
                            }
                        )}

                        <tr className="font-bold">
                            <Cell>
                                Total Earnings
                            </Cell>

                            <Cell />

                            <Cell className="text-right">
                                {money(gross)}
                            </Cell>

                            <Cell>
                                Total Deductions
                            </Cell>

                            <Cell className="text-right">
                                {money(
                                    totalDeductions
                                )}
                            </Cell>
                        </tr>

                        <tr className="font-bold">
                            <Cell colSpan={4}>
                                NET PAY
                            </Cell>

                            <Cell className="text-right">
                                ₹ {money(net)}
                            </Cell>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-5 border border-black p-3">
                    <p className="text-sm font-semibold">
                        Net Pay in Words
                    </p>

                    <p className="text-sm mt-1">
                        Rupees{" "}
                        {moneyNoDecimal(net)}{" "}
                        only
                    </p>
                </div>

                <div className="mt-8 text-center text-xs">
                    {
                        template?.layout
                            ?.footerText
                    }
                </div>
            </div>
        </div>
    );
};

// =====================================================
// PANKAJ TEMPLATE
// =====================================================

const PankajTemplate = ({
    employee,
    company,
    editing,
    updateField,
    updateSalary,
    logoPosition,
    setLogoPosition
}) => {
    const earnings =
        employee?.earnings || {};

    const deductions =
        employee?.deductions || {};

    const earningRows = [
        {
            key: "basicSalary",
            label: "Basic Salary"
        },
        {
            key: "houseRentAllowance",
            label: "HRA"
        },
        {
            key: "otherAllowance",
            label: "Other Allowance"
        },
        {
            key: "leaveTravelAllowance",
            label: "LTA"
        },
        {
            key: "performanceBonus",
            label: "Bonus"
        }
    ];

    const deductionRows = [
        {
            key: "providentFund",
            label: "Provident Fund"
        },
        {
            key: "professionalTax",
            label: "Professional Tax"
        },
        {
            key: "incomeTax",
            label: "Income Tax"
        }
    ];

    const gross =
        getTemplateTotal(
            earnings,
            earningRows,
            1
        );

    const totalDeductions =
        getTemplateTotal(
            deductions,
            deductionRows,
            0
        );

    const net =
        gross - totalDeductions;

    return (
        <div
            className="payslip-landscape relative bg-white text-black shadow-xl border border-slate-300"
            style={{
                width: "1120px",
                minHeight: "795px",
                fontFamily:
                    "Arial, sans-serif"
            }}
        >
            <DraggableLogo
                src={company?.logoUrl}
                position={logoPosition}
                setPosition={
                    setLogoPosition
                }
                editing={editing}
            />

            <div className="p-8">

                <div className="text-center border-b-2 border-black pb-3">
                    <h1 className="text-2xl font-bold uppercase">
                        {company?.name}
                    </h1>

                    <p className="text-xs mt-1 whitespace-pre-line">
                        {company?.address}
                    </p>

                    <h2 className="font-bold mt-3">
                        SALARY SLIP
                    </h2>

                    <p className="text-sm">
                        Month:{" "}
                        {
                            getEmployeeField(
                                employee,
                                "salaryMonth"
                            )
                        }
                    </p>
                </div>

                <table className="w-full border-collapse mt-5 text-sm">
                    <tbody>
                        {[
                            [
                                "Name",
                                getEmployeeField(
                                    employee,
                                    "fullName"
                                ),
                                "Employee No",
                                getEmployeeField(
                                    employee,
                                    "employeeCode"
                                )
                            ],
                            [
                                "Joining Date",
                                formatDate(
                                    getEmployeeField(
                                        employee,
                                        "joiningDate"
                                    )
                                ),
                                "Bank Name",
                                getEmployeeField(
                                    employee,
                                    "bankName"
                                )
                            ],
                            [
                                "Designation",
                                getEmployeeField(
                                    employee,
                                    "designation"
                                ),
                                "Bank Account No",
                                getEmployeeField(
                                    employee,
                                    "bankAccountNumber"
                                )
                            ],
                            [
                                "Department",
                                getEmployeeField(
                                    employee,
                                    "department"
                                ),
                                "PAN Number",
                                getEmployeeField(
                                    employee,
                                    "panNumber"
                                )
                            ],
                            [
                                "Location",
                                getEmployeeField(
                                    employee,
                                    "location"
                                ),
                                "PF Number",
                                getEmployeeField(
                                    employee,
                                    "pfNumber"
                                )
                            ],
                            [
                                "Effective Work Days",
                                getEmployeeField(
                                    employee,
                                    "daysWorked"
                                ),
                                "PF UAN",
                                getEmployeeField(
                                    employee,
                                    "uanNumber"
                                )
                            ],
                            [
                                "LOP",
                                getEmployeeField(
                                    employee,
                                    "lwopDays",
                                    0
                                ),
                                "",
                                ""
                            ]
                        ].map(
                            (
                                row,
                                index
                            ) => (
                                <tr
                                    key={index}
                                >
                                    <Cell className="font-semibold">
                                        {
                                            row[0]
                                        }
                                    </Cell>

                                    <Cell>
                                        {row[1]}
                                    </Cell>

                                    <Cell className="font-semibold">
                                        {
                                            row[2]
                                        }
                                    </Cell>

                                    <Cell>
                                        {row[3]}
                                    </Cell>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                <table className="w-full border-collapse mt-5 text-sm">
                    <thead>
                        <tr className="font-bold text-center">
                            <HeaderCell>
                                Earnings
                            </HeaderCell>

                            <HeaderCell>
                                Full
                            </HeaderCell>

                            <HeaderCell>
                                Actual
                            </HeaderCell>

                            <HeaderCell>
                                Deductions
                            </HeaderCell>

                            <HeaderCell>
                                Actual
                            </HeaderCell>
                        </tr>
                    </thead>

                    <tbody>
                        {earningRows.map(
                            (
                                row,
                                index
                            ) => {
                                const amount =
                                    getSalaryValue(
                                        earnings,
                                        row.key,
                                        1
                                    );

                                const deduction =
                                    deductionRows[
                                        index
                                    ];

                                const deductionAmount =
                                    deduction
                                        ? getSalaryValue(
                                              deductions,
                                              deduction.key,
                                              0
                                          )
                                        : 0;

                                return (
                                    <tr
                                        key={index}
                                    >
                                        <Cell>
                                            {
                                                row.label
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            {money(
                                                amount
                                            )}
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    amount
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "earnings",
                                                        row.key,
                                                        1,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>

                                        <Cell>
                                            {
                                                deduction?.label ||
                                                ""
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            {deduction ? (
                                                <EditableMoney
                                                    value={
                                                        deductionAmount
                                                    }
                                                    editing={
                                                        editing
                                                    }
                                                    onChange={(
                                                        value
                                                    ) =>
                                                        updateSalary(
                                                            "deductions",
                                                            deduction.key,
                                                            0,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </Cell>
                                    </tr>
                                );
                            }
                        )}

                        <tr className="font-bold">
                            <Cell>
                                Gross Earnings
                            </Cell>

                            <Cell />

                            <Cell className="text-right">
                                {money(gross)}
                            </Cell>

                            <Cell>
                                Total Deductions
                            </Cell>

                            <Cell className="text-right">
                                {money(
                                    totalDeductions
                                )}
                            </Cell>
                        </tr>

                        <tr className="font-bold text-lg">
                            <Cell colSpan={4}>
                                NET PAY
                            </Cell>

                            <Cell className="text-right">
                                ₹ {money(net)}
                            </Cell>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-5 text-sm">
                    Net Pay in Words:
                    <strong className="ml-2">
                        Rupees{" "}
                        {moneyNoDecimal(net)}{" "}
                        only
                    </strong>
                </div>

                <div className="mt-8 text-center text-xs">
                    This is a computer generated
                    payslip.
                </div>
            </div>
        </div>
    );
};

// =====================================================
// AMITESH TEMPLATE
// =====================================================

const AmiteshTemplate = ({
    employee,
    company,
    editing,
    updateSalary,
    logoPosition,
    setLogoPosition
}) => {
    const earnings =
        employee?.earnings || {};

    const deductions =
        employee?.deductions || {};

    const earningRows = [
        {
            key: "basicSalary",
            label: "Basic Salary"
        },
        {
            key: "houseRentAllowance",
            label: "House Rent Allowance"
        },
        {
            key: "otherAllowance",
            label: "Other Allowance"
        },
        {
            key: "leaveTravelAllowance",
            label: "Leave Travel Allowance"
        },
        {
            key: "performanceBonus",
            label: "Performance Bonus"
        }
    ];

    const deductionRows = [
        {
            key: "providentFund",
            label: "Provident Fund"
        },
        {
            key: "professionalTax",
            label: "Professional Tax"
        },
        {
            key: "incomeTax",
            label: "Income Tax"
        }
    ];

    const gross =
        getTemplateTotal(
            earnings,
            earningRows,
            1
        );

    const totalDeductions =
        getTemplateTotal(
            deductions,
            deductionRows,
            0
        );

    const net =
        gross - totalDeductions;

    return (
        <div
            className="payslip-portrait relative bg-white text-black shadow-xl border border-slate-300"
            style={{
                width: "790px",
                minHeight: "1117px",
                fontFamily:
                    "Arial, sans-serif"
            }}
        >
            <DraggableLogo
                src={company?.logoUrl}
                position={logoPosition}
                setPosition={
                    setLogoPosition
                }
                editing={editing}
            />

            <div className="p-8">

                <div className="text-center border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-bold">
                        AIIMS
                    </h1>

                    <p className="font-semibold mt-1">
                        All India Institute of
                        Medical Sciences
                    </p>

                    <p className="text-xs mt-1">
                        SALARY SLIP
                    </p>

                    <p className="text-xs mt-2">
                        Report Date:{" "}
                        {new Date().toLocaleDateString(
                            "en-GB"
                        )}
                    </p>
                </div>

                <table className="w-full border-collapse mt-5 text-sm">
                    <tbody>
                        {[
                            [
                                "Employee Code",
                                getEmployeeField(
                                    employee,
                                    "employeeCode"
                                ),
                                "Employee Name",
                                getEmployeeField(
                                    employee,
                                    "fullName"
                                )
                            ],
                            [
                                "Current Designation",
                                getEmployeeField(
                                    employee,
                                    "designation"
                                ),
                                "Department",
                                getEmployeeField(
                                    employee,
                                    "department"
                                )
                            ],
                            [
                                "Dealing Office",
                                getEmployeeField(
                                    employee,
                                    "dealingOffice"
                                ),
                                "PAN",
                                getEmployeeField(
                                    employee,
                                    "panNumber"
                                )
                            ],
                            [
                                "Pay Details",
                                getEmployeeField(
                                    employee,
                                    "salaryMonth"
                                ),
                                "Old Salary Code",
                                getEmployeeField(
                                    employee,
                                    "oldSalaryCode"
                                )
                            ],
                            [
                                "Bank Account",
                                getEmployeeField(
                                    employee,
                                    "bankAccountNumber"
                                ),
                                "PFMS",
                                getEmployeeField(
                                    employee,
                                    "pfms"
                                )
                            ],
                            [
                                "Bank Name",
                                getEmployeeField(
                                    employee,
                                    "bankName"
                                ),
                                "IFSC",
                                getEmployeeField(
                                    employee,
                                    "ifsc"
                                )
                            ]
                        ].map(
                            (
                                row,
                                index
                            ) => (
                                <tr
                                    key={index}
                                >
                                    <Cell className="font-semibold w-[20%]">
                                        {
                                            row[0]
                                        }
                                    </Cell>

                                    <Cell className="w-[30%]">
                                        {row[1]}
                                    </Cell>

                                    <Cell className="font-semibold w-[20%]">
                                        {
                                            row[2]
                                        }
                                    </Cell>

                                    <Cell className="w-[30%]">
                                        {row[3]}
                                    </Cell>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                <table className="w-full border-collapse mt-5 text-sm">
                    <thead>
                        <tr className="font-bold">
                            <HeaderCell>
                                Salary Details
                            </HeaderCell>

                            <HeaderCell className="text-right">
                                Rs.
                            </HeaderCell>

                            <HeaderCell>
                                Deductions /
                                Recoveries
                            </HeaderCell>

                            <HeaderCell className="text-right">
                                Rs.
                            </HeaderCell>
                        </tr>
                    </thead>

                    <tbody>
                        {earningRows.map(
                            (
                                row,
                                index
                            ) => {
                                const amount =
                                    getSalaryValue(
                                        earnings,
                                        row.key,
                                        1
                                    );

                                const deduction =
                                    deductionRows[
                                        index
                                    ];

                                const deductionAmount =
                                    deduction
                                        ? getSalaryValue(
                                              deductions,
                                              deduction.key,
                                              0
                                          )
                                        : 0;

                                return (
                                    <tr
                                        key={index}
                                    >
                                        <Cell>
                                            {
                                                row.label
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    amount
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "earnings",
                                                        row.key,
                                                        1,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>

                                        <Cell>
                                            {
                                                deduction?.label ||
                                                ""
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            {deduction ? (
                                                <EditableMoney
                                                    value={
                                                        deductionAmount
                                                    }
                                                    editing={
                                                        editing
                                                    }
                                                    onChange={(
                                                        value
                                                    ) =>
                                                        updateSalary(
                                                            "deductions",
                                                            deduction.key,
                                                            0,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </Cell>
                                    </tr>
                                );
                            }
                        )}

                        <tr className="font-bold">
                            <Cell>
                                Gross Salary
                            </Cell>

                            <Cell className="text-right">
                                {money(gross)}
                            </Cell>

                            <Cell>
                                Total Deductions
                            </Cell>

                            <Cell className="text-right">
                                {money(
                                    totalDeductions
                                )}
                            </Cell>
                        </tr>

                        <tr className="font-bold text-lg">
                            <Cell>
                                Net Pay
                            </Cell>

                            <Cell className="text-right">
                                ₹ {money(net)}
                            </Cell>

                            <Cell>
                                Payable
                            </Cell>

                            <Cell className="text-right">
                                ₹ {money(net)}
                            </Cell>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-6 border border-black p-3">
                    <p className="font-semibold">
                        Net Pay in Words
                    </p>

                    <p className="mt-1 text-sm">
                        Rupees{" "}
                        {moneyNoDecimal(net)}{" "}
                        only
                    </p>
                </div>

                <div className="mt-10 text-right text-xs">
                    Authorized Signatory
                </div>
            </div>
        </div>
    );
};

// =====================================================
// FORMAT 1 TEMPLATE
// =====================================================

const Format1Template = ({
    employee,
    company,
    editing,
    updateField,
    updateSalary,
    logoPosition,
    setLogoPosition
}) => {
    const earnings =
        employee?.earnings || {};

    const deductions =
        employee?.deductions || {};

    const earningRows = [
        {
            key: "basicSalary",
            label: "Basic"
        },
        {
            key: "houseRentAllowance",
            label: "House Rent Allowance"
        },
        {
            key: "otherAllowance",
            label: "Other Allowance"
        },
        {
            key: "leaveTravelAllowance",
            label: "LTA"
        },
        {
            key: "performanceBonus",
            label: "Bonus"
        }
    ];

    const deductionRows = [
        {
            key: "providentFund",
            label: "PF"
        },
        {
            key: "professionalTax",
            label: "Professional Tax"
        },
        {
            key: "incomeTax",
            label: "Income Tax"
        }
    ];

    const currentEarnings =
        getTemplateTotal(
            earnings,
            earningRows,
            1
        );

    const arrearEarnings =
        getTemplateTotal(
            earnings,
            earningRows,
            2
        );

    const totalDeductions =
        getTemplateTotal(
            deductions,
            deductionRows,
            0
        );

    const gross =
        currentEarnings +
        arrearEarnings;

    const net =
        gross - totalDeductions;

    return (
        <div
            className="payslip-landscape relative bg-white text-black shadow-xl border border-slate-300"
            style={{
                width: "1120px",
                minHeight: "795px",
                fontFamily:
                    "Courier New, monospace"
            }}
        >
            <DraggableLogo
                src={company?.logoUrl}
                position={logoPosition}
                setPosition={
                    setLogoPosition
                }
                editing={editing}
            />

            <div className="p-8">

                <div className="text-center border-b-2 border-black pb-3">
                    <h1 className="text-xl font-bold uppercase">
                        {company?.name}
                    </h1>

                    <p className="text-xs whitespace-pre-line">
                        {company?.address}
                    </p>

                    <h2 className="text-lg font-bold mt-3">
                        PAYSLIP FOR{" "}
                        {
                            getEmployeeField(
                                employee,
                                "salaryMonth"
                            )
                        }
                    </h2>
                </div>

                <table className="w-full border-collapse mt-5 text-xs">
                    <tbody>
                        {[
                            [
                                "EMP NO",
                                getEmployeeField(
                                    employee,
                                    "employeeCode"
                                ),
                                "BANK NAME",
                                getEmployeeField(
                                    employee,
                                    "bankName"
                                )
                            ],
                            [
                                "A/C NO",
                                getEmployeeField(
                                    employee,
                                    "bankAccountNumber"
                                ),
                                "GENDER",
                                getEmployeeField(
                                    employee,
                                    "gender"
                                )
                            ],
                            [
                                "EMP PAN",
                                getEmployeeField(
                                    employee,
                                    "panNumber"
                                ),
                                "PF_NO",
                                getEmployeeField(
                                    employee,
                                    "pfNumber"
                                )
                            ],
                            [
                                "NAME",
                                getEmployeeField(
                                    employee,
                                    "fullName"
                                ),
                                "VERTICAL",
                                getEmployeeField(
                                    employee,
                                    "vertical"
                                )
                            ],
                            [
                                "DESIGNATION",
                                getEmployeeField(
                                    employee,
                                    "designation"
                                ),
                                "LOCATION",
                                getEmployeeField(
                                    employee,
                                    "location"
                                )
                            ],
                            [
                                "DOJ",
                                formatDate(
                                    getEmployeeField(
                                        employee,
                                        "joiningDate"
                                    )
                                ),
                                "UAN",
                                getEmployeeField(
                                    employee,
                                    "uanNumber"
                                )
                            ]
                        ].map(
                            (
                                row,
                                index
                            ) => (
                                <tr
                                    key={index}
                                >
                                    <Cell className="font-bold">
                                        {
                                            row[0]
                                        }
                                    </Cell>

                                    <Cell>
                                        {row[1]}
                                    </Cell>

                                    <Cell className="font-bold">
                                        {
                                            row[2]
                                        }
                                    </Cell>

                                    <Cell>
                                        {row[3]}
                                    </Cell>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

                <table className="w-full border-collapse mt-5 text-xs">
                    <thead>
                        <tr className="font-bold text-center">
                            <HeaderCell>
                                EARNINGS
                            </HeaderCell>

                            <HeaderCell>
                                RATE
                            </HeaderCell>

                            <HeaderCell>
                                CURRENT MONTH
                            </HeaderCell>

                            <HeaderCell>
                                ARREAR (+/-)
                            </HeaderCell>

                            <HeaderCell>
                                DEDUCTIONS
                            </HeaderCell>

                            <HeaderCell>
                                CURRENT MONTH
                            </HeaderCell>
                        </tr>
                    </thead>

                    <tbody>
                        {earningRows.map(
                            (
                                row,
                                index
                            ) => {
                                const rate =
                                    getSalaryValue(
                                        earnings,
                                        row.key,
                                        0
                                    );

                                const current =
                                    getSalaryValue(
                                        earnings,
                                        row.key,
                                        1
                                    );

                                const arrear =
                                    getSalaryValue(
                                        earnings,
                                        row.key,
                                        2
                                    );

                                const deduction =
                                    deductionRows[
                                        index
                                    ];

                                const deductionAmount =
                                    deduction
                                        ? getSalaryValue(
                                              deductions,
                                              deduction.key,
                                              0
                                          )
                                        : 0;

                                return (
                                    <tr
                                        key={index}
                                    >
                                        <Cell>
                                            {
                                                row.label
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            {money(
                                                rate
                                            )}
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    current
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "earnings",
                                                        row.key,
                                                        1,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>

                                        <Cell className="text-right">
                                            <EditableMoney
                                                value={
                                                    arrear
                                                }
                                                editing={
                                                    editing
                                                }
                                                onChange={(
                                                    value
                                                ) =>
                                                    updateSalary(
                                                        "earnings",
                                                        row.key,
                                                        2,
                                                        value
                                                    )
                                                }
                                            />
                                        </Cell>

                                        <Cell>
                                            {
                                                deduction?.label ||
                                                ""
                                            }
                                        </Cell>

                                        <Cell className="text-right">
                                            {deduction ? (
                                                <EditableMoney
                                                    value={
                                                        deductionAmount
                                                    }
                                                    editing={
                                                        editing
                                                    }
                                                    onChange={(
                                                        value
                                                    ) =>
                                                        updateSalary(
                                                            "deductions",
                                                            deduction.key,
                                                            0,
                                                            value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </Cell>
                                    </tr>
                                );
                            }
                        )}

                        <tr className="font-bold">
                            <Cell>
                                GROSS
                            </Cell>

                            <Cell />

                            <Cell className="text-right">
                                {money(
                                    currentEarnings
                                )}
                            </Cell>

                            <Cell className="text-right">
                                {money(
                                    arrearEarnings
                                )}
                            </Cell>

                            <Cell>
                                TOTAL DEDUCTIONS
                            </Cell>

                            <Cell className="text-right">
                                {money(
                                    totalDeductions
                                )}
                            </Cell>
                        </tr>

                        <tr className="font-bold">
                            <Cell colSpan={4}>
                                NET PAY
                            </Cell>

                            <Cell>
                                CURRENT MONTH
                            </Cell>

                            <Cell className="text-right">
                                ₹ {money(net)}
                            </Cell>
                        </tr>
                    </tbody>
                </table>

                <div className="grid grid-cols-5 border border-black mt-5 text-xs">
                    {[
                        [
                            "Calendar Days",
                            getEmployeeField(
                                employee,
                                "standardDays"
                            )
                        ],
                        [
                            "Loss of Pay",
                            getEmployeeField(
                                employee,
                                "lwopDays",
                                0
                            )
                        ],
                        [
                            "LOP Reversal",
                            "0"
                        ],
                        [
                            "Arrear Days",
                            "0"
                        ],
                        [
                            "Days Payable",
                            getEmployeeField(
                                employee,
                                "daysWorked"
                            )
                        ]
                    ].map(
                        (
                            [label, value],
                            index
                        ) => (
                            <div
                                key={index}
                                className="border-r border-black p-2 text-center"
                            >
                                <div className="font-bold">
                                    {label}
                                </div>

                                <div className="mt-1">
                                    {value || "0"}
                                </div>
                            </div>
                        )
                    )}
                </div>

                <div className="mt-6 text-center text-xs">
                    This is a computer generated
                    payslip and does not require
                    signature.
                </div>
            </div>
        </div>
    );
};

// =====================================================
// MAIN PAGE
// =====================================================

function EmployeePreview() {
    const { employeeId } =
        useParams();

    const navigate =
        useNavigate();

    const [employee, setEmployee] =
        useState(null);

    const [company, setCompany] =
        useState(null);

    const [template, setTemplate] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [pdfLoading, setPdfLoading] =
        useState(false);

    const [
        downloadLoading,
        setDownloadLoading
    ] = useState(false);

    const [editing, setEditing] =
        useState(false);

    const [logoPosition, setLogoPosition] =
        useState({
            left: 20,
            top: 20
        });

    const defaultLogoPosition = {
        left: 20,
        top: 20
    };

    // =================================================
    // FETCH EMPLOYEE
    // =================================================

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `${API_URL}/payslip/${employeeId}`,
                    {
                        withCredentials: true
                    }
                );

                const responseData = response.data || {};

                console.log(
                    "PAYSLIP PREVIEW RESPONSE:",
                    responseData
                );

                /*
                * Backend response:
                *
                * {
                *   success: true,
                *   data: {
                *      employee,
                *      company,
                *      template
                *   }
                * }
                */

                const payslipData =
                    responseData.data || {};

                const employeeData =
                    payslipData.employee;

                if (!employeeData) {
                    throw new Error(
                        "Employee not found"
                    );
                }

                const companyData =
                    payslipData.company ||
                    (
                        employeeData.companyId &&
                        typeof employeeData.companyId === "object"
                            ? employeeData.companyId
                            : null
                    );

                if (!companyData) {
                    throw new Error(
                        "Company information not found"
                    );
                }

                const templateData =
                    payslipData.template ||
                    companyData?.templateId ||
                    (
                        employeeData.templateId &&
                        typeof employeeData.templateId === "object"
                            ? employeeData.templateId
                            : null
                    );

                if (!templateData) {
                    throw new Error(
                        "Salary template not found"
                    );
                }

                /*
                * Make sure salary data is available
                * for all payslip templates.
                */

                employeeData.earnings =
                    employeeData.earnings ||
                    payslipData.earnings ||
                    {};

                employeeData.deductions =
                    employeeData.deductions ||
                    payslipData.deductions ||
                    {};

                setEmployee(employeeData);
                setCompany(companyData);
                setTemplate(templateData);

            } catch (error) {
                console.error(
                    "Employee Preview Error:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load employee"
                );
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            fetchEmployee();
        }
    }, [employeeId]);

    // =================================================
    // UPDATE FIELD
    // =================================================

    const updateField = (
        key,
        value
    ) => {
        setEmployee(
            (previous) => {
                if (!previous) {
                    return previous;
                }

                return {
                    ...previous,

                    employeeFields: {
                        ...(
                            previous.employeeFields ||
                            {}
                        ),

                        [key]: value
                    }
                };
            }
        );
    };

    // =================================================
    // UPDATE SALARY
    // =================================================

    const updateSalary = (
        section,
        componentKey,
        column,
        value
    ) => {
        setEmployee(
            (previous) => {
                if (!previous) {
                    return previous;
                }

                const currentSection =
                    previous[
                        section
                    ] || {};

                const currentComponent =
                    currentSection[
                        componentKey
                    ];

                if (
                    typeof currentComponent ===
                        "object" &&
                    currentComponent !==
                        null &&
                    !Array.isArray(
                        currentComponent
                    )
                ) {
                    return {
                        ...previous,

                        [section]: {
                            ...currentSection,

                            [componentKey]: {
                                ...currentComponent,

                                [column]:
                                    value
                            }
                        }
                    };
                }

                return {
                    ...previous,

                    [section]: {
                        ...currentSection,

                        [componentKey]: {
                            [column]:
                                value
                        }
                    }
                };
            }
        );
    };

    // =================================================
    // TEMPLATE KEY
    // =================================================

    const templateKey =
        useMemo(
            () =>
                getTemplateKey(
                    template
                ),
            [template]
        );

    // =================================================
    // SUMMARY TOTALS
    // =================================================

    const earningsTotal =
        useMemo(() => {
            if (!employee) {
                return 0;
            }

            const rows = [
                {
                    key:
                        "basicSalary"
                },
                {
                    key:
                        "houseRentAllowance"
                },
                {
                    key:
                        "otherAllowance"
                },
                {
                    key:
                        "leaveTravelAllowance"
                },
                {
                    key:
                        "performanceBonus"
                }
            ];

            if (
                templateKey ===
                "format1"
            ) {
                return (
                    getTemplateTotal(
                        employee.earnings,
                        rows,
                        1
                    ) +
                    getTemplateTotal(
                        employee.earnings,
                        rows,
                        2
                    )
                );
            }

            return getTemplateTotal(
                employee.earnings,
                rows,
                1
            );
        }, [
            employee,
            templateKey
        ]);

    const deductionsTotal =
        useMemo(() => {
            if (!employee) {
                return 0;
            }

            const rows = [
                {
                    key:
                        "providentFund"
                },
                {
                    key:
                        "professionalTax"
                },
                {
                    key:
                        "incomeTax"
                }
            ];

            return getTemplateTotal(
                employee.deductions,
                rows,
                0
            );
        }, [employee]);

    const netPay =
        earningsTotal -
        deductionsTotal;

    // =================================================
    // RESET LOGO
    // =================================================

    const resetLogoPosition =
        () => {
            setLogoPosition(
                defaultLogoPosition
            );

            toast.success(
                "Logo position reset"
            );
        };

    // =================================================
    // EDIT
    // =================================================

    const startEditing = () => {
        setEditing(true);

        toast.success(
            "Preview editing enabled"
        );
    };

    // =================================================
    // CANCEL
    // =================================================

    const cancelEditing = () => {
        setEditing(false);

        toast.success(
            "Editing mode closed"
        );
    };

    // =================================================
    // SAVE PREVIEW
    // =================================================

    const savePreview = () => {
        /*
         * Atyare aa frontend preview state save kare che.
         *
         * Backend employee PUT/update endpoint connect
         * karvanu haju baki che.
         */

        setEditing(false);

        toast.success(
            "Preview changes saved"
        );
    };

    // =================================================
    // PRINT
    // =================================================

    const handlePrint = () => {
        window.print();
    };

    // =================================================
    // CREATE / OPEN PDF
    // =================================================

    const handleCreatePayslip =
        async () => {
            if (!employeeId) {
                toast.error(
                    "Employee ID is missing"
                );

                return;
            }

            let pdfWindow = null;

            try {
                setPdfLoading(true);

                pdfWindow =
                    window.open(
                        "",
                        "_blank"
                    );

                if (!pdfWindow) {
                    toast.error(
                        "Please allow popups for this website"
                    );

                    return;
                }

                pdfWindow.document.write(`
                    <html>
                        <head>
                            <title>
                                Generating Payslip...
                            </title>
                        </head>

                        <body
                            style="
                                margin:0;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                height:100vh;
                                font-family:Arial,sans-serif;
                                background:#f8fafc;
                                color:#334155;
                            "
                        >
                            <div
                                style="
                                    text-align:center;
                                "
                            >
                                <h2>
                                    Generating Payslip...
                                </h2>

                                <p>
                                    Please wait.
                                </p>
                            </div>
                        </body>
                    </html>
                `);

                pdfWindow.document.close();

                const logoQuery =
                    `?logoLeft=${logoPosition.left}&logoTop=${logoPosition.top}`;

                const response =
                    await fetch(
                        `${API_URL}/payslip/${employeeId}/pdf${logoQuery}`,
                        {
                            method: "GET",
                            credentials:
                                "include"
                        }
                    );

                if (!response.ok) {
                    let message =
                        "Failed to generate payslip PDF";

                    try {
                        const data =
                            await response.json();

                        message =
                            data?.message ||
                            message;
                    } catch {
                        // Ignore
                    }

                    throw new Error(
                        message
                    );
                }

                const blob =
                    await response.blob();

                const pdfUrl =
                    window.URL.createObjectURL(
                        blob
                    );

                pdfWindow.location.href =
                    pdfUrl;

                setTimeout(() => {
                    window.URL.revokeObjectURL(
                        pdfUrl
                    );
                }, 60000);

                toast.success(
                    "Payslip PDF generated successfully"
                );
            } catch (error) {
                console.error(
                    "PDF Generation Error:",
                    error
                );

                if (
                    pdfWindow &&
                    !pdfWindow.closed
                ) {
                    pdfWindow.close();
                }

                toast.error(
                    error.message ||
                        "Failed to generate payslip PDF"
                );
            } finally {
                setPdfLoading(false);
            }
        };

    // =================================================
    // DOWNLOAD PDF
    // =================================================

    const handleDownloadPayslip =
        async () => {
            if (!employeeId) {
                toast.error(
                    "Employee ID is missing"
                );

                return;
            }

            try {
                setDownloadLoading(
                    true
                );

                const logoQuery =
                    `?logoLeft=${logoPosition.left}&logoTop=${logoPosition.top}`;

                const response =
                    await fetch(
                        `${API_URL}/payslip/${employeeId}/download${logoQuery}`,
                        {
                            method: "GET",
                            credentials:
                                "include"
                        }
                    );

                if (!response.ok) {
                    let message =
                        "Failed to download payslip";

                    try {
                        const data =
                            await response.json();

                        message =
                            data?.message ||
                            message;
                    } catch {
                        // Ignore
                    }

                    throw new Error(
                        message
                    );
                }

                const blob =
                    await response.blob();

                const downloadUrl =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        "a"
                    );

                link.href =
                    downloadUrl;

                const employeeName =
                    getEmployeeField(
                        employee,
                        "fullName",
                        employee?.employeeId ||
                            "employee"
                    );

                const cleanName =
                    String(
                        employeeName
                    )
                        .trim()
                        .replace(
                            /[^a-zA-Z0-9-_]/g,
                            "_"
                        );

                link.download =
                    `Payslip-${cleanName}.pdf`;

                document.body.appendChild(
                    link
                );

                link.click();

                document.body.removeChild(
                    link
                );

                window.URL.revokeObjectURL(
                    downloadUrl
                );

                toast.success(
                    "Payslip downloaded successfully"
                );
            } catch (error) {
                console.error(
                    "PDF Download Error:",
                    error
                );

                toast.error(
                    error.message ||
                        "Failed to download payslip"
                );
            } finally {
                setDownloadLoading(
                    false
                );
            }
        };

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        size={32}
                        className="animate-spin text-slate-700"
                    />

                    <p className="text-sm text-slate-500">
                        Loading payslip
                        preview...
                    </p>
                </div>
            </div>
        );
    }

    // =================================================
    // ERROR
    // =================================================

    if (
        !employee ||
        !company ||
        !template
    ) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">

                    <FileText
                        size={42}
                        className="mx-auto text-slate-400"
                    />

                    <h2 className="text-xl font-semibold mt-4">
                        Payslip Not Found
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                        Employee, company or
                        salary template
                        information could not
                        be loaded.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/Dashboard"
                            )
                        }
                        className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // =================================================
    // RENDER TEMPLATE
    // =================================================

    const renderTemplate =
        () => {
            const commonProps = {
                employee,
                company,
                template,
                editing,
                updateField,
                updateSalary,
                logoPosition,
                setLogoPosition
            };

            switch (
                templateKey
            ) {
                case "hardeep":
                    return (
                        <HardeepTemplate
                            {...commonProps}
                        />
                    );

                case "surjeet":
                    return (
                        <SurjeetTemplate
                            {...commonProps}
                        />
                    );

                case "pankaj":
                    return (
                        <PankajTemplate
                            {...commonProps}
                        />
                    );

                case "amitesh":
                    return (
                        <AmiteshTemplate
                            {...commonProps}
                        />
                    );

                case "format1":
                    return (
                        <Format1Template
                            {...commonProps}
                        />
                    );

                default:
                    return (
                        <SurjeetTemplate
                            {...commonProps}
                        />
                    );
            }
        };

    const isLandscape =
        template?.layout
            ?.orientation ===
        "landscape";

    // =================================================
    // RETURN
    // =================================================

    return (
        <>
            <style>
                {`
                    @page {
                        size: A4;
                        margin: 0;
                    }

                    @media print {
                        html,
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                        }

                        .no-print {
                            display: none !important;
                        }

                        .preview-wrapper {
                            padding: 0 !important;
                            margin: 0 !important;
                        }

                        .payslip-portrait {
                            width: 210mm !important;
                            min-height: 297mm !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            border: 1px solid #000 !important;
                        }

                        .payslip-landscape {
                            width: 297mm !important;
                            min-height: 210mm !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            border: 1px solid #000 !important;
                        }
                    }
                `}
            </style>

            <div className="min-h-screen bg-slate-100">

                {/* =================================================
                    TOP BAR
                ================================================= */}

                <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-200">

                    <div className="max-w-[1500px] mx-auto px-6 py-4">

                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                            {/* LEFT */}

                            <div className="flex items-center gap-3">

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/Dashboard"
                                        )
                                    }
                                    className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-50"
                                >
                                    <ArrowLeft
                                        size={18}
                                    />
                                </button>

                                <div>
                                    <h1 className="text-xl font-semibold text-slate-900">
                                        Employee Payslip Preview
                                    </h1>

                                    <p className="text-sm text-slate-500">
                                        {
                                            company.name
                                        }

                                        {" · "}

                                        {
                                            template.templateName
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* ACTIONS */}

                            <div className="flex flex-wrap gap-2">

                                {!editing ? (
                                    <button
                                        onClick={
                                            startEditing
                                        }
                                        disabled={
                                            pdfLoading ||
                                            downloadLoading
                                        }
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Edit3
                                            size={16}
                                        />

                                        Edit Preview
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={
                                                resetLogoPosition
                                            }
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
                                        >
                                            <RotateCcw
                                                size={16}
                                            />

                                            Reset Logo
                                        </button>

                                        <button
                                            onClick={
                                                cancelEditing
                                            }
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
                                        >
                                            <X
                                                size={16}
                                            />

                                            Cancel
                                        </button>

                                        <button
                                            onClick={
                                                savePreview
                                            }
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                                        >
                                            <Save
                                                size={16}
                                            />

                                            Save Changes
                                        </button>
                                    </>
                                )}

                                {/* PRINT */}

                                <button
                                    onClick={
                                        handlePrint
                                    }
                                    disabled={
                                        pdfLoading ||
                                        downloadLoading
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Printer
                                        size={16}
                                    />

                                    Print
                                </button>

                                {/* CREATE PAYSLIP */}

                                <button
                                    onClick={
                                        handleCreatePayslip
                                    }
                                    disabled={
                                        pdfLoading ||
                                        downloadLoading
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {pdfLoading ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />

                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileText
                                                size={16}
                                            />

                                            Create Payslip
                                        </>
                                    )}
                                </button>

                                {/* DOWNLOAD */}

                                <button
                                    onClick={
                                        handleDownloadPayslip
                                    }
                                    disabled={
                                        pdfLoading ||
                                        downloadLoading
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {downloadLoading ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />

                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download
                                                size={16}
                                            />

                                            Download PDF
                                        </>
                                    )}
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    EDITING NOTICE
                ================================================= */}

                {editing && (
                    <div className="no-print max-w-[1500px] mx-auto px-6 pt-5">

                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">

                            <Move
                                size={18}
                                className="text-blue-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-blue-900">
                                    Preview Edit Mode
                                </p>

                                <p className="text-xs text-blue-700 mt-0.5">
                                    Editable fields
                                    change kari shako
                                    cho. Logo par
                                    mouse drag kari
                                    position change kari
                                    shako cho.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div className="no-print max-w-[1500px] mx-auto px-6 pt-5">

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* EMPLOYEE */}

                        <div className="bg-white border border-slate-200 rounded-xl p-4">

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Employee
                            </p>

                            <p className="font-semibold text-slate-900 mt-1">
                                {getEmployeeField(
                                    employee,
                                    "fullName",
                                    employee.employeeId
                                )}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                                ID:{" "}
                                {
                                    employee.employeeId
                                }
                            </p>
                        </div>

                        {/* TEMPLATE */}

                        <div className="bg-white border border-slate-200 rounded-xl p-4">

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Template
                            </p>

                            <p className="font-semibold text-slate-900 mt-1">
                                {
                                    template.templateName
                                }
                            </p>

                            <p className="text-xs text-slate-500 mt-1 capitalize">
                                {
                                    template.layout
                                        ?.orientation ||
                                    "portrait"
                                }
                            </p>
                        </div>

                        {/* GROSS */}

                        <div className="bg-white border border-slate-200 rounded-xl p-4">

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Gross Earnings
                            </p>

                            <p className="font-semibold text-emerald-600 mt-1">
                                ₹{" "}
                                {money(
                                    earningsTotal
                                )}
                            </p>
                        </div>

                        {/* NET */}

                        <div className="bg-white border border-slate-200 rounded-xl p-4">

                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Net Pay
                            </p>

                            <p className="font-semibold text-slate-900 mt-1">
                                ₹{" "}
                                {money(
                                    netPay
                                )}
                            </p>
                        </div>

                    </div>
                </div>

                {/* =================================================
                    PREVIEW
                ================================================= */}

                <main className="preview-wrapper max-w-[1500px] mx-auto px-6 py-8">

                    <div className="flex justify-center">

                        <div
                            className={
                                isLandscape
                                    ? "w-full max-w-[1120px]"
                                    : "w-full max-w-[790px]"
                            }
                        >
                            {renderTemplate()}
                        </div>

                    </div>

                </main>
            </div>
        </>
    );
}

export default EmployeePreview;