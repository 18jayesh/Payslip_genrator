import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Building2,
  Users,
  Plus,
  LayoutDashboard,
  Mail,
  Phone,
  MapPin,
  Globe,
  X,
  Pencil,
  UserPlus,
  ChevronRight,
  Moon,
  Sun,
  Files,
} from "lucide-react";

const API_URL = "http://localhost:3000";

// =========================
// HELPERS
// =========================
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// Stable color per company so every card has its own identity
const AVATAR_TONES = 6;
const getTone = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return hash % AVATAR_TONES;
};

export default function Dashboard() {
  const navigate = useNavigate();

  // =========================
  // THEME
  // =========================
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("cc-theme") || "light";
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

  // Close modal with Escape key
  useEffect(() => {
    if (!selectedCompany) return;

    const onKey = (e) => {
      if (e.key === "Escape") setSelectedCompany(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCompany]);

  // =========================
  // ACTIONS
  // =========================
  const closeModal = () => setSelectedCompany(null);

  const handleEditCompany = () => {
    if (!selectedCompany) return;
    navigate(`/EditCompany/${selectedCompany._id}`);
  };

  const handleAddEmployee = () => {
    if (!selectedCompany) return;
    navigate(`/AddEmployee/${selectedCompany._id}`);
  };

  const handleManageEmployees = () => {
    navigate("/ManageEmployees");
  };

  const handleManageCompanyEmployees = () => {
    if (!selectedCompany) return;
    navigate(`/ManageEmployees?companyId=${selectedCompany._id}`);
  };

  const handleViewTemplates = () => {
    navigate("/Templates");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="pg-root" data-theme={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Figtree:wght@400;500;600&display=swap');

        .pg-root {
          --font-display: 'Bricolage Grotesque', 'Figtree', system-ui, sans-serif;
          --font-body: 'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif;
          min-height: 100vh;
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--text);
          transition: background 0.25s ease, color 0.25s ease;
        }

        .pg-root *,
        .pg-root *::before,
        .pg-root *::after {
          box-sizing: border-box;
        }

        /* ---------- THEMES ---------- */

        .pg-root[data-theme="light"] {
          --bg: #f3f5fa;
          --surface: #ffffff;
          --surface-2: #f0f3f9;
          --border: #dfe4ef;
          --text: #0f1a33;
          --text-muted: #56627f;
          --text-faint: #8791ab;
          --primary: #3653d6;
          --primary-hover: #2b44b3;
          --primary-text: #ffffff;
          --primary-soft: rgba(54, 83, 214, 0.09);
          --success: #12805c;
          --success-soft: rgba(18, 128, 92, 0.1);
          --muted-pill: #e9edf6;
          --shadow: 0 1px 2px rgba(15, 26, 51, 0.05), 0 8px 24px -12px rgba(15, 26, 51, 0.18);
          --shadow-lift: 0 14px 32px -14px rgba(15, 26, 51, 0.28);
          --tone-0: #3653d6; --tone-0-bg: rgba(54, 83, 214, 0.12);
          --tone-1: #0d8a72; --tone-1-bg: rgba(13, 138, 114, 0.12);
          --tone-2: #b4477a; --tone-2-bg: rgba(180, 71, 122, 0.12);
          --tone-3: #b7651b; --tone-3-bg: rgba(183, 101, 27, 0.12);
          --tone-4: #6a49c8; --tone-4-bg: rgba(106, 73, 200, 0.12);
          --tone-5: #1a7fa8; --tone-5-bg: rgba(26, 127, 168, 0.12);
        }

        .pg-root[data-theme="dark"] {
          --bg: #0b1120;
          --surface: #121a2e;
          --surface-2: #19233c;
          --border: #24304d;
          --text: #e8edfa;
          --text-muted: #97a3c3;
          --text-faint: #66739a;
          --primary: #7a97ff;
          --primary-hover: #93abff;
          --primary-text: #0a1230;
          --primary-soft: rgba(122, 151, 255, 0.13);
          --success: #4cc79b;
          --success-soft: rgba(76, 199, 155, 0.13);
          --muted-pill: #1f2a47;
          --shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 10px 28px -14px rgba(0, 0, 0, 0.6);
          --shadow-lift: 0 16px 36px -14px rgba(0, 0, 0, 0.75);
          --tone-0: #8ea6ff; --tone-0-bg: rgba(142, 166, 255, 0.15);
          --tone-1: #52d1b4; --tone-1-bg: rgba(82, 209, 180, 0.15);
          --tone-2: #ee8fbb; --tone-2-bg: rgba(238, 143, 187, 0.15);
          --tone-3: #eea15c; --tone-3-bg: rgba(238, 161, 92, 0.15);
          --tone-4: #b39bff; --tone-4-bg: rgba(179, 155, 255, 0.15);
          --tone-5: #68c4ea; --tone-5-bg: rgba(104, 196, 234, 0.15);
        }

        .pg-root button {
          font-family: inherit;
        }

        .pg-root :focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        /* ---------- HEADER ---------- */

        .pg-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: color-mix(in srgb, var(--bg) 82%, transparent);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
        }

        .pg-header-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .pg-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pg-brand-mark {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: var(--primary);
          color: var(--primary-text);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .pg-brand-name {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.1;
        }

        .pg-brand-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin: 2px 0 0;
        }

        .pg-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pg-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 14px 4px 4px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--surface);
        }

        .pg-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary);
          display: grid;
          place-items: center;
          font-weight: 600;
          font-size: 13px;
        }

        .pg-user-text {
          display: none;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .pg-user-text {
            display: block;
          }
        }

        .pg-user-name {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .pg-user-role {
          font-size: 11.5px;
          color: var(--text-muted);
          margin: 0;
        }

        .pg-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }

        .pg-icon-btn:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        /* ---------- MAIN ---------- */

        .pg-main {
          max-width: 1240px;
          margin: 0 auto;
          padding: 28px 28px 72px;
        }

        /* ---------- HERO ---------- */

        .pg-hero {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          padding: 40px 40px;
          background:
            radial-gradient(900px 340px at 105% -10%, rgba(120, 150, 255, 0.35), transparent 60%),
            linear-gradient(120deg, #0d1b40 0%, #17307a 55%, #21409f 100%);
          color: #ffffff;
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          margin-bottom: 28px;
        }

        @media (min-width: 900px) {
          .pg-hero {
            grid-template-columns: 1.15fr 0.85fr;
            align-items: center;
            padding: 48px 52px;
          }
        }

        .pg-hero-date {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.68);
          margin: 0 0 14px;
        }

        .pg-hero-title {
          font-family: var(--font-display);
          font-size: clamp(30px, 4.2vw, 46px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 0;
        }

        .pg-hero-desc {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.78);
          margin: 14px 0 0;
          max-width: 440px;
        }

        .pg-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .pg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
        }

        .pg-btn:active {
          transform: scale(0.98);
        }

        .pg-btn-light {
          background: #ffffff;
          color: #0d1b40;
        }

        .pg-btn-light:hover {
          background: #e8eeff;
        }

        .pg-btn-ghost {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.28);
          color: #ffffff;
        }

        .pg-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .pg-btn-primary {
          background: var(--primary);
          color: var(--primary-text);
        }

        .pg-btn-primary:hover {
          background: var(--primary-hover);
        }

        .pg-btn-outline {
          background: var(--surface);
          border-color: var(--border);
          color: var(--text);
          padding: 9px 16px;
          font-size: 13px;
        }

        .pg-btn-outline:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        /* Payslip sheet illustration */

        .pg-sheet-wrap {
          display: none;
          position: relative;
          justify-self: center;
          width: 100%;
          max-width: 330px;
          height: 250px;
        }

        @media (min-width: 900px) {
          .pg-sheet-wrap {
            display: block;
          }
        }

        .pg-sheet {
          position: absolute;
          inset: 0;
          background: #ffffff;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.55);
          transform: rotate(3deg);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pg-sheet-back {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.22);
          transform: rotate(-4deg) translate(-10px, 6px);
        }

        .pg-sheet-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e3e8f4;
        }

        .pg-sheet-logo {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #3653d6;
        }

        .pg-bar {
          height: 7px;
          border-radius: 4px;
          background: #e3e8f4;
        }

        .pg-sheet-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          flex: 1;
        }

        .pg-sheet-col {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .pg-sheet-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .pg-sheet-total {
          height: 34px;
          border-radius: 9px;
          background: #eaeffd;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
        }

        .pg-sheet-total .pg-bar:last-child {
          background: #3653d6;
          width: 56px;
        }

        /* ---------- LAYOUT ---------- */

        .pg-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: start;
        }

        @media (min-width: 1040px) {
          .pg-layout {
            grid-template-columns: minmax(0, 1fr) 320px;
          }

          .pg-side {
            position: sticky;
            top: 92px;
          }
        }

        .pg-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .pg-section-title {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .pg-section-desc {
          font-size: 13.5px;
          color: var(--text-muted);
          margin: 4px 0 0;
        }

        /* ---------- COMPANY CARDS ---------- */

        .pg-company-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 720px) {
          .pg-company-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .pg-company {
          width: 100%;
          text-align: left;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          color: inherit;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
        }

        .pg-company:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lift);
        }

        .pg-company-top {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .pg-avatar {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.01em;
          overflow: hidden;
        }

        .pg-avatar img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
          background: #ffffff;
        }

        .pg-avatar[data-tone="0"] { background: var(--tone-0-bg); color: var(--tone-0); }
        .pg-avatar[data-tone="1"] { background: var(--tone-1-bg); color: var(--tone-1); }
        .pg-avatar[data-tone="2"] { background: var(--tone-2-bg); color: var(--tone-2); }
        .pg-avatar[data-tone="3"] { background: var(--tone-3-bg); color: var(--tone-3); }
        .pg-avatar[data-tone="4"] { background: var(--tone-4-bg); color: var(--tone-4); }
        .pg-avatar[data-tone="5"] { background: var(--tone-5-bg); color: var(--tone-5); }

        .pg-company-info {
          min-width: 0;
          flex: 1;
        }

        .pg-company-name {
          font-size: 15.5px;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pg-company-email {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 3px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pg-company-details {
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding: 14px;
          background: var(--surface-2);
          border-radius: 12px;
        }

        .pg-detail {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .pg-detail svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: var(--text-faint);
        }

        .pg-company-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pg-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 4px 11px 4px 9px;
          font-size: 12px;
          font-weight: 600;
          background: var(--success-soft);
          color: var(--success);
        }

        .pg-status::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: currentColor;
        }

        .pg-status[data-active="false"] {
          background: var(--muted-pill);
          color: var(--text-muted);
        }

        .pg-manage {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          transition: color 0.15s;
        }

        .pg-company:hover .pg-manage {
          color: var(--primary);
        }

        /* Loading skeleton */

        .pg-skeleton {
          height: 246px;
          border-radius: 16px;
          border: 1px solid var(--border);
          background:
            linear-gradient(100deg, transparent 30%, var(--surface-2) 50%, transparent 70%) 0 0 / 220% 100%,
            var(--surface);
          animation: pg-shimmer 1.4s ease-in-out infinite;
        }

        @keyframes pg-shimmer {
          from { background-position: 120% 0, 0 0; }
          to { background-position: -120% 0, 0 0; }
        }

        /* Empty */

        .pg-empty {
          border: 1.5px dashed var(--border);
          border-radius: 18px;
          background: var(--surface);
          padding: 52px 24px;
          text-align: center;
        }

        .pg-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--primary-soft);
          color: var(--primary);
          display: grid;
          place-items: center;
          margin: 0 auto;
        }

        .pg-empty-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          margin: 18px 0 0;
        }

        .pg-empty-desc {
          font-size: 14px;
          color: var(--text-muted);
          margin: 8px auto 22px;
          max-width: 360px;
          line-height: 1.6;
        }

        /* ---------- QUICK ACTIONS (side panel) ---------- */

        .pg-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .pg-panel-title {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
          padding: 18px 20px 14px;
        }

        .pg-action {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px 20px;
          background: transparent;
          border: 0;
          border-top: 1px solid var(--border);
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s;
        }

        .pg-action:hover {
          background: var(--surface-2);
        }

        .pg-action-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .pg-action-text {
          flex: 1;
          min-width: 0;
        }

        .pg-action-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .pg-action-desc {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 2px 0 0;
          line-height: 1.4;
        }

        .pg-action > svg {
          color: var(--text-faint);
          flex-shrink: 0;
          transition: transform 0.15s, color 0.15s;
        }

        .pg-action:hover > svg {
          color: var(--primary);
          transform: translateX(2px);
        }

        /* ---------- MODAL ---------- */

        .pg-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(8, 13, 30, 0.6);
          backdrop-filter: blur(4px);
          animation: pg-fade 0.18s ease;
        }

        .pg-modal {
          width: 100%;
          max-width: 460px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 22px;
          box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.5);
          animation: pg-pop 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @keyframes pg-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pg-pop {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .pg-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid var(--border);
        }

        .pg-modal-head-left {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .pg-modal-title {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pg-modal-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 2px 0 0;
        }

        .pg-modal-body {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .pg-modal-info {
          display: flex;
          flex-direction: column;
          gap: 11px;
          padding: 16px;
          border-radius: 14px;
          background: var(--surface-2);
          font-size: 13.5px;
        }

        .pg-modal-info .pg-detail {
          font-size: 13.5px;
          word-break: break-word;
        }

        .pg-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pg-modal-action {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }

        .pg-modal-action:hover {
          border-color: var(--primary);
          background: var(--surface-2);
        }

        .pg-modal-action .pg-action-icon {
          width: 38px;
          height: 38px;
        }

        .pg-modal-foot {
          padding: 0 22px 22px;
        }

        .pg-btn-close {
          width: 100%;
          background: var(--surface-2);
          border-color: var(--border);
          color: var(--text-muted);
        }

        .pg-btn-close:hover {
          color: var(--text);
          border-color: var(--text-faint);
        }

        /* ---------- RESPONSIVE / MOTION ---------- */

        @media (max-width: 640px) {
          .pg-header-inner { padding: 12px 16px; }
          .pg-main { padding: 20px 16px 56px; }
          .pg-hero { padding: 28px 22px; border-radius: 20px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pg-root *,
          .pg-root *::before,
          .pg-root *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* ================= HEADER ================= */}

      <header className="pg-header">
        <div className="pg-header-inner">
          <div className="pg-brand">
            <div className="pg-brand-mark">
              <LayoutDashboard size={20} />
            </div>

            <div>
              <h1 className="pg-brand-name">Payslip Generator</h1>
              <p className="pg-brand-sub">Admin panel</p>
            </div>
          </div>

          <div className="pg-header-right">
            <div className="pg-user">
              <div className="pg-user-avatar">A</div>

              <div className="pg-user-text">
                <p className="pg-user-name">Admin</p>
                <p className="pg-user-role">Administrator</p>
              </div>
            </div>

            <button
              type="button"
              className="pg-icon-btn"
              onClick={toggleTheme}
              aria-label="Switch between light and dark theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="pg-main">
        {/* ---------- HERO ---------- */}

        <section className="pg-hero">
          <div>
            <p className="pg-hero-date">{today}</p>

            <h2 className="pg-hero-title">{getGreeting()}, Admin</h2>

            <p className="pg-hero-desc">
              Manage your companies, employees and payslips from one place.
            </p>

            <div className="pg-hero-actions">
              <button
                type="button"
                className="pg-btn pg-btn-light"
                onClick={() => navigate("/CreateCompany")}
              >
                <Plus size={17} />
                Create company
              </button>

              <button
                type="button"
                className="pg-btn pg-btn-ghost"
                onClick={handleViewTemplates}
              >
                <Files size={17} />
                Salary templates
              </button>
            </div>
          </div>

          {/* Decorative payslip */}
          <div className="pg-sheet-wrap" aria-hidden="true">
            <div className="pg-sheet-back" />

            <div className="pg-sheet">
              <div className="pg-sheet-head">
                <div className="pg-sheet-logo" />
                <div style={{ flex: 1, display: "grid", gap: 6 }}>
                  <div className="pg-bar" style={{ width: "62%" }} />
                  <div className="pg-bar" style={{ width: "38%" }} />
                </div>
              </div>

              <div className="pg-sheet-cols">
                {[0, 1].map((col) => (
                  <div className="pg-sheet-col" key={col}>
                    {[0, 1, 2, 3].map((row) => (
                      <div className="pg-sheet-row" key={row}>
                        <div className="pg-bar" style={{ width: "48%" }} />
                        <div className="pg-bar" style={{ width: "26%" }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="pg-sheet-total">
                <div className="pg-bar" style={{ width: 70 }} />
                <div className="pg-bar" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- CONTENT ---------- */}

        <div className="pg-layout">
          {/* COMPANIES */}

          <section>
            <div className="pg-section-head">
              <div>
                <h3 className="pg-section-title">Your companies</h3>
                <p className="pg-section-desc">
                  Select a company to manage its profile and employees.
                </p>
              </div>

              {companies.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/CreateCompany")}
                  className="pg-btn pg-btn-outline"
                >
                  <Plus size={16} />
                  Add company
                </button>
              )}
            </div>

            {/* LOADING */}

            {loadingCompanies && (
              <div className="pg-company-grid" aria-busy="true">
                <div className="pg-skeleton" />
                <div className="pg-skeleton" />
              </div>
            )}

            {/* EMPTY */}

            {!loadingCompanies && companies.length === 0 && (
              <div className="pg-empty">
                <div className="pg-empty-icon">
                  <Building2 size={26} />
                </div>

                <h4 className="pg-empty-title">No companies yet</h4>

                <p className="pg-empty-desc">
                  Create your first company to start adding employees and
                  generating payslips.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/CreateCompany")}
                  className="pg-btn pg-btn-primary"
                >
                  <Plus size={17} />
                  Create company
                </button>
              </div>
            )}

            {/* COMPANY CARDS */}

            {!loadingCompanies && companies.length > 0 && (
              <div className="pg-company-grid">
                {companies.map((company) => (
                  <button
                    key={company._id}
                    type="button"
                    onClick={() => setSelectedCompany(company)}
                    className="pg-company"
                  >
                    <div className="pg-company-top">
                      <div
                        className="pg-avatar"
                        data-tone={getTone(company.name)}
                      >
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} />
                        ) : (
                          getInitials(company.name)
                        )}
                      </div>

                      <div className="pg-company-info">
                        <h4 className="pg-company-name">{company.name}</h4>
                        <p className="pg-company-email">{company.email}</p>
                      </div>
                    </div>

                    <div className="pg-company-details">
                      <div className="pg-detail">
                        <Phone size={14} />
                        <span>
                          {company.contactNumber || "No contact number"}
                        </span>
                      </div>

                      <div className="pg-detail">
                        <MapPin size={14} />
                        <span>{company.address || "No address available"}</span>
                      </div>
                    </div>

                    <div className="pg-company-foot">
                      <span
                        className="pg-status"
                        data-active={company.isActive ? "true" : "false"}
                      >
                        {company.isActive ? "Active" : "Inactive"}
                      </span>

                      <span className="pg-manage">
                        Manage company
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* QUICK ACTIONS */}

          <aside className="pg-side">
            <div className="pg-panel">
              <h3 className="pg-panel-title">Quick actions</h3>

              <button
                type="button"
                className="pg-action"
                onClick={() => navigate("/CreateCompany")}
              >
                <div
                  className="pg-action-icon"
                  style={{
                    background: "var(--tone-0-bg)",
                    color: "var(--tone-0)",
                  }}
                >
                  <Plus size={19} />
                </div>

                <div className="pg-action-text">
                  <p className="pg-action-title">Add company</p>
                  <p className="pg-action-desc">Create a new company profile</p>
                </div>

                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className="pg-action"
                onClick={handleManageEmployees}
              >
                <div
                  className="pg-action-icon"
                  style={{
                    background: "var(--tone-1-bg)",
                    color: "var(--tone-1)",
                  }}
                >
                  <Users size={19} />
                </div>

                <div className="pg-action-text">
                  <p className="pg-action-title">Manage employees</p>
                  <p className="pg-action-desc">
                    View and manage all registered employees
                  </p>
                </div>

                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className="pg-action"
                onClick={handleViewTemplates}
              >
                <div
                  className="pg-action-icon"
                  style={{
                    background: "var(--tone-4-bg)",
                    color: "var(--tone-4)",
                  }}
                >
                  <Files size={19} />
                </div>

                <div className="pg-action-text">
                  <p className="pg-action-title">Salary templates</p>
                  <p className="pg-action-desc">
                    View available payslip templates
                  </p>
                </div>

                <ChevronRight size={18} />
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* ================= COMPANY MODAL ================= */}

      {selectedCompany && (
        <div className="pg-backdrop" onMouseDown={closeModal}>
          <div
            className="pg-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedCompany.name} management`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="pg-modal-head">
              <div className="pg-modal-head-left">
                <div
                  className="pg-avatar"
                  data-tone={getTone(selectedCompany.name)}
                >
                  {selectedCompany.logoUrl ? (
                    <img
                      src={selectedCompany.logoUrl}
                      alt={selectedCompany.name}
                    />
                  ) : (
                    getInitials(selectedCompany.name)
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3 className="pg-modal-title">{selectedCompany.name}</h3>
                  <p className="pg-modal-sub">Company management</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="pg-icon-btn"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="pg-modal-body">
              <div className="pg-modal-info">
                <div className="pg-detail">
                  <Mail size={15} />
                  <span>{selectedCompany.email}</span>
                </div>

                <div className="pg-detail">
                  <Phone size={15} />
                  <span>
                    {selectedCompany.contactNumber || "No contact number"}
                  </span>
                </div>

                <div className="pg-detail">
                  <MapPin size={15} />
                  <span>
                    {selectedCompany.address || "No address available"}
                  </span>
                </div>

                {selectedCompany.website && (
                  <div className="pg-detail">
                    <Globe size={15} />
                    <span>{selectedCompany.website}</span>
                  </div>
                )}
              </div>

              <div className="pg-modal-actions">
                <button
                  type="button"
                  onClick={handleEditCompany}
                  className="pg-modal-action"
                >
                  <div
                    className="pg-action-icon"
                    style={{
                      background: "var(--tone-0-bg)",
                      color: "var(--tone-0)",
                    }}
                  >
                    <Pencil size={16} />
                  </div>

                  <div className="pg-action-text">
                    <p className="pg-action-title">Edit company</p>
                    <p className="pg-action-desc">Update company details</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="pg-modal-action"
                >
                  <div
                    className="pg-action-icon"
                    style={{
                      background: "var(--tone-3-bg)",
                      color: "var(--tone-3)",
                    }}
                  >
                    <UserPlus size={16} />
                  </div>

                  <div className="pg-action-text">
                    <p className="pg-action-title">Add employee</p>
                    <p className="pg-action-desc">Add an employee to this company</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleManageCompanyEmployees}
                  className="pg-modal-action"
                >
                  <div
                    className="pg-action-icon"
                    style={{
                      background: "var(--tone-1-bg)",
                      color: "var(--tone-1)",
                    }}
                  >
                    <Users size={16} />
                  </div>

                  <div className="pg-action-text">
                    <p className="pg-action-title">Manage employees</p>
                    <p className="pg-action-desc">
                      View employees of this company
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="pg-modal-foot">
              <button
                type="button"
                onClick={closeModal}
                className="pg-btn pg-btn-close"
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