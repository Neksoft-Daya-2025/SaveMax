/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Building2,
    User,
    Mail,
    Lock,
    Phone,
    MapPin,
    CheckCircle,
    ArrowLeft,
    Loader2,
    Shield,
    Key,
    Check,
    DollarSign,
    Clock,
    Globe
} from "lucide-react";
import { getAllCurrencies } from "@/lib/currency";
import { getAllTimezones } from "@/lib/timezones";
import SearchableSelect from "@/components/dashboard/SearchableSelect";

export default function CreateOrganizationPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successData, setSuccessData] = useState<any>(null);

    const currencies = useMemo(() => getAllCurrencies(), []);
    const timezones = useMemo(() => getAllTimezones(), []);

    const currencyOptions = useMemo(() => {
        return currencies.map((c) => ({
            value: c.code,
            label: `${c.code} - ${c.name}`,
            subLabel: `Symbol: ${c.symbol} (${c.symbolNative || c.symbol})`,
            badge: c.symbol,
        }));
    }, [currencies]);

    const timezoneOptions = useMemo(() => {
        return timezones.map((tz) => ({
            value: tz.value,
            label: tz.label,
            subLabel: `Region: ${tz.region} • Offset: GMT${tz.offset}`,
            badge: `GMT${tz.offset}`,
        }));
    }, [timezones]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        currency: "USD",
        timezone: "UTC",
        plan: "monthly",
        subscriptionStatus: "active",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
    });

    useEffect(() => {
        // Fetch SaaS platform defaults for currency and timezone
        const fetchDefaults = async () => {
            try {
                const res = await fetch("/api/superadmin/settings");
                const data = await res.json();
                if (data.success && data.data) {
                    setFormData((prev) => ({
                        ...prev,
                        currency: data.data.currency || prev.currency,
                        timezone: data.data.timezone || prev.timezone,
                    }));
                }
            } catch (err) {
                console.error("Error fetching SaaS defaults:", err);
            }
        };
        fetchDefaults();
    }, []);

    const handleAutoGeneratePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        let pwd = "";
        for (let i = 0; i < 12; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({ ...prev, adminPassword: pwd }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.email || !formData.adminEmail || !formData.adminPassword) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.adminPassword.length < 6) {
            setError("Administrator password must be at least 6 characters.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/superadmin/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                setSuccessData(data.data);
            } else {
                setError(data.error || "Failed to create organization.");
            }
        } catch (err: any) {
            console.error("Error provisioning organization:", err);
            setError("A network error occurred while provisioning organization.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/superadmin/organizations"
                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Provision New Organization</h1>
                    <p className="text-gray-500 text-xs mt-0.5">
                        Create a dedicated tenant workspace, provision scoped Admin/Agent/Customer roles, and assign a subscription tier.
                    </p>
                </div>
            </div>

            {successData ? (
                /* Success Card */
                <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center space-y-6 shadow-xs">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle className="w-8 h-8" />
                    </div>

                    <div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            Tenant Provisioned Successfully
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900 mt-3">{successData.organization.name}</h2>
                        <p className="text-gray-500 text-xs mt-1">Tenant Slug: <code className="text-blue-800 font-mono bg-blue-50 px-1.5 py-0.5 rounded">/{successData.organization.slug}</code></p>
                    </div>

                    <div className="max-w-md mx-auto p-4 bg-gray-50 border border-gray-200 rounded-xl text-left space-y-2 text-xs">
                        <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Organization Admin Login Credentials</p>
                        <div className="flex justify-between py-1 border-b border-gray-200">
                            <span className="text-gray-500">Admin Email:</span>
                            <span className="font-mono text-gray-900 font-bold">{successData.admin.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200">
                            <span className="text-gray-500">Subscription Plan:</span>
                            <span className="font-bold text-emerald-700 uppercase">{successData.organization.plan}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-500">Roles Initialized:</span>
                            <span className="text-blue-900 font-bold">Admin, Agent, Customer</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                        <Link
                            href={`/superadmin/organizations/${successData.organization.id}`}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-sm"
                        >
                            View Organization Details
                        </Link>
                        <Link
                            href="/superadmin/organizations"
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Back to Directory
                        </Link>
                    </div>
                </div>
            ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Organization Details */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center text-xs font-bold">
                                1
                            </div>
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Organization Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Company / Organization Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Skyline Real Estate Ltd"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Organization Contact Email <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="info@skylinerealty.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-1234"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Physical Address / Headquarters</label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="123 Park Avenue, New York, NY"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Organization Localization Defaults */}
                        <div className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <SearchableSelect
                                    label="Organization Currency"
                                    value={formData.currency}
                                    onChange={(val) => setFormData({ ...formData, currency: val })}
                                    options={currencyOptions}
                                    placeholder="Select organization currency..."
                                    searchPlaceholder="Search currency code, name, symbol..."
                                    icon={<DollarSign className="w-4 h-4" />}
                                />
                            </div>

                            <div>
                                <SearchableSelect
                                    label="Organization Timezone"
                                    value={formData.timezone}
                                    onChange={(val) => setFormData({ ...formData, timezone: val })}
                                    options={timezoneOptions}
                                    placeholder="Select organization timezone..."
                                    searchPlaceholder="Search timezone, city, region..."
                                    icon={<Clock className="w-4 h-4" />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Primary Admin User */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center text-xs font-bold">
                                2
                            </div>
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Organization Administrator Account</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Admin Full Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.adminName}
                                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                        placeholder="e.g. John Doe"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Admin Login Email <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.adminEmail}
                                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                        placeholder="admin@skylinerealty.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-gray-700">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAutoGeneratePassword}
                                        className="text-[10px] text-blue-900 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        <Key className="w-3 h-3" /> Auto-generate
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.adminPassword}
                                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                        placeholder="Min. 6 characters"
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Subscription Plan Tier */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center text-xs font-bold">
                                3
                            </div>
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Subscription Tier & Status</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Monthly Plan Card */}
                            <div
                                onClick={() => setFormData({ ...formData, plan: "monthly" })}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.plan === "monthly"
                                        ? "bg-blue-50/70 border-blue-900 shadow-xs"
                                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Standard</span>
                                    {formData.plan === "monthly" && <Check className="w-4 h-4 text-blue-900" />}
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Professional Monthly</h3>
                                <p className="text-xl font-black text-gray-900 mt-1">$49 <span className="text-xs font-normal text-gray-500">/ month</span></p>
                                <p className="text-xs text-gray-500 mt-2">Billed on a recurring 30-day billing cycle.</p>
                            </div>

                            {/* Yearly Plan Card */}
                            <div
                                onClick={() => setFormData({ ...formData, plan: "yearly" })}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.plan === "yearly"
                                        ? "bg-emerald-50/70 border-emerald-600 shadow-xs"
                                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Best Value (Save ~17%)</span>
                                    {formData.plan === "yearly" && <Check className="w-4 h-4 text-emerald-700" />}
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Enterprise Annual</h3>
                                <p className="text-xl font-black text-gray-900 mt-1">$490 <span className="text-xs font-normal text-gray-500">/ year</span></p>
                                <p className="text-xs text-gray-500 mt-2">Billed annually. Includes 2 months free equivalent.</p>
                            </div>
                        </div>

                        {/* Subscription Status */}
                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Initial Subscription Status</label>
                            <select
                                value={formData.subscriptionStatus}
                                onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="active">Active (Full access immediately)</option>
                                <option value="trial">Trial Period (14-Day Free Evaluation)</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href="/superadmin/organizations"
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Provisioning Tenant...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    Provision Organization
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
