/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Building2,
    Mail,
    Lock,
    User,
    Phone,
    CheckCircle2,
    Sparkles,
    Loader2,
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    Key,
    Shield,
    DollarSign,
    Zap,
    Layers,
    Clock,
    Users,
    ChevronRight
} from "lucide-react";

interface OrganizationSignupSectionProps {
    initialPlan?: "monthly" | "yearly";
    selectedPlan?: "monthly" | "yearly";
    onPlanChange?: (plan: "monthly" | "yearly") => void;
    badgeText?: string;
    title?: string;
    subtitle?: string;
}

export default function OrganizationSignupSection({
    initialPlan = "monthly",
    selectedPlan,
    onPlanChange,
    badgeText,
    title,
    subtitle,
}: OrganizationSignupSectionProps) {
    const router = useRouter();
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
        plan: selectedPlan || initialPlan,
    });

    useEffect(() => {
        if (selectedPlan) {
            setFormData((prev) => ({ ...prev, plan: selectedPlan }));
        }
    }, [selectedPlan]);

    const handlePlanSelect = (plan: "monthly" | "yearly") => {
        setFormData((prev) => ({ ...prev, plan }));
        if (onPlanChange) {
            onPlanChange(plan);
        }
    };

    const handleAutoGeneratePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        let pwd = "";
        for (let i = 0; i < 12; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({ ...prev, adminPassword: pwd }));
        setShowPassword(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Please enter your organization or company name.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your organization contact email.");
            return;
        }

        if (!formData.adminEmail.trim()) {
            setError("Please enter the administrator login email.");
            return;
        }

        if (!formData.adminPassword || formData.adminPassword.length < 6) {
            setError("Administrator password must be at least 6 characters.");
            return;
        }

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

    return (
        <section id="register-organization" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative scroll-mt-20">
            {/* Ambient Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{badgeText || "Instant Multi-Tenant Workspace Provisioning"}</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        {title || "Create Your Organization Workspace"}
                    </h2>
                    <p className="text-slate-400 text-base sm:text-lg">
                        {subtitle || (
                            <>
                                Get started with your <span className="text-indigo-300 font-semibold">14-day free trial</span>. No credit card required. Isolated tenant database, custom branding, and automatic 3-tier roles setup.
                            </>
                        )}
                    </p>
                </div>

                {successData ? (
                    /* ================= SUCCESS STATE ================= */
                    <div className="max-w-2xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Sparkles className="w-3.5 h-3.5" /> 14-Day Free Trial Activated
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Organization Provisioned Successfully!
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                                Workspace for <span className="text-white font-bold">{successData.organization.name}</span> is live and ready for sign-in.
                            </p>
                        </div>

                        {/* Workspace Credentials Box */}
                        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3 text-xs max-w-md mx-auto">
                            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Workspace Slug:</span>
                                <span className="font-mono text-indigo-400 font-semibold bg-indigo-950/50 px-2.5 py-0.5 rounded">
                                    /{successData.organization.slug}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Admin Login Email:</span>
                                <span className="font-mono text-white font-bold">{successData.admin.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400">Subscription Tier:</span>
                                <span className="font-bold text-emerald-400 uppercase tracking-wider">
                                    {successData.organization.plan} • Free Trial Active
                                </span>
                            </div>
                        </div>

                        <Link
                            href={`/login?email=${encodeURIComponent(successData.admin.email)}&registered=true`}
                            className="w-full max-w-md py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto"
                        >
                            <span>Sign In to Your Organization</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    /* ================= SPLIT REGISTRATION LAYOUT ================= */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* Left Feature & Value Pillars Card */}
                        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-8 backdrop-blur-xl shadow-xl">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>Included In Every Organization</span>
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">
                                    Everything Pre-Configured
                                </h3>
                                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                                    When you create an organization, SaveMAX automatically seeds dedicated security parameters and user roles for your team.
                                </p>

                                <div className="space-y-4 mt-6">
                                    {[
                                        {
                                            icon: Shield,
                                            title: "Tenant-Isolated Database Scope",
                                            desc: "Your properties, financial ledgers, and tenant records are strictly isolated."
                                        },
                                        {
                                            icon: Users,
                                            title: "Automated 3-Tier Roles",
                                            desc: "Instant Admin, Agent, and Tenant portal permissions pre-configured."
                                        },
                                        {
                                            icon: Clock,
                                            title: "14 Days of Enterprise Access",
                                            desc: "Test unlimited units, contracts, maintenance orders, and AI analytics."
                                        },
                                        {
                                            icon: DollarSign,
                                            title: "Zero Upfront Billing",
                                            desc: "No credit card needed today. Upgrade or change plans anytime."
                                        }
                                    ].map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={i} className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-center justify-between">
                                <span className="font-semibold text-indigo-300">Already registered?</span>
                                <Link
                                    href="/login"
                                    className="font-bold text-white hover:text-indigo-200 transition-colors flex items-center gap-1"
                                >
                                    <span>Sign in here</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* Right Form Card */}
                        <div className="lg:col-span-7 bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl">
                            {/* Error Alert Box */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Plan Selection Toggle */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Selected Subscription Plan
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handlePlanSelect("monthly")}
                                            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                                formData.plan === "monthly"
                                                    ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/20"
                                                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Professional Monthly</span>
                                                {formData.plan === "monthly" && <Check className="w-4 h-4 text-indigo-400" />}
                                            </div>
                                            <div className="text-base font-black text-white">$49 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                                            <span className="text-[10px] text-slate-400">14-Day Free Evaluation</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handlePlanSelect("yearly")}
                                            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                                formData.plan === "yearly"
                                                    ? "bg-purple-950/40 border-purple-500 shadow-md shadow-purple-500/20"
                                                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Enterprise Annual</span>
                                                {formData.plan === "yearly" && <Check className="w-4 h-4 text-purple-400" />}
                                            </div>
                                            <div className="text-base font-black text-white">$490 <span className="text-xs font-normal text-slate-400">/ yr</span></div>
                                            <span className="text-[10px] text-emerald-400 font-semibold">Save ~17% • 2 Mo. Free</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Company / Org Name */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                            Organization / Company Name <span className="text-rose-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Apex Property Group"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Company Email */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                            Company Contact Email <span className="text-rose-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        email: val,
                                                        adminEmail: prev.adminEmail ? prev.adminEmail : val,
                                                    }));
                                                }}
                                                placeholder="info@apexrealty.com"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Operating Currency */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                            Operating Currency
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <select
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
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

                                <div className="border-t border-slate-800/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Admin Full Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                                            Admin Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={formData.adminName}
                                                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                                placeholder="e.g. John Doe"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Admin Login Email */}
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
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="sm:col-span-2">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                                Admin Password <span className="text-rose-400">*</span>
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
                                                className="w-full pl-10 pr-12 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
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

                                {/* Submit Action Button */}
                                <div className="pt-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Provisioning Organization Workspace...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-4 h-4 text-indigo-200" />
                                                <span>Start 14-Day Free Trial (Create Workspace)</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <p className="text-[11px] text-center text-slate-500">
                                    By creating an organization, you agree to our Terms of Service & Privacy Policy. No charges during trial.
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
