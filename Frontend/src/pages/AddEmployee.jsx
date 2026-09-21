import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Calculator,
    CheckCircle2,
    CircleDollarSign,
    FileText,
    Loader2,
    UserRound
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getInitialEmployeeFields = (fields = []) => {
    const values = {};

    fields.forEach((field) => {
        values[field.fieldKey] = "";
    });

    return values;
};

const getInitialSalaryValues = (components = []) => {
    const values = {};

    components.forEach((component) => {
        if (Array.isArray(component.columns) && component.columns.length > 0) {
            values[component.key] = {};

            component.columns.forEach((column) => {
                values[component.key][column] = "";
            });
        } else {
            values[component.key] = "";
        }
    });

    return values;
};

const formatCurrency = (value) => {
    const number = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
};

const getSalaryComponentTotal = (componentValue) => {
    if (
        typeof componentValue === "object" &&
        componentValue !== null &&
        !Array.isArray(componentValue)
    ) {
        return Object.values(componentValue).reduce((total, value) => {
            return total + (Number(value) || 0);
        }, 0);
    }

    return Number(componentValue) || 0;
};

function AddEmployee() {
    const { companyId } = useParams();
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [template, setTemplate] = useState(null);

    const [employeeId, setEmployeeId] = useState("");

    const [employeeFields, setEmployeeFields] = useState({});
    const [earnings, setEarnings] = useState({});
    const [deductions, setDeductions] = useState({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // =====================================================
    // FETCH COMPANY + TEMPLATE
    // =====================================================

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `${API_URL}/company/${companyId}`,
                    {
                        withCredentials: true
                    }
                );

                if (!response.data.success) {
                    throw new Error(
                        response.data.message || "Failed to load company"
                    );
                }

                const companyData = response.data.company;

                if (!companyData) {
                    throw new Error("Company data not found");
                }

                const templateData = companyData.templateId;

                if (!templateData) {
                    throw new Error(
                        "No salary template is assigned to this company"
                    );
                }

                setCompany(companyData);
                setTemplate(templateData);

                setEmployeeFields(
                    getInitialEmployeeFields(
                        templateData.employeeFields
                    )
                );

                setEarnings(
                    getInitialSalaryValues(
                        templateData.earnings
                    )
                );

                setDeductions(
                    getInitialSalaryValues(
                        templateData.deductions
                    )
                );
            } catch (error) {
                console.error("Fetch Company Error:", error);

                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load company"
                );
            } finally {
                setLoading(false);
            }
        };

        if (companyId) {
            fetchCompany();
        }
    }, [companyId]);

    // =====================================================
    // EMPLOYEE FIELD CHANGE
    // =====================================================

    const handleEmployeeFieldChange = (fieldKey, value) => {
        setEmployeeFields((previous) => ({
            ...previous,
            [fieldKey]: value
        }));
    };

    // =====================================================
    // SALARY SIMPLE VALUE CHANGE
    // =====================================================

    const handleSalaryValueChange = (
        section,
        componentKey,
        value
    ) => {
        if (section === "earnings") {
            setEarnings((previous) => ({
                ...previous,
                [componentKey]: value
            }));
        } else {
            setDeductions((previous) => ({
                ...previous,
                [componentKey]: value
            }));
        }
    };

    // =====================================================
    // SALARY COLUMN VALUE CHANGE
    // =====================================================

    const handleSalaryColumnChange = (
        section,
        componentKey,
        column,
        value
    ) => {
        const setter =
            section === "earnings"
                ? setEarnings
                : setDeductions;

        setter((previous) => ({
            ...previous,
            [componentKey]: {
                ...(previous[componentKey] || {}),
                [column]: value
            }
        }));
    };

    // =====================================================
    // CALCULATE TOTAL
    // =====================================================

    const earningsTotal = useMemo(() => {
        return Object.values(earnings).reduce(
            (total, component) => {
                return (
                    total +
                    getSalaryComponentTotal(component)
                );
            },
            0
        );
    }, [earnings]);

    const deductionsTotal = useMemo(() => {
        return Object.values(deductions).reduce(
            (total, component) => {
                return (
                    total +
                    getSalaryComponentTotal(component)
                );
            },
            0
        );
    }, [deductions]);

    const netPay = earningsTotal - deductionsTotal;

    // =====================================================
    // VALIDATE EMPLOYEE FIELDS
    // =====================================================

    const validateEmployeeFields = () => {
        if (!employeeId.trim()) {
            toast.error("Employee ID is required");
            return false;
        }

        if (!template) {
            toast.error("Salary template not found");
            return false;
        }

        for (const field of template.employeeFields || []) {
            const value = employeeFields[field.fieldKey];

            if (field.required) {
                if (
                    value === undefined ||
                    value === null ||
                    String(value).trim() === ""
                ) {
                    toast.error(`${field.label} is required`);
                    return false;
                }
            }

            if (
                field.type === "number" &&
                value !== "" &&
                value !== null &&
                value !== undefined
            ) {
                if (
                    !Number.isFinite(Number(value))
                ) {
                    toast.error(
                        `${field.label} must be a valid number`
                    );

                    return false;
                }

                if (Number(value) < 0) {
                    toast.error(
                        `${field.label} cannot be negative`
                    );

                    return false;
                }
            }

            if (
                field.type === "email" &&
                value
            ) {
                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(value)) {
                    toast.error(
                        `${field.label} must be a valid email`
                    );

                    return false;
                }
            }
        }

        return true;
    };

    // =====================================================
    // VALIDATE SALARY
    // =====================================================

    const validateSalaryComponents = (
        components,
        values,
        sectionName
    ) => {
        for (const component of components || []) {
            const value = values[component.key];

            // ---------------------------------------------
            // Multiple columns
            // ---------------------------------------------

            if (
                Array.isArray(component.columns) &&
                component.columns.length > 0
            ) {
                const componentValues =
                    value || {};

                for (const column of component.columns) {
                    const columnValue =
                        componentValues[column];

                    if (
                        columnValue === "" ||
                        columnValue === null ||
                        columnValue === undefined
                    ) {
                        continue;
                    }

                    if (
                        !Number.isFinite(
                            Number(columnValue)
                        )
                    ) {
                        toast.error(
                            `${component.label} - ${column} must be a valid number`
                        );

                        return false;
                    }

                    if (Number(columnValue) < 0) {
                        toast.error(
                            `${component.label} - ${column} cannot be negative`
                        );

                        return false;
                    }
                }
            }

            // ---------------------------------------------
            // Single value
            // ---------------------------------------------

            else {
                if (
                    value === "" ||
                    value === null ||
                    value === undefined
                ) {
                    continue;
                }

                if (
                    !Number.isFinite(Number(value))
                ) {
                    toast.error(
                        `${component.label} must be a valid number`
                    );

                    return false;
                }

                if (Number(value) < 0) {
                    toast.error(
                        `${component.label} cannot be negative`
                    );

                    return false;
                }
            }
        }

        return true;
    };

    // =====================================================
    // PREPARE EMPLOYEE FIELDS
    // =====================================================

    const prepareEmployeeFields = () => {
        const finalFields = {};

        Object.entries(employeeFields).forEach(
            ([key, value]) => {
                if (
                    value !== "" &&
                    value !== null &&
                    value !== undefined
                ) {
                    finalFields[key] = value;
                }
            }
        );

        return finalFields;
    };

    // =====================================================
    // PREPARE SALARY VALUES
    // =====================================================

    const prepareSalaryValues = (values, components) => {
        const finalValues = {};

        for (const component of components || []) {
            const value = values[component.key];

            if (
                Array.isArray(component.columns) &&
                component.columns.length > 0
            ) {
                const finalComponent = {};

                for (const column of component.columns) {
                    const columnValue =
                        value?.[column];

                    if (
                        columnValue !== "" &&
                        columnValue !== null &&
                        columnValue !== undefined
                    ) {
                        finalComponent[column] =
                            Number(columnValue);
                    } else {
                        finalComponent[column] = 0;
                    }
                }

                finalValues[component.key] =
                    finalComponent;
            } else {
                if (
                    value !== "" &&
                    value !== null &&
                    value !== undefined
                ) {
                    finalValues[component.key] =
                        Number(value);
                } else {
                    finalValues[component.key] = 0;
                }
            }
        }

        return finalValues;
    };

    // =====================================================
    // SUBMIT EMPLOYEE
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateEmployeeFields()) {
            return;
        }

        if (
            !validateSalaryComponents(
                template?.earnings,
                earnings,
                "Earnings"
            )
        ) {
            return;
        }

        if (
            !validateSalaryComponents(
                template?.deductions,
                deductions,
                "Deductions"
            )
        ) {
            return;
        }

        try {
            setSubmitting(true);

            const finalEmployeeFields =
                prepareEmployeeFields();

            const finalEarnings =
                prepareSalaryValues(
                    earnings,
                    template?.earnings
                );

            const finalDeductions =
                prepareSalaryValues(
                    deductions,
                    template?.deductions
                );

            const requestBody = {
                companyId,

                employeeId:
                    employeeId.trim(),

                employeeFields:
                    finalEmployeeFields,

                earnings:
                    finalEarnings,

                deductions:
                    finalDeductions
            };

            const response = await axios.post(
                `${API_URL}/employees/create`,
                requestBody,
                {
                    withCredentials: true
                }
            );

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                    "Failed to create employee"
                );
            }

            toast.success(
                "Employee created successfully"
            );

            const createdEmployee =
                response.data.employee;

            if (createdEmployee?._id) {
                navigate(
                    `/EmployeePreview/${createdEmployee._id}`
                );
            } else {
                navigate("/Dashboard");
            }
        } catch (error) {
            console.error(
                "Create Employee Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to create employee"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // BACK
    // =====================================================

    const handleBack = () => {
        navigate("/Dashboard");
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        className="animate-spin text-slate-700"
                        size={32}
                    />

                    <p className="text-sm text-slate-500">
                        Loading company and salary template...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // COMPANY / TEMPLATE NOT FOUND
    // =====================================================

    if (!company || !template) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <FileText
                            size={26}
                            className="text-red-500"
                        />
                    </div>

                    <h2 className="text-xl font-semibold text-slate-900">
                        Template Not Found
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                        This company does not have a valid salary
                        template assigned.
                    </p>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-50">
            {/* =================================================
                HEADER
            ================================================= */}

            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            <div>
                                <h1 className="text-xl font-semibold text-slate-900">
                                    Add Employee
                                </h1>

                                <p className="text-sm text-slate-500 mt-0.5">
                                    Create employee salary information
                                </p>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                            <FileText
                                size={16}
                                className="text-slate-600"
                            />

                            <span className="text-sm font-medium text-slate-700">
                                {template.templateName}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="max-w-7xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit}>
                    {/* =================================================
                        COMPANY / TEMPLATE INFO
                    ================================================= */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Building2
                                        size={20}
                                        className="text-blue-600"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Company Information
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Employee will be created under
                                        this company
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Company
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {company.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Template
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {template.templateName}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Layout
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                                    {template.layout?.orientation} A4
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        EMPLOYEE BASIC INFO
                    ================================================= */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <UserRound
                                        size={20}
                                        className="text-indigo-600"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Employee Information
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Enter employee details required by
                                        the selected template
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Employee ID
                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) =>
                                        setEmployeeId(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. EMP001"
                                    className="w-full max-w-md h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition"
                                />

                                <p className="text-xs text-slate-400 mt-1.5">
                                    This ID must be unique within the
                                    company.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {template.employeeFields?.map(
                                    (field) => {
                                        const value =
                                            employeeFields[
                                                field.fieldKey
                                            ] ?? "";

                                        return (
                                            <div
                                                key={
                                                    field.fieldKey
                                                }
                                            >
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    {field.label}

                                                    {field.required && (
                                                        <span className="text-red-500 ml-1">
                                                            *
                                                        </span>
                                                    )}
                                                </label>

                                                <input
                                                    type={
                                                        field.type ===
                                                        "number"
                                                            ? "number"
                                                            : field.type ===
                                                              "date"
                                                            ? "date"
                                                            : field.type ===
                                                              "email"
                                                            ? "email"
                                                            : "text"
                                                    }
                                                    value={value}
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleEmployeeFieldChange(
                                                            field.fieldKey,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={
                                                        field.type ===
                                                        "date"
                                                            ? ""
                                                            : `Enter ${field.label}`
                                                    }
                                                    min={
                                                        field.type ===
                                                        "number"
                                                            ? "0"
                                                            : undefined
                                                    }
                                                    className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition"
                                                />
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        EARNINGS
                    ================================================= */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <CircleDollarSign
                                            size={20}
                                            className="text-emerald-600"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900">
                                            Earnings
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Salary components based on the
                                            selected format
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-slate-500">
                                        Total Earnings
                                    </p>

                                    <p className="text-lg font-bold text-emerald-600">
                                        ₹{" "}
                                        {formatCurrency(
                                            earningsTotal
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-5">
                                {template.earnings?.map(
                                    (component) => {
                                        const hasColumns =
                                            Array.isArray(
                                                component.columns
                                            ) &&
                                            component.columns
                                                .length > 0;

                                        return (
                                            <div
                                                key={
                                                    component.key
                                                }
                                                className="rounded-xl border border-slate-200 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {
                                                            component.label
                                                        }
                                                    </p>
                                                </div>

                                                <div className="p-4">
                                                    {hasColumns ? (
                                                        <div
                                                            className={`grid grid-cols-1 ${
                                                                component
                                                                    .columns
                                                                    .length ===
                                                                2
                                                                    ? "md:grid-cols-2"
                                                                    : component
                                                                          .columns
                                                                          .length ===
                                                                      3
                                                                    ? "md:grid-cols-3"
                                                                    : "md:grid-cols-2 lg:grid-cols-4"
                                                            } gap-4`}
                                                        >
                                                            {component.columns.map(
                                                                (
                                                                    column
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            column
                                                                        }
                                                                    >
                                                                        <label className="block text-xs font-medium text-slate-500 mb-2">
                                                                            {
                                                                                column
                                                                            }
                                                                        </label>

                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                                                ₹
                                                                            </span>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    earnings[
                                                                                        component
                                                                                            .key
                                                                                    ]?.[
                                                                                        column
                                                                                    ] ??
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleSalaryColumnChange(
                                                                                        "earnings",
                                                                                        component.key,
                                                                                        column,
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="max-w-sm">
                                                            <label className="block text-xs font-medium text-slate-500 mb-2">
                                                                Amount
                                                            </label>

                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                                    ₹
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={
                                                                        earnings[
                                                                            component
                                                                                .key
                                                                        ] ??
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleSalaryValueChange(
                                                                            "earnings",
                                                                            component.key,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="0.00"
                                                                    className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        DEDUCTIONS
                    ================================================= */}

                    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                                        <Calculator
                                            size={20}
                                            className="text-rose-600"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-slate-900">
                                            Deductions
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Applicable salary deductions
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-slate-500">
                                        Total Deductions
                                    </p>

                                    <p className="text-lg font-bold text-rose-600">
                                        ₹{" "}
                                        {formatCurrency(
                                            deductionsTotal
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-5">
                                {template.deductions?.map(
                                    (component) => {
                                        const hasColumns =
                                            Array.isArray(
                                                component.columns
                                            ) &&
                                            component.columns
                                                .length > 0;

                                        return (
                                            <div
                                                key={
                                                    component.key
                                                }
                                                className="rounded-xl border border-slate-200 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {
                                                            component.label
                                                        }
                                                    </p>
                                                </div>

                                                <div className="p-4">
                                                    {hasColumns ? (
                                                        <div
                                                            className={`grid grid-cols-1 ${
                                                                component
                                                                    .columns
                                                                    .length ===
                                                                2
                                                                    ? "md:grid-cols-2"
                                                                    : component
                                                                          .columns
                                                                          .length ===
                                                                      3
                                                                    ? "md:grid-cols-3"
                                                                    : "md:grid-cols-2 lg:grid-cols-4"
                                                            } gap-4`}
                                                        >
                                                            {component.columns.map(
                                                                (
                                                                    column
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            column
                                                                        }
                                                                    >
                                                                        <label className="block text-xs font-medium text-slate-500 mb-2">
                                                                            {
                                                                                column
                                                                            }
                                                                        </label>

                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                                                ₹
                                                                            </span>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    deductions[
                                                                                        component
                                                                                            .key
                                                                                    ]?.[
                                                                                        column
                                                                                    ] ??
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleSalaryColumnChange(
                                                                                        "deductions",
                                                                                        component.key,
                                                                                        column,
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                placeholder="0.00"
                                                                                className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 transition"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="max-w-sm">
                                                            <label className="block text-xs font-medium text-slate-500 mb-2">
                                                                Amount
                                                            </label>

                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                                    ₹
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={
                                                                        deductions[
                                                                            component
                                                                                .key
                                                                        ] ??
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleSalaryValueChange(
                                                                            "deductions",
                                                                            component.key,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="0.00"
                                                                    className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 transition"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        NET PAY SUMMARY
                    ================================================= */}

                    <section className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Estimated Net Pay
                                    </p>

                                    <p className="text-3xl font-bold text-white mt-1">
                                        ₹{" "}
                                        {formatCurrency(
                                            netPay
                                        )}
                                    </p>

                                    <p className="text-xs text-slate-500 mt-2">
                                        Total Earnings − Total Deductions
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Earnings
                                        </p>

                                        <p className="text-sm font-semibold text-emerald-400 mt-1">
                                            ₹{" "}
                                            {formatCurrency(
                                                earningsTotal
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Deductions
                                        </p>

                                        <p className="text-sm font-semibold text-rose-400 mt-1">
                                            ₹{" "}
                                            {formatCurrency(
                                                deductionsTotal
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={submitting}
                            className="h-11 px-5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-11 px-6 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />

                                    Creating Employee...
                                </>
                            ) : (
                                <>
                                    Create Employee
                                    <ArrowRight size={17} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default AddEmployee;