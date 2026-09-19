import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Building2,
  Users,
  FileText,
  IndianRupee,
  Plus,
  ArrowRight,
  LayoutDashboard,
  Mail,
  Phone,
  MapPin,
  Globe,
  X,
  Pencil,
  UserPlus,
  ChevronRight,
  Loader2,
  Moon,
  Sun,
  Files,
} from "lucide-react";

const API_URL = "http://localhost:3000";

export default function Dashboard() {
  const navigate = useNavigate();

  // =========================
  // THEME
  // =========================
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("cc-theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("cc-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // =========================
  // COMPANY STATE
  // =========================
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // =========================
  // FETCH COMPANIES
  // =========================
  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);

      const response = await axios.get(`${API_URL}/api/company`, {
        withCredentials: true,
      });

      setCompanies(response.data?.companies || []);
    } catch (error) {
      console.error("Fetch companies error:", error);

      toast.error(
        error.response?.data?.message || "Unable to load companies"
      );
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // =========================
  // STATS
  // =========================
  const stats = [
    {
      title: "Total Companies",
      value: companies.length,
      icon: Building2,
      description: "Companies added",
    },
    {
      title: "Total Employees",
      value: "0",
      icon: Users,
      description: "Employees registered",
    },
    {
      title: "Payslips Generated",
      value: "0",
      icon: FileText,
      description: "Payslips created",
    },
    {
      title: "Total Payroll",
      value: "₹0",
      icon: IndianRupee,
      description: "Monthly payroll",
    },
  ];

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    setSelectedCompany(null);
  };

  // =========================
  // EDIT COMPANY
  // =========================
  const handleEditCompany = () => {
    if (!selectedCompany) return;

    navigate(`/EditCompany/${selectedCompany._id}`);
  };

  // =========================
  // ADD EMPLOYEE
  // =========================
  const handleAddEmployee = () => {
    if (!selectedCompany) return;

    navigate(`/AddEmployee/${selectedCompany._id}`);
  };

  // =========================
  // MANAGE EMPLOYEES
  // =========================
  const handleManageEmployees = () => {
    navigate("/ManageEmployees");
  };

  // =========================
  // MANAGE COMPANY EMPLOYEES
  // =========================
  const handleManageCompanyEmployees = () => {
    if (!selectedCompany) return;

    navigate(`/ManageEmployees?companyId=${selectedCompany._id}`);
  };

  // =========================
  // VIEW TEMPLATES
  // =========================
  const handleViewTemplates = () => {
    navigate("/Templates");
  };

  return (
    <div className="cc-root" data-theme={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .cc-root {
          --font-serif: 'Fraunces', serif;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          font-family: var(--font-sans);
          transition: background 0.25s ease, color 0.25s ease;
        }

        .cc-root[data-theme="dark"] {
          --bg: #14140f;
          --surface: #1d1d17;
          --surface-2: #26261e;
          --surface-3: #302f25;
          --text: #f1ede3;
          --text-muted: #a79e8c;
          --text-faint: #736a5a;
          --border: #34332a;
          --border-soft: #26251c;
          --accent: #d9a455;
          --accent-strong: #f0be79;
          --accent-text: #1a1408;
          --success: #6fbe95;
          --success-bg: rgba(111, 190, 149, 0.12);
          --danger: #e08683;
          --shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.6);
        }

        .cc-root[data-theme="light"] {
          --bg: #f6f3ec;
          --surface: #ffffff;
          --surface-2: #efeae0;
          --surface-3: #e5dfd1;
          --text: #1b1b18;
          --text-muted: #6b6558;
          --text-faint: #918a78;
          --border: #ddd6c7;
          --border-soft: #e8e2d4;
          --accent: #9c6b2e;
          --accent-strong: #7a4f1d;
          --accent-text: #ffffff;
          --success: #3f7a5c;
          --success-bg: rgba(63, 122, 92, 0.08);
          --danger: #b0413e;
          --shadow: 0 20px 40px -24px rgba(27, 27, 24, 0.25);
        }

        .cc-root {
          background: var(--bg);
          color: var(--text);
        }

        .cc-root * {
          box-sizing: border-box;
        }

        /* ===== HEADER ===== */

        .db-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--bg);
          border-bottom: 1px solid var(--border-soft);
        }

        .db-header-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .db-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .db-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--accent);
          color: var(--accent-text);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .db-title {
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .db-subtitle {
          font-size: 12px;
          color: var(--text-muted);
          margin: 1px 0 0;
        }

        .db-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .db-profile {
          display: none;
          text-align: right;
        }

        @media (min-width: 640px) {
          .db-profile {
            display: block;
          }
        }

        .db-profile-name {
          font-size: 13.5px;
          font-weight: 500;
          margin: 0;
        }

        .db-profile-role {
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 1px 0 0;
        }

        .db-avatar {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: var(--surface-3);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          border: 1px solid var(--border);
        }

        .db-theme-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.25s, border-color 0.2s;
        }

        .db-theme-btn:hover {
          border-color: var(--accent);
          transform: rotate(20deg);
        }

        .db-main {
          max-width: 1180px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }

        /* ===== WELCOME ===== */

        .db-welcome {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          border-radius: 20px;
          border: 1px solid var(--border-soft);
          background: var(--surface);
          padding: 28px;
          box-shadow: var(--shadow);
        }

        @media (min-width: 768px) {
          .db-welcome {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .db-welcome-eyebrow {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--accent);
          margin: 0 0 8px;
        }

        .db-welcome-title {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .db-welcome-desc {
          font-size: 13.5px;
          color: var(--text-muted);
          margin: 8px 0 0;
          max-width: 460px;
          line-height: 1.6;
        }

        .db-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
          background: var(--accent);
          color: var(--accent-text);
          border: none;
          border-radius: 12px;
          padding: 13px 22px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.2s, transform 0.1s;
          font-family: var(--font-sans);
        }

        .db-btn-primary:hover {
          filter: brightness(1.08);
        }

        .db-btn-primary:active {
          transform: scale(0.98);
        }

        /* ===== STATS ===== */

        .db-stats-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
          margin-bottom: 32px;
        }

        @media (min-width: 640px) {
          .db-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 1024px) {
          .db-stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .db-stat-card {
          border-radius: 16px;
          border: 1px solid var(--border-soft);
          background: var(--surface);
          padding: 20px;
          transition: border-color 0.2s, transform 0.15s;
        }

        .db-stat-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .db-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--success-bg);
          color: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .db-stat-title {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .db-stat-value {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 600;
          margin: 4px 0 0;
        }

        .db-stat-desc {
          font-size: 11.5px;
          color: var(--text-faint);
          margin: 4px 0 0;
        }

        /* ===== SECTIONS ===== */

        .db-section {
          margin-bottom: 32px;
        }

        .db-section-head {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (min-width: 640px) {
          .db-section-head {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .db-section-title {
          font-size: 17px;
          font-weight: 600;
          margin: 0;
        }

        .db-section-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin: 3px 0 0;
        }

        .db-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s;
          font-family: var(--font-sans);
        }

        .db-btn-secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* ===== LOADING / EMPTY ===== */

        .db-loading-box {
          min-height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          border: 1px solid var(--border-soft);
          background: var(--surface);
        }

        .db-loading-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
        }

        .db-spin {
          animation: db-spin 0.8s linear infinite;
          color: var(--accent);
        }

        @keyframes db-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .db-empty-box {
          border-radius: 18px;
          border: 1.5px dashed var(--border);
          background: var(--surface);
          padding: 48px 24px;
          text-align: center;
        }

        .db-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--success-bg);
          color: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .db-empty-title {
          font-size: 17px;
          font-weight: 600;
          margin: 18px 0 0;
        }

        .db-empty-desc {
          font-size: 13.5px;
          color: var(--text-muted);
          margin: 8px auto 0;
          max-width: 380px;
          line-height: 1.6;
        }

        /* ===== COMPANY CARDS ===== */

        .db-company-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }

        @media (min-width: 768px) {
          .db-company-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 1280px) {
          .db-company-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .db-company-card {
          width: 100%;
          text-align: left;
          border-radius: 18px;
          border: 1px solid var(--border-soft);
          background: var(--surface);
          padding: 20px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
          font-family: var(--font-sans);
        }

        .db-company-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }

        .db-company-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .db-company-left {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 12px;
        }

        .db-company-logo {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .db-company-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
        }

        .db-company-name {
          font-size: 14.5px;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-company-email {
          font-size: 12px;
          color: var(--text-muted);
          margin: 3px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-chevron {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          color: var(--text-faint);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, color 0.2s;
        }

        .db-company-card:hover .db-chevron {
          background: var(--success-bg);
          color: var(--success);
        }

        .db-divider {
          height: 1px;
          background: var(--border-soft);
          margin: 18px 0;
        }

        .db-detail-row {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12.5px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .db-detail-row:last-child {
          margin-bottom: 0;
        }

        .db-detail-row svg {
          flex-shrink: 0;
          color: var(--text-faint);
        }

        .db-company-bottom {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .db-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          background: var(--success-bg);
          color: var(--success);
        }

        .db-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--success);
        }

        .db-manage-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-faint);
        }

        .db-company-card:hover .db-manage-label {
          color: var(--accent);
        }

        /* ===== QUICK ACTIONS ===== */

        .db-quick-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }

        @media (min-width: 640px) {
          .db-quick-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 1024px) {
          .db-quick-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .db-quick-card {
          border-radius: 18px;
          border: 1px solid var(--border-soft);
          background: var(--surface);
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s;
          font-family: var(--font-sans);
          width: 100%;
        }

        .db-quick-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .db-quick-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--success-bg);
          color: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .db-quick-icon.cc-muted {
          background: var(--surface-3);
          color: var(--text-faint);
        }

        .db-quick-title {
          font-size: 14.5px;
          font-weight: 600;
          margin: 0;
        }

        .db-quick-desc {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 4px 0 0;
        }

        .db-quick-cta {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--accent);
        }

        /* ===== MODAL ===== */

        .cc-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(10, 9, 6, 0.55);
          backdrop-filter: blur(3px);
          animation: cc-fade-in 0.18s ease;
        }

        .cc-modal {
          width: 100%;
          max-width: 440px;
          max-height: 88vh;
          overflow-y: auto;
          background: var(--surface);
          border: 1px solid var(--border-soft);
          border-radius: 20px;
          box-shadow: var(--shadow);
          animation: cc-modal-in 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes cc-fade-in {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes cc-modal-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .db-modal-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid var(--border-soft);
        }

        .db-modal-head-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .db-modal-logo {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .db-modal-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
        }

        .db-modal-title {
          font-family: var(--font-serif);
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-modal-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin: 2px 0 0;
        }

        .cc-modal-close {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: color 0.2s, border-color 0.2s;
        }

        .cc-modal-close:hover {
          color: var(--text);
          border-color: var(--text-muted);
        }

        .db-modal-body {
          padding: 22px;
        }

        .db-modal-info {
          border-radius: 14px;
          border: 1px solid var(--border-soft);
          background: var(--surface-2);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .db-modal-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .db-modal-row svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: var(--text-faint);
        }

        .db-modal-actions {
          margin-top: 20px;
          display: grid;
          gap: 12px;
        }

        @media (min-width: 480px) {
          .db-modal-actions {
            grid-template-columns: 1fr 1fr;
          }
        }

        .db-modal-action {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 14px;
          border: 1px solid var(--border-soft);
          background: var(--surface-2);
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          font-family: var(--font-sans);
        }

        .db-modal-action:hover {
          border-color: var(--accent);
          background: var(--surface);
        }

        .db-modal-action-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .db-modal-action-title {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .db-modal-action-desc {
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 2px 0 0;
        }

        .db-modal-footer {
          border-top: 1px solid var(--border-soft);
          padding: 16px 22px;
        }

        .db-btn-close-modal {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text-muted);
          border-radius: 12px;
          padding: 11px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          font-family: var(--font-sans);
        }

        .db-btn-close-modal:hover {
          border-color: var(--text-muted);
          color: var(--text);
        }
      `}</style>

      {/* ================= NAVBAR ================= */}

      <header className="db-header">
        <div className="db-header-inner">
          <div className="db-logo">
            <div className="db-logo-icon">
              <LayoutDashboard size={20} />
            </div>

            <div>
              <h1 className="db-title">Payslip Generator</h1>
              <p className="db-subtitle">Admin panel</p>
            </div>
          </div>

          <div className="db-header-right">
            <div className="db-profile">
              <p className="db-profile-name">Admin</p>
              <p className="db-profile-role">Administrator</p>
            </div>

            <div className="db-avatar">A</div>

            <button
              type="button"
              className="db-theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark and light mode"
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="db-main">

        {/* ================= WELCOME ================= */}

        <div className="db-welcome">
          <div>
            <p className="db-welcome-eyebrow">
              Admin dashboard
            </p>

            <h2 className="db-welcome-title">
              Welcome back, Admin
            </h2>

            <p className="db-welcome-desc">
              Manage your companies, employees and payslips
              from one place.
            </p>
          </div>

          <button
            onClick={() => navigate("/CreateCompany")}
            className="db-btn-primary"
          >
            <Plus size={18} />
            Create company
          </button>
        </div>

        {/* ================= STATS ================= */}

        <div className="db-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="db-stat-card"
              >
                <div className="db-stat-icon">
                  <Icon size={21} />
                </div>

                <p className="db-stat-title">
                  {stat.title}
                </p>

                <h3 className="db-stat-value">
                  {stat.value}
                </h3>

                <p className="db-stat-desc">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ================= COMPANIES ================= */}

        <section className="db-section">
          <div className="db-section-head">
            <div>
              <h3 className="db-section-title">
                Your companies
              </h3>

              <p className="db-section-desc">
                Select a company to manage its profile and employees.
              </p>
            </div>

            {companies.length > 0 && (
              <button
                onClick={() => navigate("/CreateCompany")}
                className="db-btn-secondary"
              >
                <Plus size={16} />
                Add company
              </button>
            )}
          </div>

          {/* LOADING */}

          {loadingCompanies && (
            <div className="db-loading-box">
              <div className="db-loading-inner">
                <Loader2
                  size={26}
                  className="db-spin"
                />

                <p style={{ fontSize: "13px" }}>
                  Loading companies...
                </p>
              </div>
            </div>
          )}

          {/* EMPTY */}

          {!loadingCompanies &&
            companies.length === 0 && (
              <div className="db-empty-box">
                <div className="db-empty-icon">
                  <Building2 size={26} />
                </div>

                <h4 className="db-empty-title">
                  No companies yet
                </h4>

                <p className="db-empty-desc">
                  Create your first company to start adding
                  employees and generating professional payslips.
                </p>

                <button
                  onClick={() => navigate("/CreateCompany")}
                  className="db-btn-primary"
                  style={{ marginTop: "22px" }}
                >
                  <Plus size={17} />
                  Create company
                </button>
              </div>
            )}

          {/* COMPANY CARDS */}

          {!loadingCompanies &&
            companies.length > 0 && (
              <div className="db-company-grid">
                {companies.map((company) => (
                  <button
                    key={company._id}
                    type="button"
                    onClick={() =>
                      setSelectedCompany(company)
                    }
                    className="db-company-card"
                  >
                    <div className="db-company-top">
                      <div className="db-company-left">
                        <div className="db-company-logo">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.name}
                            />
                          ) : (
                            <Building2
                              size={22}
                              style={{
                                color:
                                  "var(--text-faint)",
                              }}
                            />
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <h4 className="db-company-name">
                            {company.name}
                          </h4>

                          <p className="db-company-email">
                            {company.email}
                          </p>
                        </div>
                      </div>

                      <div className="db-chevron">
                        <ChevronRight size={17} />
                      </div>
                    </div>

                    <div className="db-divider" />

                    <div>
                      <div className="db-detail-row">
                        <Phone size={13} />
                        <span>
                          {company.contactNumber ||
                            "No contact number"}
                        </span>
                      </div>

                      <div className="db-detail-row">
                        <MapPin size={13} />
                        <span>
                          {company.address ||
                            "No address available"}
                        </span>
                      </div>
                    </div>

                    <div className="db-company-bottom">
                      <span className="db-status-badge">
                        <span className="db-status-dot" />

                        {company.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                      <span className="db-manage-label">
                        Manage company
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="db-section">
          <h3
            className="db-section-title"
            style={{ marginBottom: "18px" }}
          >
            Quick actions
          </h3>

          <div className="db-quick-grid">

            {/* ADD COMPANY */}

            <button
              onClick={() => navigate("/CreateCompany")}
              className="db-quick-card"
            >
              <div className="db-quick-icon">
                <Plus size={20} />
              </div>

              <h4 className="db-quick-title">
                Add company
              </h4>

              <p className="db-quick-desc">
                Create a new company profile
              </p>

              <div className="db-quick-cta">
                Continue
                <ArrowRight size={15} />
              </div>
            </button>

            {/* MANAGE EMPLOYEES */}

            <button
              type="button"
              onClick={handleManageEmployees}
              className="db-quick-card"
            >
              <div className="db-quick-icon">
                <Users size={20} />
              </div>

              <h4 className="db-quick-title">
                Manage employees
              </h4>

              <p className="db-quick-desc">
                View and manage all registered employees
              </p>

              <div className="db-quick-cta">
                Manage employees
                <ArrowRight size={15} />
              </div>
            </button>

            {/* SALARY TEMPLATES */}

            <button
              type="button"
              onClick={handleViewTemplates}
              className="db-quick-card"
            >
              <div className="db-quick-icon">
                <Files size={20} />
              </div>

              <h4 className="db-quick-title">
                Salary templates
              </h4>

              <p className="db-quick-desc">
                View available payslip templates
              </p>

              <div className="db-quick-cta">
                View templates
                <ArrowRight size={15} />
              </div>
            </button>

          </div>
        </section>
      </main>

      {/* ================= COMPANY MODAL ================= */}

      {selectedCompany && (
        <div
          className="cc-modal-backdrop"
          onMouseDown={closeModal}
        >
          <div
            className="cc-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="db-modal-head">
              <div className="db-modal-head-left">

                <div className="db-modal-logo">
                  {selectedCompany.logoUrl ? (
                    <img
                      src={selectedCompany.logoUrl}
                      alt={selectedCompany.name}
                    />
                  ) : (
                    <Building2
                      size={20}
                      style={{
                        color: "var(--text-faint)",
                      }}
                    />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3 className="db-modal-title">
                    {selectedCompany.name}
                  </h3>

                  <p className="db-modal-sub">
                    Company management
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="cc-modal-close"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="db-modal-body">

              <div className="db-modal-info">

                <div className="db-modal-row">
                  <Mail size={14} />
                  <span>
                    {selectedCompany.email}
                  </span>
                </div>

                <div className="db-modal-row">
                  <Phone size={14} />
                  <span>
                    {selectedCompany.contactNumber ||
                      "No contact number"}
                  </span>
                </div>

                <div className="db-modal-row">
                  <MapPin size={14} />
                  <span>
                    {selectedCompany.address ||
                      "No address available"}
                  </span>
                </div>

                {selectedCompany.website && (
                  <div className="db-modal-row">
                    <Globe size={14} />
                    <span>
                      {selectedCompany.website}
                    </span>
                  </div>
                )}

              </div>

              <div className="db-modal-actions">

                {/* EDIT COMPANY */}

                <button
                  type="button"
                  onClick={handleEditCompany}
                  className="db-modal-action"
                >
                  <div
                    className="db-modal-action-icon"
                    style={{
                      background:
                        "var(--success-bg)",
                      color:
                        "var(--success)",
                    }}
                  >
                    <Pencil size={16} />
                  </div>

                  <div>
                    <p className="db-modal-action-title">
                      Edit company
                    </p>

                    <p className="db-modal-action-desc">
                      Update company details
                    </p>
                  </div>
                </button>

                {/* ADD EMPLOYEE */}

                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="db-modal-action"
                >
                  <div
                    className="db-modal-action-icon"
                    style={{
                      background:
                        "var(--surface-3)",
                      color:
                        "var(--accent)",
                    }}
                  >
                    <UserPlus size={16} />
                  </div>

                  <div>
                    <p className="db-modal-action-title">
                      Add employee
                    </p>

                    <p className="db-modal-action-desc">
                      Add employee to company
                    </p>
                  </div>
                </button>

                {/* MANAGE EMPLOYEES */}

                <button
                  type="button"
                  onClick={
                    handleManageCompanyEmployees
                  }
                  className="db-modal-action"
                >
                  <div
                    className="db-modal-action-icon"
                    style={{
                      background:
                        "var(--success-bg)",
                      color:
                        "var(--success)",
                    }}
                  >
                    <Users size={16} />
                  </div>

                  <div>
                    <p className="db-modal-action-title">
                      Manage employees
                    </p>

                    <p className="db-modal-action-desc">
                      View employees of this company
                    </p>
                  </div>
                </button>

              </div>
            </div>

            <div className="db-modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="db-btn-close-modal"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
