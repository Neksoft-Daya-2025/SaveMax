/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    Mail,
    Lock,
    User,
    Phone,
    CheckCircle2,
    Sparkles,
    X,
    Loader2,
    ArrowRight,
    ArrowLeft,
    Check,
    Eye,
    EyeOff,
    Key,
    Shield,
    DollarSign,
    Zap
} from "lucide-react";

interface OrganizationSignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultPlan?: "monthly" | "yearly";
}

export default function OrganizationSignupModal({
    isOpen,
    onClose,
    defaultPlan = "monthly",
}: OrganizationSignupModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        currency: "USD",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        plan: defaultPlan,
    });

    // Synchronize default plan if changed from props
    useEffect(() => {
        if (defaultPlan) {
            setFormData((prev) => ({ ...prev, plan: defaultPlan }));
        }
    }, [defaultPlan]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !loading) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, loading, onClose]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleAutoGeneratePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        let pwd = "";
        for (let i = 0; i < 12; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({ ...prev, adminPassword: pwd }));
        setShowPassword(true);
    };

    const handleNextStep = () => {
        setError("");
        if (step === 1) {
            if (!formData.name.trim()) {
                setError("Please enter your organization or company name.");
                return;
            }
            if (!formData.email.trim()) {
                setError("Please enter your organization contact email.");
                return;
            }
            // If admin email is empty, prefill with organization email
            if (!formData.adminEmail) {
                setFormData((prev) => ({ ...prev, adminEmail: prev.email }));
            }
            setStep(2);
        } else if (step === 2) {
            if (!formData.adminEmail.trim()) {
                setError("Please enter the administrator login email.");
                return;
            }
            if (!formData.adminPassword || formData.adminPassword.length < 6) {
                setError("Password must be at least 6 characters.");
                return;
            }
            setStep(3);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/public/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                setSuccessData(data.data);
            } else {
                setError(data.error || "Failed to create organization. Please try again.");
            }
        } catch (err: any) {
            console.error("Signup error:", err);
            setError("A network error occurred. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        onClose();
        if (successData?.admin?.email) {
            router.push(`/login?email=${encodeURIComponent(successData.admin.email)}&registered=true`);
        } else {
            router.push("/login");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur Overlay */}
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
                onClick={() => !loading && onClose()}
            />

            {/* Modal Dialog Container */}
            <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 text-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
                {/* Top Glowing Ambient Gradient Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Close Button */}
                {!loading && (
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-20"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="p-6 sm:p-8">
                    {successData ? (
                        /* ================= SUCCESS STATE ================= */
                        <div className="text-center py-4 space-y-6 animate-in fade-in duration-300">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                                    <Sparkles className="w-3.5 h-3.5" /> 14-Day Free Trial Activated
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Workspace Ready!
                                </h3>
                                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                                    Your dedicated organization environment for <span className="text-white font-semibold">{successData.organization.name}</span> has been provisioned.
                                </p>
                            </div>

                            {/* Workspace Credentials Box */}
                            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5 text-xs max-w-md mx-auto">
                                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                                    <span className="text-slate-400">Workspace Slug:</span>
                                    <span className="font-mono text-indigo-400 font-semibold bg-indigo-950/50 px-2 py-0.5 rounded">
                                        /{successData.organization.slug}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                                    <span className="text-slate-400">Admin Email:</span>
                                    <span className="font-mono text-white font-bold">{successData.admin.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-slate-400">Configured Tier:</span>
                                    <span className="font-bold text-emerald-400 uppercase tracking-wider">
                                        {successData.organization.plan} • Free Trial
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleLoginRedirect}
                                className="w-full max-w-md py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto"
                            >
                                <span>Sign In to Your Workspace</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        /* ================= MULTI-STEP CREATION FORM ================= */
                        <div>
                            {/* Modal Header */}
                            <div className="text-left mb-6">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                                    <Zap className="w-3.5 h-3.5" /> Instant Cloud Setup
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Create Your Organization
                                </h2>
                                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                                    Start your 14-day free trial. No credit card required.
                                </p>
                            </div>

                            {/* Step Indicator Progress Bar */}
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                {[
                                    { num: 1, label: "Organization" },
                                    { num: 2, label: "Admin Account" },
                                    { num: 3, label: "Plan & Trial" },
                                ].map((s) => (
                                    <div
                                        key={s.num}
                                        className={`pb-2 border-b-2 transition-all text-left ${
                                            step === s.num
                                                ? "border-indigo-500 text-indigo-400 font-bold"
                                                : step > s.num
                                                ? "border-emerald-500 text-emerald-400"
                                                : "border-slate-800 text-slate-500"
                                        }`}
                                    >
                                        <div className="text-[10px] uppercase font-bold tracking-wider">
                                            Step {s.num}
                                        </div>
                                        <div className="text-xs truncate">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Error Alert Box */}
                            {error && (
                                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* ================= STEP 1: ORGANIZATION DETAILS ================= */}
                                {step === 1 && (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                                Company / Organization Name <span className="text-rose-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g. Apex Realty Management"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                                Organization Email <span className="text-rose-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="contact@apexrealty.com"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                                    Phone (Optional)
                                                </label>
                                                <div className="relative">
                                                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+1 (555) 000-0000"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                                    Operating Currency
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                    <select
                                                        value={formData.currency}
                                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="USD">USD ($) - US Dollar</option>
                                                        <option value="EUR">EUR (€) - Euro</option>
                                                        <option value="GBP">GBP (£) - British Pound</option>
                                                        <option value="CAD">CAD ($) - Canadian Dollar</option>
                                                        <option value="AUD">AUD ($) - Australian Dollar</option>
                                                        <option value="AED">AED (د.إ) - UAE Dirham</option>
                                                        <option value="SAR">SAR (﷼) - Saudi Riyal</option>
                                                        <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                                                        <option value="INR">INR (₹) - Indian Rupee</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ================= STEP 2: ADMINISTRATOR ACCOUNT ================= */}
                                {step === 2 && (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                                Your Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={formData.adminName}
                                                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                                    placeholder="e.g. Sarah Jenkins"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                                Admin Login Email <span className="text-rose-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.adminEmail}
                                                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                                    placeholder="admin@apexrealty.com"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                                    Password <span className="text-rose-400">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleAutoGeneratePassword}
                                                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <Key className="w-3 h-3" /> Auto-generate
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    minLength={6}
                                                    value={formData.adminPassword}
                                                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                                    placeholder="Min. 6 characters"
                                                    className="w-full pl-10 pr-12 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ================= STEP 3: PLAN & TRIAL SUMMARY ================= */}
                                {step === 3 && (
                                    <div className="space-y-4 animate-in fade-in duration-200">
                                        <p className="text-xs text-slate-400">
                                            Choose your target billing cycle. You will not be charged during the 14-day evaluation period.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Monthly Plan Option */}
                                            <div
                                                onClick={() => setFormData({ ...formData, plan: "monthly" })}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    formData.plan === "monthly"
                                                        ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/20"
                                                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Monthly</span>
                                                    {formData.plan === "monthly" && <Check className="w-4 h-4 text-indigo-400" />}
                                                </div>
                                                <div className="text-lg font-black text-white">$49 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                                                <p className="text-[11px] text-slate-400 mt-1">Full access to all property & tenant features.</p>
                                            </div>

                                            {/* Yearly Plan Option */}
                                            <div
                                                onClick={() => setFormData({ ...formData, plan: "yearly" })}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    formData.plan === "yearly"
                                                        ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20"
                                                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Annual (Best Value)</span>
                                                    {formData.plan === "yearly" && <Check className="w-4 h-4 text-purple-400" />}
                                                </div>
                                                <div className="text-lg font-black text-white">$490 <span className="text-xs font-normal text-slate-400">/ yr</span></div>
                                                <p className="text-[11px] text-emerald-400 font-semibold mt-1">Includes 2 Months Free</p>
                                            </div>
                                        </div>

                                        {/* Review Summary Card */}
                                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                                            <div className="flex justify-between text-slate-400">
                                                <span>Company:</span>
                                                <span className="text-white font-semibold">{formData.name}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span>Admin Email:</span>
                                                <span className="text-white font-mono">{formData.adminEmail}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span>Trial Period:</span>
                                                <span className="text-emerald-400 font-bold">14 Days Free</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                                    {step > 1 ? (
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => setStep((s) => (s - 1) as any)}
                                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Back
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer ml-auto"
                                        >
                                            <span>Continue</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 cursor-pointer ml-auto disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Provisioning Workspace...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-4 h-4" />
                                                    <span>Start 14-Day Free Trial</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
