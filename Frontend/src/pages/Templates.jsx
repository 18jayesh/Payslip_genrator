import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowLeft,
    Eye,
    FileText,
    Loader2,
    RefreshCw,
    X,
    LayoutTemplate,
    CheckCircle2,
    Columns3,
    UserRound,
    IndianRupee,
    ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const Templates = () => {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // =====================================================
    // FETCH TEMPLATES
    // =====================================================

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/api/templates`,
                {
                    withCredentials: true
                }
            );

            if (response.data?.success) {
                setTemplates(response.data.templates || []);
            } else {
                setError("Failed to load salary templates.");
            }
        } catch (err) {
            console.error("Fetch Templates Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load salary templates."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // =====================================================
    // HELPERS
    // =====================================================

    const getOrientationLabel = (orientation) => {
        if (orientation === "landscape") {
            return "Landscape";
        }

        return "Portrait";
    };

    const getTemplateNumber = (index) => {
        return String(index + 1).padStart(2, "0");
    };

    // ORIGINAL PDF FILES STORED IN Frontend/public
    const getTemplatePdf = (template) => {
        const key = String(template?.templateKey || "")
            .toLowerCase()
            .replace(/[\\s_-]+/g, "");

        const name = String(template?.templateName || "").toLowerCase();

        if (key.includes("hardeep") || name.includes("hardeep")) {
            return "/HARDEEP SINGH SALARY SLIP.pdf";
        }

        if (key.includes("surjeet") || name.includes("surjeet")) {
            return "/SURJEET SINGH SALARY SLIP.pdf";
        }

        if (key.includes("pankaj") || name.includes("pankaj")) {
            return "/SAMPLE -PANKAJ KUMAR SALARY SLIP.pdf";
        }

        if (key.includes("amitesh") || name.includes("amitesh")) {
            return "/Amitesh Kumar Yadav Salary slip New.pdf";
        }

        if (key.includes("format") || name.includes("format")) {
        return "/Format 1.pdf";    
    }

        return null;
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="templates-page">
                <style>{styles}</style>

                <div className="loading-screen">
                    <Loader2 className="spinner" size={34} />
                    <p>Loading salary templates...</p>
                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="templates-page">
            <style>{styles}</style>

            {/* HEADER */}

            <header className="templates-header">

                <div className="header-left">

                    <button
                        className="back-button"
                        onClick={() => navigate("/Dashboard")}
                    >
                        <ArrowLeft size={19} />
                    </button>

                    <div>
                        <div className="page-title">
                            Salary Templates
                        </div>

                        <div className="page-subtitle">
                            View and preview available payslip formats
                        </div>
                    </div>

                </div>

                <button
                    className="refresh-button"
                    onClick={fetchTemplates}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>

            </header>


            {/* ERROR */}

            {error && (
                <div className="error-box">
                    <span>{error}</span>

                    <button onClick={fetchTemplates}>
                        Try Again
                    </button>
                </div>
            )}


            {/* CONTENT */}

            <main className="templates-content">

                <div className="intro-section">

                    <div className="intro-icon">
                        <LayoutTemplate size={24} />
                    </div>

                    <div>
                        <h2>Available Payslip Formats</h2>

                        <p>
                            These salary templates are stored in the database.
                            Select a template while creating a company.
                        </p>
                    </div>

                </div>


                {/* TEMPLATE GRID */}

                <div className="template-grid">

                    {templates.map((template, index) => (

                        <div
                            className="template-card"
                            key={template._id}
                        >

                            {/* CARD TOP */}

                            <div className="template-card-top">

                                <div className="template-number">
                                    {getTemplateNumber(index)}
                                </div>

                                <div className="active-badge">
                                    <CheckCircle2 size={14} />
                                    Active
                                </div>

                            </div>


                            {/* SAMPLE DOCUMENT */}

                            {getTemplatePdf(template) ? (
                                <div className="pdf-card-preview">
                                    <iframe
                                        src={`${getTemplatePdf(template)}#page=1&view=FitH`}
                                        title={`${template.templateName} original PDF`}
                                        className="pdf-preview-frame"
                                    />
                                    <div className="pdf-preview-overlay">
                                        <Eye size={18} />
                                        <span>Original Template</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="pdf-missing-preview">
                                    <FileText size={34} />
                                    <span>Original PDF not found</span>
                                </div>
                            )}


                            {/* CARD CONTENT */}

                            <div className="template-card-body">

                                <h3>
                                    {template.templateName}
                                </h3>

                                <p className="template-description">
                                    {template.description ||
                                        "Salary payslip template"}
                                </p>


                                {/* META */}

                                <div className="template-meta">

                                    <div className="meta-item">
                                        <FileText size={15} />
                                        <span>
                                            {getOrientationLabel(
                                                template.layout?.orientation
                                            )}
                                        </span>
                                    </div>

                                    <div className="meta-item">
                                        <UserRound size={15} />
                                        <span>
                                            {template.employeeFields?.length ||
                                                0}{" "}
                                            Fields
                                        </span>
                                    </div>

                                    <div className="meta-item">
                                        <IndianRupee size={15} />
                                        <span>
                                            {(template.earnings?.length || 0) +
                                                (template.deductions?.length ||
                                                    0)}{" "}
                                            Components
                                        </span>
                                    </div>

                                </div>


                                {/* VIEW BUTTON */}

                                <button
                                    className="view-button"
                                    onClick={() =>
                                        setSelectedTemplate(template)
                                    }
                                >
                                    <Eye size={18} />
                                    View Sample
                                </button>

                            </div>

                        </div>

                    ))}

                </div>


                {/* EMPTY */}

                {templates.length === 0 && !error && (
                    <div className="empty-state">

                        <FileText size={42} />

                        <h3>No Templates Found</h3>

                        <p>
                            No active salary templates are available in the
                            database.
                        </p>

                    </div>
                )}

            </main>


            {/* SAMPLE MODAL */}

            {selectedTemplate && (
                <TemplatePreview
                    template={selectedTemplate}
                    getTemplatePdf={getTemplatePdf}
                    onClose={() => setSelectedTemplate(null)}
                />
            )}

        </div>
    );
};


