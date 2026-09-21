import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Check,
  FileText,
  Globe,
  ImagePlus,
  Mail,
  MapPin,
  Moon,
  Phone,
  Save,
  Sun,
  Trash2,
  Upload,
  CreditCard,
  Loader2,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function CreateCompany() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // =========================
  // THEME (dark / light)
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    gstin: "",
    pan: "",
    website: "",
    templateId: "",
  });

  const [templates, setTemplates] = useState([]);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // GET TEMPLATES
  // =========================
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);

        const response = await axios.get(`${API_URL}/api/templates`, {
          withCredentials: true,
        });

        setTemplates(response.data?.templates || []);
      } catch (error) {
        console.error("Template fetch error:", error);

        toast.error(
          error.response?.data?.message || "Unable to load salary templates"
        );
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // LOGO SELECT
  // =========================
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo size must be less than 5MB");
      return;
    }

    setLogo(file);

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  // =========================
  // REMOVE LOGO
  // =========================
  const removeLogo = () => {
    setLogo(null);
    setLogoPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================
  // VALIDATION
  // =========================
  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.contactNumber.trim();
    const address = formData.address.trim();

    if (!name) {
      toast.error("Company name is required");
      return false;
    }

    if (name.length < 2) {
      toast.error("Company name must be at least 2 characters");
      return false;
    }

    if (!email) {
      toast.error("Company email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!phone) {
      toast.error("Contact number is required");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      toast.error("Contact number must contain 10 digits");
      return false;
    }

    if (!address) {
      toast.error("Company address is required");
      return false;
    }

    if (!formData.templateId) {
      toast.error("Please select a salary template");
      return false;
    }

    if (formData.gstin.trim()) {
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

      if (!gstinRegex.test(formData.gstin.trim().toUpperCase())) {
        toast.error("Please enter a valid GSTIN");
        return false;
      }
    }

    if (formData.pan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

      if (!panRegex.test(formData.pan.trim().toUpperCase())) {
        toast.error("Please enter a valid PAN");
        return false;
      }
    }

    return true;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim().toLowerCase());
      data.append("contactNumber", formData.contactNumber.trim());
      data.append("address", formData.address.trim());
      data.append("gstin", formData.gstin.trim().toUpperCase());
      data.append("pan", formData.pan.trim().toUpperCase());
      data.append("website", formData.website.trim());
      data.append("templateId", formData.templateId);

      if (logo) {
        data.append("logo", logo);
      }

      const response = await axios.post(
        `${API_URL}/api/company/create`,
        data,
        {
          withCredentials: true,
        }
      );

      toast.success(response.data?.message || "Company created successfully");

      navigate("/Dashboard");
    } catch (error) {
      console.error("Create company error:", error);

      toast.error(error.response?.data?.message || "Failed to create company");
    } finally {
      setSubmitting(false);
    }
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

        .cc-root { background: var(--bg); color: var(--text); }
        .cc-root * { box-sizing: border-box; }

        .cc-header {
          position: sticky; top: 0; z-index: 20;
          background: var(--bg); border-bottom: 1px solid var(--border-soft);
        }
        .cc-header-inner {
          max-width: 1180px; margin: 0 auto; padding: 18px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .cc-header-left { display: flex; align-items: center; gap: 14px; }
        .cc-back-btn {
          width: 40px; height: 40px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--surface);
          color: var(--text-muted); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .cc-back-btn:hover { border-color: var(--accent); color: var(--accent); }
        .cc-title { font-family: var(--font-serif); font-size: 21px; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
        .cc-subtitle { font-size: 12.5px; color: var(--text-muted); margin: 2px 0 0; }
        .cc-header-right { display: flex; align-items: center; gap: 10px; }
        .cc-badge {
          display: none; align-items: center; gap: 7px; font-size: 12px; color: var(--text-muted);
          border: 1px solid var(--border-soft); border-radius: 999px; padding: 7px 13px;
        }
        @media (min-width: 640px) { .cc-badge { display: flex; } }
        .cc-theme-btn {
          width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border);
          background: var(--surface); color: var(--accent); display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: transform 0.25s, border-color 0.2s;
        }
        .cc-theme-btn:hover { border-color: var(--accent); transform: rotate(20deg); }

        .cc-main { max-width: 1180px; margin: 0 auto; padding: 32px 24px 60px; }
        .cc-grid { display: grid; gap: 24px; grid-template-columns: 1fr; }
        @media (min-width: 1024px) { .cc-grid { grid-template-columns: 300px 1fr; } }

        .cc-aside { display: flex; flex-direction: column; gap: 16px; }
        .cc-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 18px; padding: 22px; }
        .cc-card-title { font-size: 14.5px; font-weight: 600; margin: 0; }
        .cc-card-desc { font-size: 12.5px; color: var(--text-muted); margin: 5px 0 0; line-height: 1.6; }

        .cc-desktop-only { display: none; }
        @media (min-width: 1024px) { .cc-desktop-only { display: block; } }

        .cc-logo-frame {
          position: relative; height: 170px; width: 170px; margin: 18px auto 0;
          border-radius: 18px; border: 1.5px dashed var(--border);
          background: var(--surface-2); display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .cc-logo-frame img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
        .cc-logo-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-faint); }
        .cc-logo-empty-icon {
          width: 46px; height: 46px; border-radius: 12px; background: var(--surface-3);
          display: flex; align-items: center; justify-content: center; color: var(--text-muted);
        }
        .cc-logo-actions { display: flex; gap: 8px; margin-top: 16px; }
        .cc-btn-primary {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--accent); color: var(--accent-text); border: none; border-radius: 12px;
          padding: 11px 14px; font-size: 13.5px; font-weight: 600; cursor: pointer;
          transition: filter 0.2s, transform 0.1s; font-family: var(--font-sans);
        }
        .cc-btn-primary:hover { filter: brightness(1.08); }
        .cc-btn-primary:active { transform: scale(0.98); }
        .cc-btn-icon {
          width: 42px; height: 42px; border-radius: 12px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text-muted); display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .cc-btn-icon:hover { border-color: var(--danger); color: var(--danger); }
        .cc-logo-hint { text-align: center; font-size: 11px; color: var(--text-faint); margin-top: 12px; }

        .cc-info-icon-row { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
        .cc-info-icon { width: 32px; height: 32px; border-radius: 9px; background: var(--success-bg); color: var(--success); display: flex; align-items: center; justify-content: center; }

        .cc-panel { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 20px; box-shadow: var(--shadow); }
        .cc-section:first-child { border-radius: 20px 20px 0 0; }
        .cc-footer { border-radius: 0 0 20px 20px; }
        .cc-section { padding: 26px; border-bottom: 1px solid var(--border-soft); }
        .cc-section:last-of-type { border-bottom: none; }
        .cc-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
        .cc-section-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cc-icon-blue { background: rgba(90, 130, 180, 0.14); color: #7fa2ca; }
        .cc-icon-violet { background: rgba(150, 120, 190, 0.14); color: #ab8fd0; }
        .cc-icon-accent { background: var(--success-bg); color: var(--success); }
        .cc-section-title { font-size: 15.5px; font-weight: 600; margin: 0; }
        .cc-section-desc { font-size: 12px; color: var(--text-muted); margin: 2px 0 0; }

        .cc-field-grid { display: grid; gap: 18px; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .cc-field-grid { grid-template-columns: 1fr 1fr; } }
        .cc-span-2 { grid-column: 1 / -1; }

        .cc-label { display: block; font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 7px; }
        .cc-required { color: var(--accent); margin-left: 3px; }

        .cc-input-wrap { position: relative; }
        .cc-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-faint); pointer-events: none; }
        .cc-textarea-icon { top: 15px; transform: none; }
        .cc-input, .cc-textarea {
          width: 100%; background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 12px; padding: 11px 14px 11px 38px; font-size: 13.5px; color: var(--text);
          outline: none; transition: border-color 0.2s, background 0.2s; font-family: var(--font-sans);
        }
        .cc-input::placeholder, .cc-textarea::placeholder { color: var(--text-faint); }
        .cc-input:focus, .cc-textarea:focus { border-color: var(--accent); background: var(--surface); }
        .cc-textarea { resize: none; line-height: 1.6; }

        .cc-tpl-picker {
          width: 100%; display: flex; align-items: center; gap: 14px; text-align: left;
          background: var(--surface-2); border: 1px solid var(--border); border-radius: 14px;
          padding: 13px 16px; cursor: pointer; transition: border-color 0.2s, background 0.2s;
          font-family: var(--font-sans);
        }
        .cc-tpl-picker:hover { border-color: var(--accent); background: var(--surface); }
        .cc-tpl-picker:disabled { opacity: 0.55; cursor: not-allowed; }
        .cc-tpl-picker-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: var(--success-bg); color: var(--success);
          display: flex; align-items: center; justify-content: center;
        }
        .cc-tpl-picker-body { flex: 1; min-width: 0; }
        .cc-tpl-picker-name { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cc-tpl-picker-name.cc-placeholder { font-weight: 400; color: var(--text-faint); }
        .cc-tpl-picker-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .cc-tpl-picker-cta {
          flex-shrink: 0; font-size: 12.5px; font-weight: 600; color: var(--accent);
          border: 1px solid var(--border); border-radius: 999px; padding: 7px 14px;
          background: var(--surface); transition: border-color 0.2s;
        }
        .cc-tpl-picker:hover .cc-tpl-picker-cta { border-color: var(--accent); }

        .cc-modal-backdrop {
          position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;
          padding: 24px; background: rgba(10, 9, 6, 0.55); backdrop-filter: blur(3px);
          animation: cc-fade-in 0.18s ease;
        }
        .cc-modal {
          width: 100%; max-width: 440px; max-height: min(560px, 84vh); display: flex; flex-direction: column;
          background: var(--surface); border: 1px solid var(--border-soft); border-radius: 20px;
          box-shadow: var(--shadow); overflow: hidden; animation: cc-modal-in 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .cc-modal-head {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
          padding: 20px 22px; border-bottom: 1px solid var(--border-soft);
        }
        .cc-modal-title { font-family: var(--font-serif); font-size: 17px; font-weight: 600; margin: 0; }
        .cc-modal-sub { font-size: 12px; color: var(--text-muted); margin: 3px 0 0; }
        .cc-modal-close {
          width: 32px; height: 32px; border-radius: 9px; border: 1px solid var(--border);
          background: var(--surface-2); color: var(--text-muted); display: flex; align-items: center;
          justify-content: center; cursor: pointer; flex-shrink: 0; transition: color 0.2s, border-color 0.2s;
        }
        .cc-modal-close:hover { color: var(--text); border-color: var(--text-muted); }
        .cc-modal-list { overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 4px; }
        .cc-modal-option {
          display: flex; align-items: center; gap: 12px; padding: 12px 12px; border-radius: 12px;
          cursor: pointer; border: 1px solid transparent; text-align: left; background: transparent;
          transition: background 0.15s, border-color 0.15s; font-family: var(--font-sans);
        }
        .cc-modal-option:hover { background: var(--surface-2); }
        .cc-modal-option.cc-picked { background: var(--success-bg); border-color: var(--accent); }
        .cc-modal-radio {
          width: 18px; height: 18px; border-radius: 999px; border: 1.5px solid var(--border);
          flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--accent-text);
        }
        .cc-modal-option.cc-picked .cc-modal-radio { background: var(--accent); border-color: var(--accent); }
        .cc-modal-option-name { font-size: 13.5px; font-weight: 500; color: var(--text); }
        .cc-modal-empty { padding: 30px 20px; text-align: center; font-size: 13px; color: var(--text-muted); }

        @keyframes cc-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cc-modal-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .cc-hint-warning { margin-top: 10px; font-size: 12px; color: var(--danger); }

        .cc-footer { display: flex; flex-direction: column-reverse; gap: 12px; padding: 22px 26px; background: var(--surface-2); }
        @media (min-width: 640px) { .cc-footer { flex-direction: row; justify-content: flex-end; } }
        .cc-btn-secondary {
          width: 100%; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted);
          border-radius: 12px; padding: 12px 20px; font-size: 13.5px; font-weight: 500; cursor: pointer;
          transition: border-color 0.2s, color 0.2s; font-family: var(--font-sans);
        }
        .cc-btn-secondary:hover { border-color: var(--text-muted); color: var(--text); }
        .cc-btn-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px;
          background: var(--accent); color: var(--accent-text); border: none; border-radius: 12px;
          padding: 12px 22px; font-size: 13.5px; font-weight: 600; cursor: pointer;
          transition: filter 0.2s, transform 0.1s; font-family: var(--font-sans);
        }
        .cc-btn-submit:hover { filter: brightness(1.08); }
        .cc-btn-submit:active { transform: scale(0.99); }
        .cc-btn-submit:disabled, .cc-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        @media (min-width: 640px) { .cc-btn-secondary, .cc-btn-submit { width: auto; } }

        .cc-spin { animation: cc-spin 0.8s linear infinite; }
        @keyframes cc-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ================= HEADER ================= */}
      <header className="cc-header">
        <div className="cc-header-inner">
          <div className="cc-header-left">
            <button type="button" className="cc-back-btn" onClick={() => navigate("/Dashboard")}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="cc-title">Create company</h1>
              <p className="cc-subtitle">Add a new company to your payroll system</p>
            </div>
          </div>

          <div className="cc-header-right">
            <div className="cc-badge">
              <Check size={13} style={{ color: "var(--success)" }} />
              Company setup
            </div>
            <button type="button" className="cc-theme-btn" onClick={toggleTheme} aria-label="Toggle dark and light mode">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="cc-main">
        <form onSubmit={handleSubmit}>
          <div className="cc-grid">
            {/* ================= LEFT SIDE ================= */}
            <aside className="cc-aside">
              <div className="cc-card">
                <p className="cc-card-title">Company logo</p>
                <p className="cc-card-desc">Upload a professional logo for your payslips.</p>

                <div className="cc-logo-frame">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company logo preview" />
                  ) : (
                    <div className="cc-logo-empty">
                      <div className="cc-logo-empty-icon">
                        <ImagePlus size={22} />
                      </div>
                      <span style={{ fontSize: "12px" }}>No logo selected</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                />

                <div className="cc-logo-actions">
                  <button type="button" className="cc-btn-primary" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={15} />
                    {logoPreview ? "Change" : "Upload"}
                  </button>

                  {logoPreview && (
                    <button type="button" className="cc-btn-icon" onClick={removeLogo} title="Remove logo">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="cc-logo-hint">JPG, PNG or WEBP · Maximum 5MB</p>
              </div>

              <div className="cc-card cc-desktop-only">
                <div className="cc-info-icon-row">
                  <div className="cc-info-icon">
                    <Building2 size={16} />
                  </div>
                  <p className="cc-card-title">Company profile</p>
                </div>
                <p className="cc-card-desc">
                  Keep company information accurate. These details can be used throughout employee payroll and generated payslips.
                </p>
              </div>
            </aside>

            {/* ================= RIGHT SIDE ================= */}
            <section className="cc-panel">
              {/* Company Information */}
              <div className="cc-section">
                <div className="cc-section-head">
                  <div className="cc-section-icon cc-icon-blue">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h2 className="cc-section-title">Company information</h2>
                    <p className="cc-section-desc">Basic information about your company</p>
                  </div>
                </div>

                <div className="cc-field-grid">
                  <InputField
                    label="Company name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. ABC Technologies"
                    icon={Building2}
                    required
                  />

                  <InputField
                    label="Company email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="company@example.com"
                    icon={Mail}
                    required
                  />

                  <InputField
                    label="Contact number"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    icon={Phone}
                    maxLength={10}
                    required
                  />

                  <InputField
                    label="Website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    icon={Globe}
                  />

                  <div className="cc-field cc-span-2">
                    <label className="cc-label">
                      Company address
                      <span className="cc-required">*</span>
                    </label>

                    <div className="cc-input-wrap">
                      <MapPin size={16} className="cc-input-icon cc-textarea-icon" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter complete company address"
                        rows={3}
                        className="cc-textarea"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div className="cc-section">
                <div className="cc-section-head">
                  <div className="cc-section-icon cc-icon-violet">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="cc-section-title">Legal information</h2>
                    <p className="cc-section-desc">Optional business identification details</p>
                  </div>
                </div>

                <div className="cc-field-grid">
                  <InputField
                    label="GSTIN"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="24ABCDE1234F1Z5"
                    icon={FileText}
                    maxLength={15}
                  />

                  <InputField
                    label="PAN"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    icon={CreditCard}
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Template */}
              <div className="cc-section">
                <div className="cc-section-head">
                  <div className="cc-section-icon cc-icon-accent">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="cc-section-title">Salary template</h2>
                    <p className="cc-section-desc">Select the default payslip template</p>
                  </div>
                </div>

                <label className="cc-label">
                  Payslip template
                  <span className="cc-required">*</span>
                </label>

                <TemplateSelect
                  templates={templates}
                  value={formData.templateId}
                  loading={loadingTemplates}
                  onChange={(id) => setFormData((prev) => ({ ...prev, templateId: id }))}
                />

                {!loadingTemplates && templates.length === 0 && (
                  <p className="cc-hint-warning">No active salary templates found.</p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="cc-footer">
                <button
                  type="button"
                  onClick={() => navigate("/Dashboard")}
                  disabled={submitting}
                  className="cc-btn-secondary"
                >
                  Cancel
                </button>

                <button type="submit" disabled={submitting || loadingTemplates} className="cc-btn-submit">
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="cc-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Create company
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}

// =========================
// REUSABLE INPUT
// =========================
function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  maxLength,
}) {
  return (
    <div className="cc-field">
      <label className="cc-label">
        {label}
        {required && <span className="cc-required">*</span>}
      </label>

      <div className="cc-input-wrap">
        <Icon size={16} className="cc-input-icon" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="cc-input"
        />
      </div>
    </div>
  );
}

// =========================
// TEMPLATE PICKER (modal-based)
// A dropdown list was pushing the page layout around, so this
// swaps it for a fixed overlay picker — a compact card that opens
// a centered modal with all templates, closes on pick, backdrop
// click, or Escape. Nothing in the page flow ever shifts.
// =========================
// Falls back across the field names backends commonly use for a
// template's display name, so a mismatched key never renders as blank.
function getTemplateLabel(template) {
  return (
    template.name ||
    template.templateName ||
    template.title ||
    template.label ||
    "Untitled template"
  );
}

function TemplateSelect({ templates, value, onChange, loading }) {
  const [open, setOpen] = useState(false);
  const selected = templates.find((t) => t._id === value);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="cc-tpl-picker"
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        <span className="cc-tpl-picker-icon">
          <FileText size={17} />
        </span>

        <span className="cc-tpl-picker-body">
          <span className={`cc-tpl-picker-name ${selected ? "" : "cc-placeholder"}`}>
            {loading
              ? "Loading templates..."
              : selected
              ? getTemplateLabel(selected)
              : "Choose a salary template"}
          </span>
          <span className="cc-tpl-picker-meta">
            {loading
              ? "Fetching your saved formats"
              : selected
              ? "Tap to use a different format"
              : `${templates.length} format${templates.length === 1 ? "" : "s"} available`}
          </span>
        </span>

        {!loading && <span className="cc-tpl-picker-cta">{selected ? "Change" : "Select"}</span>}
      </button>

      {open && (
        <div className="cc-modal-backdrop" onMouseDown={() => setOpen(false)}>
          <div className="cc-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="cc-modal-head">
              <div>
                <h3 className="cc-modal-title">Choose a salary template</h3>
                <p className="cc-modal-sub">This sets the default layout for this company's payslips</p>
              </div>
              <button type="button" className="cc-modal-close" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="cc-modal-list">
              {templates.length === 0 ? (
                <div className="cc-modal-empty">No active salary templates found</div>
              ) : (
                templates.map((template) => {
                  const picked = template._id === value;
                  return (
                    <button
                      type="button"
                      key={template._id}
                      className={`cc-modal-option ${picked ? "cc-picked" : ""}`}
                      onClick={() => {
                        onChange(template._id);
                        setOpen(false);
                      }}
                    >
                      <span className="cc-modal-radio">{picked && <Check size={12} />}</span>
                      <span className="cc-modal-option-name">{getTemplateLabel(template)}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateCompany;