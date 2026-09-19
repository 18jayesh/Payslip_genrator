import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import {
    ArrowLeft,
    Plus,
    Search,
    Users,
    Building2,
    Mail,
    Phone,
    Eye,
    Loader2,
    RefreshCw,
    X,
    UserRound,
    FileText
} from "lucide-react";

const API_URL = "http://localhost:3000";

export default function ManageEmployees() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const companyIdFromUrl =
        searchParams.get("companyId");

    // =====================================================
    // STATE
    // =====================================================

    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [selectedCompany, setSelectedCompany] =
        useState(companyIdFromUrl || "all");

    const [selectedEmployee, setSelectedEmployee] =
        useState(null);

    // =====================================================
    // FETCH EMPLOYEES
    // =====================================================

    const fetchEmployees = async () => {

        try {

            setLoading(true);

            let url =
                `${API_URL}/api/employees`;

            if (
                selectedCompany &&
                selectedCompany !== "all"
            ) {
                url +=
                    `?companyId=${selectedCompany}`;
            }

            const response =
                await axios.get(
                    url,
                    {
                        withCredentials: true
                    }
                );

            console.log(
                "Employees API Response:",
                response.data
            );

            setEmployees(
                response.data?.employees || []
            );

        } catch (error) {

            console.error(
                "Fetch employees error:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load employees"
            );

            setEmployees([]);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchEmployees();

    }, [selectedCompany]);

    // =====================================================
    // GET COMPANIES FROM EMPLOYEES
    // =====================================================

    const companies = useMemo(() => {

        const companyMap = new Map();

        employees.forEach((employee) => {

            const company =
                employee.companyId;

            if (!company?._id) {
                return;
            }

            if (!companyMap.has(company._id)) {

                companyMap.set(
                    company._id,
                    {
                        _id: company._id,
                        name:
                            company.name ||
                            "Unnamed Company"
                    }
                );

            }

        });

        return Array.from(
            companyMap.values()
        );

    }, [employees]);

    // =====================================================
    // FILTER EMPLOYEES
    // =====================================================

    const filteredEmployees = useMemo(() => {

        const value =
            search.trim().toLowerCase();

        if (!value) {

            return employees;

        }

        return employees.filter(
            (employee) => {

                const employeeId =
                    String(
                        employee.employeeId || ""
                    ).toLowerCase();

                const companyName =
                    String(
                        employee.companyId?.name || ""
                    ).toLowerCase();

                const fields =
                    employee.employeeFields || {};

                const fieldValues =
                    Object.values(fields)
                        .map((item) =>
                            String(
                                item ?? ""
                            ).toLowerCase()
                        )
                        .join(" ");

                return (
                    employeeId.includes(value) ||
                    companyName.includes(value) ||
                    fieldValues.includes(value)
                );

            }
        );

    }, [employees, search]);

    // =====================================================
    // GET EMPLOYEE NAME
    // =====================================================

    const getEmployeeName = (employee) => {

        const fields =
            employee.employeeFields || {};

        const possibleKeys = [
            "employeeName",
            "name",
            "fullName",
            "employee_name",
            "employee_name_full",
            "empName"
        ];

        for (const key of possibleKeys) {

            if (
                fields[key] !== undefined &&
                fields[key] !== null &&
                String(fields[key]).trim() !== ""
            ) {

                return String(
                    fields[key]
                );

            }

        }

        const firstName =
            fields.firstName ||
            fields.first_name ||
            "";

        const lastName =
            fields.lastName ||
            fields.last_name ||
            "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        if (fullName) {

            return fullName;

        }

        return "Employee";

    };

    // =====================================================
    // GET EMPLOYEE EMAIL
    // =====================================================

    const getEmployeeEmail = (employee) => {

        const fields =
            employee.employeeFields || {};

        const possibleKeys = [
            "email",
            "employeeEmail",
            "employee_email",
            "emailAddress"
        ];

        for (const key of possibleKeys) {

            if (
                fields[key] !== undefined &&
                fields[key] !== null &&
                String(fields[key]).trim() !== ""
            ) {

                return String(
                    fields[key]
                );

            }

        }

        return "";

    };

    // =====================================================
    // GET EMPLOYEE PHONE
    // =====================================================

    const getEmployeePhone = (employee) => {

        const fields =
            employee.employeeFields || {};

        const possibleKeys = [
            "phone",
            "phoneNumber",
            "contactNumber",
            "mobile",
            "mobileNumber"
        ];

        for (const key of possibleKeys) {

            if (
                fields[key] !== undefined &&
                fields[key] !== null &&
                String(fields[key]).trim() !== ""
            ) {

                return String(
                    fields[key]
                );

            }

        }

        return "";

    };

    // =====================================================
    // VIEW EMPLOYEE
    // =====================================================

    const handleViewEmployee = (employee) => {

        setSelectedEmployee(employee);

    };

    // =====================================================
    // ADD EMPLOYEE
    // =====================================================

    const handleAddEmployee = () => {

        if (
            selectedCompany &&
            selectedCompany !== "all"
        ) {

            navigate(
                `/AddEmployee/${selectedCompany}`
            );

            return;

        }

        if (companies.length === 1) {

            navigate(
                `/AddEmployee/${companies[0]._id}`
            );

            return;

        }

        toast(
            "Please select a company first."
        );

    };

    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    const clearSearch = () => {

        setSearch("");

    };

    return (

        <div className="me-root">

            <style>{`

                .me-root {
                    min-height: 100vh;
                    background: #14140f;
                    color: #f1ede3;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        sans-serif;
                }

                .me-root * {
                    box-sizing: border-box;
                }

                .me-header {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background: #14140f;
                    border-bottom:
                        1px solid #26251c;
                }

                .me-header-inner {
                    max-width: 1180px;
                    margin: 0 auto;
                    padding:
                        16px 24px;
                    display: flex;
                    align-items: center;
                    justify-content:
                        space-between;
                    gap: 16px;
                }

                .me-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }

                .me-back-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 11px;
                    border:
                        1px solid #34332a;
                    background: #1d1d17;
                    color: #a79e8c;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition:
                        border-color .2s,
                        color .2s;
                    flex-shrink: 0;
                }

                .me-back-btn:hover {
                    border-color: #d9a455;
                    color: #d9a455;
                }

                .me-title-wrap {
                    min-width: 0;
                }

                .me-title {
                    margin: 0;
                    font-family: Fraunces, serif;
                    font-size: 20px;
                    font-weight: 600;
                }

                .me-subtitle {
                    margin: 2px 0 0;
                    color: #a79e8c;
                    font-size: 12px;
                }

                .me-main {
                    max-width: 1180px;
                    margin: 0 auto;
                    padding:
                        32px 24px 64px;
                }

                .me-top-card {
                    border:
                        1px solid #34332a;
                    background: #1d1d17;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 20px;
                }

                .me-top-row {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                @media (min-width: 768px) {
                    .me-top-row {
                        flex-direction: row;
                        align-items: center;
                        justify-content:
                            space-between;
                    }
                }

                .me-heading {
                    margin: 0;
                    font-family: Fraunces, serif;
                    font-size: 27px;
                    font-weight: 600;
                }

                .me-description {
                    margin: 7px 0 0;
                    color: #a79e8c;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .me-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    border-radius: 12px;
                    background: #d9a455;
                    color: #1a1408;
                    padding: 12px 18px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: inherit;
                    white-space: nowrap;
                }

                .me-primary-btn:hover {
                    filter: brightness(1.08);
                }

                .me-toolbar {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                @media (min-width: 768px) {
                    .me-toolbar {
                        grid-template-columns:
                            minmax(0, 1fr) 250px auto;
                    }
                }

                .me-search {
                    height: 46px;
                    position: relative;
                }

                .me-search svg {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform:
                        translateY(-50%);
                    color: #736a5a;
                    pointer-events: none;
                }

                .me-search input {
                    width: 100%;
                    height: 100%;
                    border-radius: 12px;
                    border:
                        1px solid #34332a;
                    background: #1d1d17;
                    color: #f1ede3;
                    outline: none;
                    padding:
                        0 42px 0 42px;
                    font-size: 13px;
                    font-family: inherit;
                }

                .me-search input:focus {
                    border-color: #d9a455;
                }

                .me-clear-search {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform:
                        translateY(-50%);
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    color: #736a5a;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .me-filter {
                    height: 46px;
                    border-radius: 12px;
                    border:
                        1px solid #34332a;
                    background: #1d1d17;
                    color: #f1ede3;
                    padding: 0 13px;
                    outline: none;
                    font-family: inherit;
                    font-size: 13px;
                    cursor: pointer;
                }

                .me-filter:focus {
                    border-color: #d9a455;
                }

                .me-refresh {
                    height: 46px;
                    width: 46px;
                    border-radius: 12px;
                    border:
                        1px solid #34332a;
                    background: #1d1d17;
                    color: #a79e8c;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .me-refresh:hover {
                    border-color: #d9a455;
                    color: #d9a455;
                }

                .me-content {
                    border:
                        1px solid #34332a;
                    background: #1d1d17;
                    border-radius: 18px;
                    overflow: hidden;
                }

                .me-content-head {
                    padding: 17px 20px;
                    border-bottom:
                        1px solid #34332a;
                    display: flex;
                    align-items: center;
                    justify-content:
                        space-between;
                    gap: 12px;
                }

                .me-count {
                    font-size: 13px;
                    color: #a79e8c;
                }

                .me-count strong {
                    color: #f1ede3;
                }

                .me-loading {
                    min-height: 300px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: #a79e8c;
                    font-size: 13px;
                }

                .me-spinner {
                    animation:
                        me-spin .8s linear infinite;
                    color: #d9a455;
                }

                @keyframes me-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                .me-empty {
                    min-height: 300px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    text-align: center;
                }

                .me-empty-icon {
                    width: 58px;
                    height: 58px;
                    border-radius: 16px;
                    background:
                        rgba(111,190,149,.12);
                    color: #6fbe95;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .me-empty-title {
                    margin: 17px 0 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .me-empty-text {
                    margin: 7px 0 0;
                    color: #a79e8c;
                    font-size: 13px;
                    max-width: 390px;
                    line-height: 1.6;
                }

                .me-list {
                    display: flex;
                    flex-direction: column;
                }

                .me-row {
                    padding: 18px 20px;
                    border-bottom:
                        1px solid #26251c;
                    display: grid;
                    gap: 16px;
                    align-items: center;
                }

                @media (min-width: 900px) {
                    .me-row {
                        grid-template-columns:
                            minmax(220px, 1.4fr)
                            minmax(150px, 1fr)
                            minmax(170px, 1fr)
                            auto;
                    }
                }

                .me-row:last-child {
                    border-bottom: none;
                }

                .me-row:hover {
                    background: #202019;
                }

                .me-employee {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }

                .me-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: #302f25;
                    color: #d9a455;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .me-employee-info {
                    min-width: 0;
                }

                .me-employee-name {
                    margin: 0;
                    font-size: 13.5px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .me-employee-id {
                    margin: 4px 0 0;
                    font-size: 11.5px;
                    color: #a79e8c;
                }

                .me-company {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #a79e8c;
                    font-size: 12.5px;
                }

                .me-company svg {
                    color: #736a5a;
                    flex-shrink: 0;
                }

                .me-contact {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .me-contact-item {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    color: #a79e8c;
                    font-size: 11.5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .me-contact-item svg {
                    flex-shrink: 0;
                    color: #736a5a;
                }

                .me-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    border-radius: 999px;
                    padding: 5px 10px;
                    background:
                        rgba(111,190,149,.12);
                    color: #6fbe95;
                    font-size: 10.5px;
                    font-weight: 600;
                }

                .me-status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #6fbe95;
                }

                .me-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .me-action {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    border:
                        1px solid #34332a;
                    background: #26261e;
                    color: #a79e8c;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .me-action:hover {
                    border-color: #d9a455;
                    color: #d9a455;
                }

                /* MODAL */

                .me-modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    background:
                        rgba(0,0,0,.62);
                    backdrop-filter: blur(3px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .me-modal {
                    width: 100%;
                    max-width: 500px;
                    max-height: 88vh;
                    overflow-y: auto;
                    border-radius: 20px;
                    border:
                        1px solid #34332a;
                    background: #1d1d17;
                    box-shadow:
                        0 25px 70px
                        rgba(0,0,0,.45);
                }

                .me-modal-head {
                    padding: 19px 21px;
                    border-bottom:
                        1px solid #34332a;
                    display: flex;
                    align-items: center;
                    justify-content:
                        space-between;
                }

                .me-modal-title {
                    margin: 0;
                    font-family: Fraunces, serif;
                    font-size: 18px;
                    font-weight: 600;
                }

                .me-modal-close {
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    border:
                        1px solid #34332a;
                    background: #26261e;
                    color: #a79e8c;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .me-modal-close:hover {
                    color: #f1ede3;
                    border-color: #736a5a;
                }

                .me-modal-body {
                    padding: 21px;
                }

                .me-modal-profile {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    margin-bottom: 20px;
                }

                .me-modal-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    background: #302f25;
                    color: #d9a455;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .me-modal-name {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .me-modal-id {
                    margin: 4px 0 0;
                    font-size: 12px;
                    color: #a79e8c;
                }

                .me-modal-info {
                    border:
                        1px solid #34332a;
                    background: #26261e;
                    border-radius: 14px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 13px;
                }

                .me-modal-info-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    color: #a79e8c;
                    font-size: 12.5px;
                }

                .me-modal-info-row svg {
                    color: #736a5a;
                    flex-shrink: 0;
                    margin-top: 1px;
                }

                .me-modal-section {
                    margin-top: 20px;
                }

                .me-modal-section-title {
                    margin: 0 0 10px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #d9a455;
                    text-transform: uppercase;
                    letter-spacing: .05em;
                }

                .me-field-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .me-field {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 15px;
                    border-bottom:
                        1px solid #26251c;
                    padding-bottom: 8px;
                }

                .me-field:last-child {
                    border-bottom: none;
                }

                .me-field-label {
                    font-size: 11.5px;
                    color: #736a5a;
                }

                .me-field-value {
                    text-align: right;
                    font-size: 12px;
                    color: #f1ede3;
                    word-break: break-word;
                }

            `}</style>

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="me-header">

                <div className="me-header-inner">

                    <div className="me-header-left">

                        <button
                            type="button"
                            className="me-back-btn"
                            onClick={() =>
                                navigate("/Dashboard")
                            }
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="me-title-wrap">

                            <h1 className="me-title">
                                Manage Employees
                            </h1>

                            <p className="me-subtitle">
                                Employee management
                            </p>

                        </div>

                    </div>

                </div>

            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="me-main">

                {/* TOP CARD */}

                <div className="me-top-card">

                    <div className="me-top-row">

                        <div>

                            <h2 className="me-heading">
                                Employees
                            </h2>

                            <p className="me-description">
                                View and manage employees
                                registered under your companies.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="me-primary-btn"
                            onClick={
                                handleAddEmployee
                            }
                        >
                            <Plus size={17} />
                            Add employee
                        </button>

                    </div>

                </div>

                {/* TOOLBAR */}

                <div className="me-toolbar">

                    {/* SEARCH */}

                    <div className="me-search">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search employee, ID, company..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                        {search && (

                            <button
                                type="button"
                                className="me-clear-search"
                                onClick={
                                    clearSearch
                                }
                            >
                                <X size={15} />
                            </button>

                        )}

                    </div>

                    {/* COMPANY FILTER */}

                    <select
                        className="me-filter"
                        value={selectedCompany}
                        onChange={(e) =>
                            setSelectedCompany(
                                e.target.value
                            )
                        }
                    >

                        <option value="all">
                            All companies
                        </option>

                        {companies.map(
                            (company) => (

                                <option
                                    key={company._id}
                                    value={
                                        company._id
                                    }
                                >
                                    {company.name}
                                </option>

                            )
                        )}

                    </select>

                    {/* REFRESH */}

                    <button
                        type="button"
                        className="me-refresh"
                        onClick={
                            fetchEmployees
                        }
                        title="Refresh employees"
                    >
                        <RefreshCw size={17} />
                    </button>

                </div>

                {/* CONTENT */}

                <div className="me-content">

                    <div className="me-content-head">

                        <span className="me-count">

                            Showing{" "}

                            <strong>
                                {
                                    filteredEmployees.length
                                }
                            </strong>{" "}

                            employee
                            {filteredEmployees.length !== 1
                                ? "s"
                                : ""}

                        </span>

                    </div>

                    {/* LOADING */}

                    {loading && (

                        <div className="me-loading">

                            <Loader2
                                size={27}
                                className="me-spinner"
                            />

                            Loading employees...

                        </div>

                    )}

                    {/* EMPTY */}

                    {!loading &&
                        filteredEmployees.length === 0 && (

                            <div className="me-empty">

                                <div className="me-empty-icon">
                                    <Users size={27} />
                                </div>

                                <h3 className="me-empty-title">

                                    {search
                                        ? "No employees found"
                                        : "No employees yet"}

                                </h3>

                                <p className="me-empty-text">

                                    {search
                                        ? "Try a different search term."
                                        : "Add an employee to a company and they will appear here."}

                                </p>

                                {!search && (

                                    <button
                                        type="button"
                                        className="me-primary-btn"
                                        style={{
                                            marginTop:
                                                "20px"
                                        }}
                                        onClick={
                                            handleAddEmployee
                                        }
                                    >
                                        <Plus size={17} />
                                        Add employee
                                    </button>

                                )}

                            </div>

                        )}

                    {/* EMPLOYEE LIST */}

                    {!loading &&
                        filteredEmployees.length > 0 && (

                            <div className="me-list">

                                {filteredEmployees.map(
                                    (employee) => {

                                        const name =
                                            getEmployeeName(
                                                employee
                                            );

                                        const email =
                                            getEmployeeEmail(
                                                employee
                                            );

                                        const phone =
                                            getEmployeePhone(
                                                employee
                                            );

                                        return (

                                            <div
                                                key={
                                                    employee._id
                                                }
                                                className="me-row"
                                            >

                                                {/* EMPLOYEE */}

                                                <div className="me-employee">

                                                    <div className="me-avatar">

                                                        <UserRound
                                                            size={
                                                                20
                                                            }
                                                        />

                                                    </div>

                                                    <div className="me-employee-info">

                                                        <p className="me-employee-name">
                                                            {
                                                                name
                                                            }
                                                        </p>

                                                        <p className="me-employee-id">

                                                            ID:{" "}

                                                            {
                                                                employee.employeeId
                                                            }

                                                        </p>

                                                    </div>

                                                </div>

                                                {/* COMPANY */}

                                                <div className="me-company">

                                                    <Building2
                                                        size={
                                                            15
                                                        }
                                                    />

                                                    <span>

                                                        {
                                                            employee
                                                                .companyId
                                                                ?.name ||
                                                            "Unknown company"
                                                        }

                                                    </span>

                                                </div>

                                                {/* CONTACT */}

                                                <div className="me-contact">

                                                    {email && (

                                                        <div className="me-contact-item">

                                                            <Mail
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    email
                                                                }
                                                            </span>

                                                        </div>

                                                    )}

                                                    {phone && (

                                                        <div className="me-contact-item">

                                                            <Phone
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    phone
                                                                }
                                                            </span>

                                                        </div>

                                                    )}

                                                    {!email &&
                                                        !phone && (

                                                            <span className="me-contact-item">

                                                                No contact
                                                                details

                                                            </span>

                                                        )}

                                                </div>

                                                {/* ACTIONS */}

                                                <div className="me-actions">

                                                    <span className="me-status">

                                                        <span className="me-status-dot" />

                                                        {employee.status ||
                                                            "active"}

                                                    </span>

                                                    {/* ONLY VIEW */}

                                                    <button
                                                        type="button"
                                                        className="me-action"
                                                        title="View employee"
                                                        onClick={() =>
                                                            handleViewEmployee(
                                                                employee
                                                            )
                                                        }
                                                    >

                                                        <Eye
                                                            size={
                                                                16
                                                            }
                                                        />

                                                    </button>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                </div>

            </main>

            {/* =================================================
                EMPLOYEE VIEW MODAL
            ================================================= */}

            {selectedEmployee && (

                <div
                    className="me-modal-backdrop"
                    onMouseDown={() =>
                        setSelectedEmployee(null)
                    }
                >

                    <div
                        className="me-modal"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="me-modal-head">

                            <h3 className="me-modal-title">
                                Employee details
                            </h3>

                            <button
                                type="button"
                                className="me-modal-close"
                                onClick={() =>
                                    setSelectedEmployee(
                                        null
                                    )
                                }
                            >
                                <X size={17} />
                            </button>

                        </div>

                        <div className="me-modal-body">

                            <div className="me-modal-profile">

                                <div className="me-modal-avatar">

                                    <UserRound
                                        size={23}
                                    />

                                </div>

                                <div>

                                    <h4 className="me-modal-name">

                                        {
                                            getEmployeeName(
                                                selectedEmployee
                                            )
                                        }

                                    </h4>

                                    <p className="me-modal-id">

                                        Employee ID:{" "}

                                        {
                                            selectedEmployee.employeeId
                                        }

                                    </p>

                                </div>

                            </div>

                            <div className="me-modal-info">

                                <div className="me-modal-info-row">

                                    <Building2 size={15} />

                                    <span>

                                        <strong>
                                            Company:
                                        </strong>{" "}

                                        {
                                            selectedEmployee
                                                .companyId
                                                ?.name ||
                                            "Unknown company"
                                        }

                                    </span>

                                </div>

                                {getEmployeeEmail(
                                    selectedEmployee
                                ) && (

                                    <div className="me-modal-info-row">

                                        <Mail size={15} />

                                        <span>

                                            {
                                                getEmployeeEmail(
                                                    selectedEmployee
                                                )
                                            }

                                        </span>

                                    </div>

                                )}

                                {getEmployeePhone(
                                    selectedEmployee
                                ) && (

                                    <div className="me-modal-info-row">

                                        <Phone size={15} />

                                        <span>

                                            {
                                                getEmployeePhone(
                                                    selectedEmployee
                                                )
                                            }

                                        </span>

                                    </div>

                                )}

                                <div className="me-modal-info-row">

                                    <FileText
                                        size={15}
                                    />

                                    <span>

                                        Template:{" "}

                                        {
                                            selectedEmployee
                                                .companyId
                                                ?.templateId
                                                ?.templateName ||
                                            "Not available"
                                        }

                                    </span>

                                </div>

                            </div>

                            {/* EMPLOYEE FIELDS */}

                            {selectedEmployee.employeeFields &&
                                Object.keys(
                                    selectedEmployee.employeeFields
                                ).length > 0 && (

                                    <div className="me-modal-section">

                                        <p className="me-modal-section-title">
                                            Employee information
                                        </p>

                                        <div className="me-field-list">

                                            {Object.entries(
                                                selectedEmployee.employeeFields
                                            ).map(
                                                ([key, value]) => (

                                                    <div
                                                        className="me-field"
                                                        key={key}
                                                    >

                                                        <span className="me-field-label">
                                                            {key}
                                                        </span>

                                                        <span className="me-field-value">

                                                            {String(
                                                                value ??
                                                                "-"
                                                            )}

                                                        </span>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}