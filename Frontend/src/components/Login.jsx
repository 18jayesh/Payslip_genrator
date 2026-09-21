import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // =========================
  // Handle Input Change
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // Login
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Empty Email
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Empty Password
    if (!formData.password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      toast.success(
        response.data?.message || "Login successful"
      );

      // Redirect after successful login
      navigate("/Dashboard");

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center p-3 overflow-hidden">
      {/* Main Container */}
      <div className="w-full max-w-5xl h-[560px] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">

        {/* =========================
            LEFT SIDE
        ========================== */}
        <div className="relative hidden lg:flex lg:w-[46%] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 overflow-hidden">

          {/* Background Circles */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-sm" />

          <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-black/10" />

          <div className="absolute top-1/2 -right-20 w-64 h-64 rounded-full bg-white/5" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between w-full">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Sparkles
                  size={20}
                  className="text-white"
                />
              </div>

              <span className="text-white text-lg font-bold tracking-tight">
                Nexus
              </span>
            </div>

            {/* Hero Text */}
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4">
                <span className="w-2 h-2 bg-emerald-300 rounded-full" />

                <span className="text-white/90 text-xs font-medium">
                  Everything starts here
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white leading-[1.15] tracking-tight">
                Your work.
                <br />
                Your space.
                <br />

                <span className="text-white/60">
                  Your control.
                </span>
              </h1>

              <p className="mt-4 text-white/70 text-sm leading-6 max-w-sm">
                Access your workspace, manage your projects,
                and keep everything organized from one powerful
                platform.
              </p>
            </div>

            {/* Bottom Info */}
            <div>
              <div className="flex items-center gap-3">

                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-[11px] font-semibold">
                    JD
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-[11px] font-semibold">
                    AM
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-[11px] font-semibold">
                    RK
                  </div>
                </div>

                <div>
                  <p className="text-white text-sm font-medium">
                    Trusted by professionals
                  </p>

                  <p className="text-white/50 text-xs">
                    Join thousands of productive users
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* =========================
            RIGHT SIDE
        ========================== */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-6 sm:px-10">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Sparkles
                  size={18}
                  className="text-white"
                />
              </div>

              <span className="text-lg font-bold text-slate-900">
                Nexus
              </span>
            </div>

            {/* Header */}
            <div className="mb-5">
              <p className="text-indigo-600 text-xs font-bold tracking-[0.2em] mb-2">
                WELCOME BACK
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Sign in to your account
              </h2>

              <p className="text-slate-500 mt-2 text-sm leading-6">
                Enter your credentials to continue to your
                workspace.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="w-full h-11 pl-11 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight size={18} />
                  </>
                )}
              </button>

            </form>

            {/* Security */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <ShieldCheck
                size={14}
                className="text-emerald-500"
              />

              <span className="text-xs text-slate-400">
                Your information is securely protected
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