// =====================================================
// TEMPLATE PREVIEW
// =====================================================

const TemplatePreview = ({ template, onClose, getTemplatePdf }) => {
    const pdfPath = getTemplatePdf(template);

    return (
        <div className="modal-overlay">
            <div className="preview-modal pdf-preview-modal">

                {/* MODAL HEADER */}
                <div className="preview-header">
                    <div>
                        <div className="preview-small-title">
                            ORIGINAL SALARY TEMPLATE
                        </div>

                        <h2>{template.templateName}</h2>
                    </div>

                    <button
                        className="close-button"
                        onClick={onClose}
                        aria-label="Close preview"
                    >
                        <X size={21} />
                    </button>
                </div>

                {/* PDF PREVIEW */}
                <div className="original-pdf-container">
                    {pdfPath ? (
                        <iframe
                            src={`${pdfPath}#page=1&view=FitH`}
                            title={`${template.templateName} original salary slip`}
                            className="original-pdf-frame"
                        />
                    ) : (
                        <div className="pdf-not-found">
                            <FileText size={46} />
                            <h3>Original PDF not found</h3>
                            <p>
                                Please check the PDF filename inside
                                Frontend/public.
                            </p>
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div className="preview-modal-footer">
                    <div className="preview-info">
                        <span>
                            Template Key:
                            <strong>{template.templateKey}</strong>
                        </span>

                        <span>
                            Orientation:
                            <strong>
                                {template.layout?.orientation || "portrait"}
                            </strong>
                        </span>
                    </div>

                    <div className="preview-footer-actions">
                        {pdfPath && (
                            <a
                                href={pdfPath}
                                target="_blank"
                                rel="noreferrer"
                                className="open-pdf-button"
                            >
                                <ExternalLink size={16} />
                                Open Original PDF
                            </a>
                        )}

                        <button
                            className="close-preview-button"
                            onClick={onClose}
                        >
                            Close Preview
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};


// =====================================================
// SAMPLE FIELD VALUE
// =====================================================

const getSampleValue = (type, label) => {

    const lowerLabel = String(label || "").toLowerCase();

    if (lowerLabel.includes("name")) {
        return "Jayesh Mali";
    }

    if (lowerLabel.includes("email")) {
        return "jayesh@example.com";
    }

    if (
        lowerLabel.includes("phone") ||
        lowerLabel.includes("mobile") ||
        lowerLabel.includes("contact")
    ) {
        return "+91 98765 43210";
    }

    if (
        lowerLabel.includes("date") ||
        type === "date"
    ) {
        return "01/09/2026";
    }

    if (type === "number") {
        return "25,000";
    }

    return "Sample Value";
};


// =====================================================
// BUILD SALARY ROWS
// =====================================================

const buildSalaryRows = (template) => {

    const earnings = template.earnings || [];
    const deductions = template.deductions || [];

    const totalRows = Math.max(
        earnings.length,
        deductions.length,
        4
    );

    const rows = [];

    for (let i = 0; i < totalRows; i++) {

        rows.push({
            earning:
                earnings[i]?.label ||
                "",

            earningAmount:
                earnings[i]
                    ? "10,000"
                    : "",

            deduction:
                deductions[i]?.label ||
                "",

            deductionAmount:
                deductions[i]
                    ? "1,000"
                    : ""
        });
    }

    return rows;
};


// =====================================================
// STYLES
// =====================================================

const styles = `

* {
    box-sizing: border-box;
}

.templates-page {
    min-height: 100vh;
    background: #0b0f14;
    color: #e7edf5;
    font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}


/* HEADER */

.templates-header {
    height: 76px;
    padding: 0 32px;
    border-bottom: 1px solid #202733;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #0f141b;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.back-button,
.close-button {
    border: 1px solid #293241;
    background: #151b24;
    color: #dce4ee;
    width: 40px;
    height: 40px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.back-button:hover,
.close-button:hover {
    background: #1d2530;
}

.page-title {
    font-size: 22px;
    font-weight: 700;
}

.page-subtitle {
    color: #8e9aaa;
    font-size: 13px;
    margin-top: 3px;
}

.refresh-button {
    height: 40px;
    padding: 0 15px;
    border: 1px solid #293241;
    border-radius: 8px;
    background: #151b24;
    color: #dce4ee;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.refresh-button:hover {
    background: #1d2530;
}


/* CONTENT */

.templates-content {
    padding: 30px 32px 50px;
    max-width: 1500px;
    margin: auto;
}

.intro-section {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 26px;
}

.intro-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    border: 1px solid #293241;
    background: #141a22;
    display: flex;
    align-items: center;
    justify-content: center;
}

.intro-section h2 {
    margin: 0;
    font-size: 19px;
}

.intro-section p {
    margin: 5px 0 0;
    color: #8994a4;
    font-size: 13px;
}


/* GRID */

.template-grid {
    display: grid;
    grid-template-columns:
        repeat(auto-fit, minmax(310px, 1fr));
    gap: 22px;
}


/* CARD */

.template-card {
    background: #111720;
    border: 1px solid #232c39;
    border-radius: 13px;
    overflow: hidden;
    transition:
        transform 0.2s ease,
        border-color 0.2s ease;
}

.template-card:hover {
    transform: translateY(-3px);
    border-color: #3b4656;
}

.template-card-top {
    height: 52px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #202833;
}

.template-number {
    font-size: 12px;
    color: #7f8a9a;
    font-weight: 700;
    letter-spacing: 1px;
}

.active-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: #aeb8c6;
}


/* ORIGINAL PDF CARD PREVIEW */

.pdf-card-preview {
    position: relative;
    margin: 18px;
    height: 285px;
    overflow: hidden;
    border-radius: 5px;
    background: #ffffff;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.pdf-preview-frame {
    width: 100%;
    height: 100%;
    border: 0;
    background: #ffffff;
    display: block;
}

.pdf-preview-overlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: rgba(15, 20, 27, 0.88);
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    pointer-events: none;
}

.pdf-missing-preview {
    margin: 18px;
    height: 285px;
    border: 1px dashed #3b4656;
    border-radius: 6px;
    background: #151b24;
    color: #7f8a9a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 12px;
}

/* CARD BODY */

.template-card-body {
    padding: 0 18px 18px;
}

.template-card-body h3 {
    margin: 0;
    font-size: 18px;
}

.template-description {
    min-height: 36px;
    color: #8b96a6;
    font-size: 12px;
    line-height: 1.5;
    margin: 7px 0 14px;
}

.template-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 15px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #171e28;
    border: 1px solid #252e3b;
    border-radius: 6px;
    padding: 6px 8px;
    color: #a9b3c1;
    font-size: 10px;
}

.view-button {
    width: 100%;
    height: 42px;
    border: 1px solid #3b4656;
    border-radius: 8px;
    background: #18202b;
    color: #edf2f7;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 600;
}

.view-button:hover {
    background: #222c39;
}


/* LOADING */

.loading-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8f9aaa;
    gap: 12px;
}

.spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}


/* ERROR */

.error-box {
    margin: 24px 32px 0;
    padding: 13px 15px;
    border: 1px solid #493137;
    background: #21171b;
    color: #d9aeb5;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
}

.error-box button {
    border: 0;
    background: transparent;
    color: #e5b8bf;
    cursor: pointer;
}


/* EMPTY */

.empty-state {
    min-height: 300px;
    border: 1px dashed #303947;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #7e8999;
}

.empty-state h3 {
    color: #c9d0da;
    margin: 14px 0 5px;
}

.empty-state p {
    margin: 0;
    font-size: 13px;
}


/* MODAL */

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.72);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 25px;
}

.preview-modal {
    width: min(1180px, 100%);
    max-height: 94vh;
    background: #10161e;
    border: 1px solid #293342;
    border-radius: 13px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.preview-header {
    min-height: 72px;
    padding: 0 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #252e39;
}

.preview-small-title {
    font-size: 10px;
    color: #7f8b9b;
    letter-spacing: 1px;
    font-weight: 700;
}

.preview-header h2 {
    margin: 4px 0 0;
    font-size: 19px;
}

.preview-scroll {
    overflow: auto;
    padding: 30px;
    background: #0a0e13;
}


/* ORIGINAL PDF MODAL */

.pdf-preview-modal {
    width: min(1250px, 100%);
    height: 94vh;
}

.original-pdf-container {
    flex: 1;
    min-height: 0;
    padding: 18px;
    background: #0a0e13;
    display: flex;
    align-items: stretch;
    justify-content: center;
}

.original-pdf-frame {
    width: 100%;
    height: 100%;
    min-height: 600px;
    border: 0;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.35);
}

.pdf-not-found {
    width: 100%;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #7f8a99;
    border: 1px dashed #303947;
    border-radius: 8px;
}

.pdf-not-found h3 {
    margin: 5px 0 0;
    color: #c9d0da;
}

.pdf-not-found p {
    margin: 0;
    font-size: 12px;
}

/* MODAL FOOTER */

.preview-modal-footer {
    min-height: 65px;
    padding: 0 22px;
    border-top: 1px solid #252e39;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
}

.preview-info {
    display: flex;
    gap: 20px;
    color: #7f8a99;
    font-size: 11px;
}

.preview-info strong {
    color: #cbd3dd;
    margin-left: 5px;
}

.close-preview-button {
    height: 38px;
    padding: 0 17px;
    border: 1px solid #333e4c;
    border-radius: 7px;
    background: #1a212b;
    color: #e4e9ef;
    cursor: pointer;
}


.preview-footer-actions {
    display: flex;
    align-items: center;
    gap: 9px;
}

.open-pdf-button {
    height: 38px;
    padding: 0 15px;
    border: 1px solid #333e4c;
    border-radius: 7px;
    background: #1a212b;
    color: #e4e9ef;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    text-decoration: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
}

.open-pdf-button:hover {
    background: #222c39;
}

/* RESPONSIVE */

@media (max-width: 800px) {

    .templates-header {
        padding: 0 16px;
    }

    .templates-content {
        padding: 20px 16px;
    }

    .template-grid {
        grid-template-columns: 1fr;
    }

    .preview-scroll {
        padding: 15px;
    }

    .original-pdf-container {
        padding: 10px;
    }

    .original-pdf-frame {
        min-height: 500px;
    }

    .preview-modal-footer {
        flex-direction: column;
        align-items: stretch;
        padding: 12px 16px;
    }

    .preview-info {
        flex-wrap: wrap;
    }

    .preview-footer-actions {
        width: 100%;
        flex-direction: column;
    }

    .open-pdf-button,
    .close-preview-button {
        width: 100%;
        justify-content: center;
    }

}

`;

export default Templates;