"use client";

import { useState, useEffect, useMemo } from "react";
import {
    CreditCard,
    Save,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Settings,
    Sparkles,
    Shield,
    DollarSign,
    Check,
    Phone,
    MapPin,
    Mail,
    Globe,
    Clock,
    Building2,
} from "lucide-react";
import { getAllCurrencies } from "@/lib/currency";
import { getAllTimezones } from "@/lib/timezones";
import SearchableSelect from "@/components/dashboard/SearchableSelect";

export default function SuperAdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

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

    const [platformSettings, setPlatformSettings] = useState({
        platformName: "PropertyNext SaaS",
        supportEmail: "contact@savemax.ro",
        phone: "+1 (555) 019-2834",
        address: "100 Enterprise Blvd, Suite 500, San Francisco, CA 94107",
        currency: "USD",
        timezone: "UTC",
        trialDays: 14,
        plans: {
            monthly: {
                id: "monthly",
                name: "Professional Monthly",
                price: 49,
                currency: "USD",
                billingInterval: "month",
                description: "Complete property & tenant management suite billed monthly.",
                features: [
                    "Up to 100 Properties & Units",
                    "Tenant & Lease Management",
                    "Automated Rent Collection & Invoicing",
                    "Maintenance & Work Order Tracking",
                    "Staff & Agent Role Permissions",
                    "Standard Financial Reports",
                    "Email & SMS Notifications",
                    "Standard Support",
                ],
                badge: "Popular",
                isActive: true,
            },
            yearly: {
                id: "yearly",
                name: "Enterprise Annual",
                price: 490,
                currency: "USD",
                billingInterval: "year",
                description: "Full-scale enterprise management with maximum savings & priority features.",
                features: [
                    "Unlimited Properties & Units",
                    "Advanced Tenant & Lease Lifecycle",
                    "Automated Rent Collection & Due Reminders",
                    "Maintenance & Emergency Dispatch Hub",
                    "Multi-Agent & Staff Roles Access",
                    "AI Property Analytics & Forecasting",
                    "Full Accounting, Expenses & Payroll",
                    "Custom Organization Branding & Logo",
                    "24/7 Priority Dedicated Support",
                ],
                badge: "Best Value",
                discountNotice: "Save ~17% (2 Months Free)",
                isActive: true,
            },
        },
        landingPage: {
            heroTitle: "Smart Property Management, Built for Modern Real Estate Enterprises",
            heroSubtitle: "Effortlessly manage thousands of properties, units, tenants, digital leases, automated rent collection, and AI-driven insights across all your portfolios in one unified multi-tenant SaaS workspace.",
            badgeText: "🚀 Multi-Tenant Property Management SaaS",
        },
    });

    const [newMonthlyFeature, setNewMonthlyFeature] = useState("");
    const [newYearlyFeature, setNewYearlyFeature] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/superadmin/settings");
            const data = await res.json();
            if (data.success && data.data) {
                setPlatformSettings((prev) => ({
                    ...prev,
                    ...data.data,
                    phone: data.data.phone || prev.phone,
                    address: data.data.address || prev.address,
                    currency: data.data.currency || prev.currency,
                    timezone: data.data.timezone || prev.timezone,
                    plans: data.data.plans || prev.plans,
                    landingPage: data.data.landingPage || prev.landingPage,
                }));
            }
        } catch (err) {
            console.error("Error loading SaaS settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const res = await fetch("/api/superadmin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(platformSettings),
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage("SaaS Subscription Plans and Platform Settings saved successfully!");
                setPlatformSettings((prev) => ({
                    ...prev,
                    ...data.data,
                }));
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("saas-settings-updated", { detail: data.data }));
                }
            } else {
                setError(data.error || "Failed to update SaaS settings.");
            }
        } catch (err: any) {
            console.error("Error saving SaaS settings:", err);
            setError("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const addFeature = (planKey: "monthly" | "yearly") => {
        const text = planKey === "monthly" ? newMonthlyFeature.trim() : newYearlyFeature.trim();
        if (!text) return;

        setPlatformSettings((prev: any) => {
            const currentFeatures = prev.plans[planKey].features || [];
            return {
                ...prev,
                plans: {
                    ...prev.plans,
                    [planKey]: {
                        ...prev.plans[planKey],
                        features: [...currentFeatures, text],
                    },
                },
            };
        });

        if (planKey === "monthly") setNewMonthlyFeature("");
        if (planKey === "yearly") setNewYearlyFeature("");
    };

    const removeFeature = (planKey: "monthly" | "yearly", index: number) => {
        setPlatformSettings((prev: any) => {
            const currentFeatures = [...(prev.plans[planKey].features || [])];
            currentFeatures.splice(index, 1);
            return {
                ...prev,
                plans: {
                    ...prev.plans,
                    [planKey]: {
                        ...prev.plans[planKey],
                        features: currentFeatures,
                    },
                },
            };
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-900 animate-spin mb-3" />
                <p className="text-xs text-gray-500">Loading SaaS settings & subscription plans...</p>
            </div>
        );
    }

    const monthlyPlan = platformSettings.plans?.monthly;
    const yearlyPlan = platformSettings.plans?.yearly;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SaaS Settings & Subscription Plans</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage platform identity, contact credentials, default billing currency, timezone, and official subscription tiers (Monthly & Yearly).
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Section 1: General SaaS Platform Settings & Localization (Moved Above Plans) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
                    <div className="pb-3 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            General SaaS Platform Settings & Localization
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Configure global platform identity, contact credentials, default billing currency, timezone, and trial period.
                        </p>
                    </div>

                    {/* Platform Profile & Contact Details */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-900" /> Platform Profile & Contact
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Platform / Brand Name</label>
                                <input
                                    type="text"
                                    required
                                    value={platformSettings.platformName}
                                    onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Support Contact Email</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        required
                                        value={platformSettings.supportEmail}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone Number</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={platformSettings.phone || ""}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, phone: e.target.value })}
                                        placeholder="+1 (555) 019-2834"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Headquarters / Business Address</label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={platformSettings.address || ""}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, address: e.target.value })}
                                        placeholder="100 Enterprise Blvd, Suite 500, San Francisco, CA"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Localization & Billing Defaults with Searchable Selects */}
                    <div className="pt-2 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-blue-900" /> Localization & Subscription Defaults
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <SearchableSelect
                                    label="Platform Currency"
                                    value={platformSettings.currency || "USD"}
                                    onChange={(newCurr) =>
                                        setPlatformSettings({
                                            ...platformSettings,
                                            currency: newCurr,
                                            plans: {
                                                ...platformSettings.plans,
                                                monthly: { ...platformSettings.plans.monthly, currency: newCurr },
                                                yearly: { ...platformSettings.plans.yearly, currency: newCurr },
                                            },
                                        })
                                    }
                                    options={currencyOptions}
                                    placeholder="Search and select currency..."
                                    searchPlaceholder="Search by currency code, name, or symbol..."
                                    icon={<DollarSign className="w-4 h-4" />}
                                />
                            </div>

                            <div>
                                <SearchableSelect
                                    label="Platform Timezone"
                                    value={platformSettings.timezone || "UTC"}
                                    onChange={(newTz) => setPlatformSettings({ ...platformSettings, timezone: newTz })}
                                    options={timezoneOptions}
                                    placeholder="Search and select timezone..."
                                    searchPlaceholder="Search by city, country, or GMT offset..."
                                    icon={<Clock className="w-4 h-4" />}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Free Trial Duration (Days)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={platformSettings.trialDays}
                                    onChange={(e) => setPlatformSettings({ ...platformSettings, trialDays: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Monthly Subscription Plan */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center font-extrabold text-sm">
                                1
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Monthly Subscription Plan</h2>
                                <p className="text-xs text-gray-500">Standard recurring monthly tier configured for all tenants</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200 uppercase tracking-wider self-start sm:self-auto">
                            Monthly Tier
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Name</label>
                            <input
                                type="text"
                                required
                                value={monthlyPlan.name}
                                onChange={(e) =>
                                    setPlatformSettings({
                                        ...platformSettings,
                                        plans: {
                                            ...platformSettings.plans,
                                            monthly: { ...monthlyPlan, name: e.target.value },
                                        },
                                    })
                                }
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Price ({platformSettings.currency})</label>
                            <input
                                type="number"
                                required
                                min={0}
                                value={monthlyPlan.price}
                                onChange={(e) =>
                                    setPlatformSettings({
                                        ...platformSettings,
                                        plans: {
                                            ...platformSettings.plans,
                                            monthly: { ...monthlyPlan, price: parseFloat(e.target.value) || 0 },
                                        },
                                    })
                                }
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Highlight (Optional)</label>
                            <input
                                type="text"
                                value={monthlyPlan.badge || ""}
                                onChange={(e) =>
                                    setPlatformSettings({
                                        ...platformSettings,
                                        plans: {
                                            ...platformSettings.plans,
                                            monthly: { ...monthlyPlan, badge: e.target.value },
                                        },
                                    })
                                }
                                placeholder="e.g. Popular"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Description</label>
                        <input
                            type="text"
                            value={monthlyPlan.description || ""}
                            onChange={(e) =>
                                setPlatformSettings({
                                    ...platformSettings,
                                    plans: {
                                        ...platformSettings.plans,
                                        monthly: { ...monthlyPlan, description: e.target.value },
                                    },
                                })
                            }
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Monthly Features List */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Included Feature Bullets (Displayed on Landing Page & Portal)
                        </label>
                        <div className="space-y-2 mb-3">
                            {monthlyPlan.features?.map((feat: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-700">
                                    <Check className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                                    <span className="flex-1 font-medium">{feat}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature("monthly", idx)}
                                        className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMonthlyFeature}
                                onChange={(e) => setNewMonthlyFeature(e.target.value)}
                                placeholder="Add new feature bullet point..."
                                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addFeature("monthly");
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => addFeature("monthly")}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 3: Yearly Subscription Plan */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                                2
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Yearly Subscription Plan (Annual)</h2>
                                <p className="text-xs text-gray-500">Discounted annual billing tier with premium enterprise capabilities</p>
                            </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider self-start sm:self-auto">
                            Annual Tier (Save ~17%)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Name</label>
                            <input
                                type="text"
                                required
                                value={yearlyPlan.name}
                                onChange={(e) =>
                                    setPlatformSettings({
                                        ...platformSettings,
                                        plans: {
                                            ...platformSettings.plans,
                                            yearly: { ...yearlyPlan, name: e.target.value },
                                        },
                                    })
                                }
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Price ({platformSettings.currency})</label>
                            <input
                                type="number"
                                required
                                min={0}
                                value={yearlyPlan.price}
                                onChange={(e) =>
                                    setPlatformSettings({
                                        ...platformSettings,
                                        plans: {
                                            ...platformSettings.plans,
                                            yearly: { ...yearlyPlan, price: parseFloat(e.target.value) || 0 },
                                        },
                                    })
                                }
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Tagline</label>
                            <input
                                type="text"
                                value={yearlyPlan.discountNotice || ""}
                                onChange={(e) =>
                                    setPlatformSettings({
                                        ...platformSettings,
                                        plans: {
                                            ...platformSettings.plans,
                                            yearly: { ...yearlyPlan, discountNotice: e.target.value },
                                        },
                                    })
                                }
                                placeholder="e.g. Save ~17% (2 Months Free)"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Highlight</label>
                            <input
                                type="text"
                                value={yearlyPlan.badge || ""}
                                onChange={(e) =>
                                    setPlatformSettings({
                                        ...platformSettings,
                                        plans: {
                                            ...platformSettings.plans,
                                            yearly: { ...yearlyPlan, badge: e.target.value },
                                        },
                                    })
                                }
                                placeholder="e.g. Best Value"
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Plan Description</label>
                        <input
                            type="text"
                            value={yearlyPlan.description || ""}
                            onChange={(e) =>
                                setPlatformSettings({
                                    ...platformSettings,
                                    plans: {
                                        ...platformSettings.plans,
                                        yearly: { ...yearlyPlan, description: e.target.value },
                                    },
                                })
                            }
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Yearly Features List */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Included Feature Bullets (Displayed on Landing Page & Portal)
                        </label>
                        <div className="space-y-2 mb-3">
                            {yearlyPlan.features?.map((feat: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-700">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span className="flex-1 font-medium">{feat}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature("yearly", idx)}
                                        className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newYearlyFeature}
                                onChange={(e) => setNewYearlyFeature(e.target.value)}
                                placeholder="Add new annual feature bullet point..."
                                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addFeature("yearly");
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => addFeature("yearly")}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving SaaS Settings...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save SaaS Plans & Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
