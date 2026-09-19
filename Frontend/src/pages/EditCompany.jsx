import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import {
    ArrowLeft,
    Building2,
    Check,
    ImagePlus,
    Loader2,
    Save,
    Upload,
} from "lucide-react";


const API_URL =
    "http://localhost:3000";


function EditCompany() {

    const { companyId } =
        useParams();

    const navigate =
        useNavigate();

    const fileInputRef =
        useRef(null);


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [templates, setTemplates] =
        useState([]);

    const [logoFile, setLogoFile] =
        useState(null);

    const [logoPreview, setLogoPreview] =
        useState(null);


    const [formData, setFormData] =
        useState({

            name: "",
            email: "",
            contactNumber: "",
            address: "",
            gstin: "",
            pan: "",
            website: "",
            templateId: "",
            isActive: true

        });


    /* =====================================================
       FETCH COMPANY + TEMPLATES
    ===================================================== */

    useEffect(() => {

        const fetchData =
            async () => {

                try {

                    setLoading(true);


                    const [
                        companyResponse,
                        templateResponse
                    ] =
                        await Promise.all([

                            axios.get(
                                `${API_URL}/api/company/${companyId}`,
                                {
                                    withCredentials: true
                                }
                            ),

                            axios.get(
                                `${API_URL}/api/templates`,
                                {
                                    withCredentials: true
                                }
                            )

                        ]);


                    /* ======================================
                       COMPANY
                    ====================================== */

                    const company =
                        companyResponse
                            .data
                            .company;


                    setFormData({

                        name:
                            company.name || "",

                        email:
                            company.email || "",

                        contactNumber:
                            company.contactNumber || "",

                        address:
                            company.address || "",

                        gstin:
                            company.gstin || "",

                        pan:
                            company.pan || "",

                        website:
                            company.website || "",

                        templateId:
                            company.templateId?._id || "",

                        isActive:
                            company.isActive ?? true

                    });


                    if (company.logoUrl) {

                        setLogoPreview(
                            company.logoUrl
                        );

                    }


                    /* ======================================
                       TEMPLATES
                    ====================================== */

                    setTemplates(
                        templateResponse
                            .data
                            .templates || []
                    );


                } catch (error) {

                    console.error(
                        "Edit Company Load Error:",
                        error
                    );


                    if (
                        error.response?.status === 401
                    ) {

                        toast.error(
                            "Session expired. Please login again."
                        );

                        navigate("/");

                        return;

                    }


                    toast.error(
                        error.response?.data?.message ||
                        "Failed to load company"
                    );


                } finally {

                    setLoading(false);

                }

            };


        if (companyId) {
            fetchData();
        }

    }, [companyId, navigate]);


    /* =====================================================
       INPUT CHANGE
    ===================================================== */

    const handleChange =
        (event) => {

            const {
                name,
                value
            } = event.target;


            setFormData(
                (previous) => ({

                    ...previous,

                    [name]: value

                })
            );

        };


    /* =====================================================
       LOGO SELECT
    ===================================================== */

    const handleLogoChange =
        (event) => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                toast.error(
                    "Please select an image file"
                );

                return;

            }


            setLogoFile(file);


            const previewUrl =
                URL.createObjectURL(file);


            setLogoPreview(
                previewUrl
            );

        };


    /* =====================================================
       SAVE COMPANY
    ===================================================== */

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            if (
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.contactNumber.trim() ||
                !formData.address.trim() ||
                !formData.templateId
            ) {

                toast.error(
                    "Please fill all required fields"
                );

                return;

            }


            try {

                setSaving(true);


                const data =
                    new FormData();


                data.append(
                    "name",
                    formData.name.trim()
                );


                data.append(
                    "email",
                    formData.email.trim()
                );


                data.append(
                    "contactNumber",
                    formData.contactNumber.trim()
                );


                data.append(
                    "address",
                    formData.address.trim()
                );


                data.append(
                    "gstin",
                    formData.gstin.trim()
                );


                data.append(
                    "pan",
                    formData.pan.trim()
                );


                data.append(
                    "website",
                    formData.website.trim()
                );


                data.append(
                    "templateId",
                    formData.templateId
                );


                data.append(
                    "isActive",
                    String(formData.isActive)
                );


                if (logoFile) {

                    data.append(
                        "logo",
                        logoFile
                    );

                }


                const response =
                    await axios.put(

                        `${API_URL}/api/company/${companyId}`,

                        data,

                        {
                            withCredentials: true
                        }

                    );


                if (
                    response.data?.success
                ) {

                    toast.success(
                        "Company updated successfully"
                    );


                    navigate(
                        "/Dashboard"
                    );

                }

            } catch (error) {

                console.error(
                    "Update Company Error:",
                    error
                );


                toast.error(
                    error.response?.data?.message ||
                    "Failed to update company"
                );

            } finally {

                setSaving(false);

            }

        };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-950 flex items-center justify-center">

                <div className="text-center">

                    <Loader2
                        size={40}
                        className="mx-auto animate-spin text-cyan-400"
                    />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading company...
                    </p>

                </div>

            </div>

        );

    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="min-h-screen bg-[#0b1120]">

            {/* HEADER */}

            <header className="border-b border-slate-800 bg-[#0b1120]">

                <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-5">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/Dashboard"
                            )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                    >

                        <ArrowLeft
                            size={19}
                        />

                    </button>


                    <div>

                        <h1 className="text-xl font-bold text-white">
                            Edit Company
                        </h1>

                        <p className="text-sm text-slate-500">
                            Update company information and payslip template
                        </p>

                    </div>

                </div>

            </header>


            {/* CONTENT */}

            <main className="mx-auto max-w-6xl px-6 py-8">

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-6 lg:grid-cols-[1fr_320px]"
                >

                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <div className="space-y-6">

                        {/* COMPANY INFORMATION */}

                        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                            <div className="mb-6 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">

                                    <Building2
                                        size={20}
                                    />

                                </div>

                                <div>

                                    <h2 className="font-semibold text-white">
                                        Company Information
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Basic company details
                                    </p>

                                </div>

                            </div>


                            <div className="grid gap-5 md:grid-cols-2">

                                <InputField
                                    label="Company Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />


                                <InputField
                                    label="Company Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />


                                <InputField
                                    label="Contact Number"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    required
                                />


                                <InputField
                                    label="Website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                />


                                <InputField
                                    label="GSTIN"
                                    name="gstin"
                                    value={formData.gstin}
                                    onChange={handleChange}
                                />


                                <InputField
                                    label="PAN"
                                    name="pan"
                                    value={formData.pan}
                                    onChange={handleChange}
                                />


                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-slate-300">

                                        Address
                                        <span className="ml-1 text-red-400">
                                            *
                                        </span>

                                    </label>


                                    <textarea
                                        name="address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={4}
                                        required
                                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
                                    />

                                </div>

                            </div>

                        </section>


                        {/* TEMPLATE */}

                        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                            <div className="mb-6">

                                <h2 className="font-semibold text-white">
                                    Payslip Template
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Select the template used for this company
                                </p>

                            </div>


                            <div className="grid gap-4 md:grid-cols-2">

                                {templates.map(
                                    (template) => {

                                        const selected =
                                            formData.templateId ===
                                            template._id;


                                        return (

                                            <button
                                                type="button"
                                                key={
                                                    template._id
                                                }
                                                onClick={() =>
                                                    setFormData(
                                                        (previous) => ({
                                                            ...previous,
                                                            templateId:
                                                                template._id
                                                        })
                                                    )
                                                }
                                                className={`relative rounded-2xl border p-5 text-left transition ${
                                                    selected
                                                        ? "border-cyan-500 bg-cyan-500/10"
                                                        : "border-slate-700 bg-slate-950 hover:border-slate-500"
                                                }`}
                                            >

                                                {selected && (

                                                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-slate-950">

                                                        <Check
                                                            size={15}
                                                        />

                                                    </div>

                                                )}


                                                <h3 className="pr-8 text-sm font-semibold text-white">

                                                    {
                                                        template.templateName
                                                    }

                                                </h3>


                                                <p className="mt-2 text-xs leading-5 text-slate-500">

                                                    {
                                                        template.description ||
                                                        "Payslip template"
                                                    }

                                                </p>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        </section>

                    </div>


                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <aside className="space-y-6">

                        {/* LOGO */}

                        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                            <h2 className="font-semibold text-white">
                                Company Logo
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Existing logo can be replaced
                            </p>


                            <div className="mt-5">

                                <div className="flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-700 bg-slate-950">

                                    {logoPreview ? (

                                        <img
                                            src={
                                                logoPreview
                                            }
                                            alt="Company Logo"
                                            className="max-h-full max-w-full object-contain p-6"
                                        />

                                    ) : (

                                        <div className="text-center">

                                            <ImagePlus
                                                size={34}
                                                className="mx-auto text-slate-600"
                                            />

                                            <p className="mt-3 text-xs text-slate-500">
                                                No company logo
                                            </p>

                                        </div>

                                    )}

                                </div>


                                <input
                                    ref={
                                        fileInputRef
                                    }
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleLogoChange
                                    }
                                    className="hidden"
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                                >

                                    <Upload
                                        size={17}
                                    />

                                    Replace Logo

                                </button>

                            </div>

                        </section>


                        {/* STATUS */}

                        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="font-semibold text-white">
                                        Company Status
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Active companies can create payslips
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData(
                                            (previous) => ({
                                                ...previous,
                                                isActive:
                                                    !previous.isActive
                                            })
                                        )
                                    }
                                    className={`relative h-7 w-12 rounded-full transition ${
                                        formData.isActive
                                            ? "bg-cyan-500"
                                            : "bg-slate-700"
                                    }`}
                                >

                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                                            formData.isActive
                                                ? "left-6"
                                                : "left-1"
                                        }`}
                                    />

                                </button>

                            </div>

                        </section>


                        {/* ACTIONS */}

                        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {saving ? (

                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Saving...

                                    </>

                                ) : (

                                    <>
                                        <Save
                                            size={18}
                                        />

                                        Save Changes
                                    </>

                                )}

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/Dashboard"
                                    )
                                }
                                className="mt-3 w-full rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                            >
                                Cancel
                            </button>

                        </section>

                    </aside>

                </form>

            </main>

        </div>

    );

}


/* =========================================================
   INPUT COMPONENT
========================================================= */

function InputField({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false
}) {

    return (

        <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">

                {label}

                {required && (

                    <span className="ml-1 text-red-400">
                        *
                    </span>

                )}

            </label>


            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
            />

        </div>

    );

}


export default EditCompany;