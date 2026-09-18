/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Building2,
    Users,
    CreditCard,
    DollarSign,
    TrendingUp,
    Shield,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    Loader2,
    Layers,
    Plus,
} from "lucide-react";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/superadmin/stats");
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Error loading SuperAdmin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => {
        const c = stats?.currency || "USD";
        try {
            return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(val);
        } catch {
            return `$${val?.toLocaleString()}`;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 text-sm font-medium">Loading platform telemetry...</p>
            </div>
        );
    }

    const totalOrgs = stats?.totalOrgs || 0;
    const activeOrgs = stats?.activeOrgs || 0;
    const monthlyPlanOrgs = stats?.monthlyPlanOrgs || 0;
    const yearlyPlanOrgs = stats?.yearlyPlanOrgs || 0;
    const estimatedMRR = stats?.estimatedMRR || 0;
    const estimatedARR = stats?.estimatedARR || 0;
    const totalProperties = stats?.totalProperties || 0;
    const totalUnits = stats?.totalUnits || 0;
    const totalUsers = stats?.totalUsers || 0;
    const recentOrgs = stats?.recentOrganizations || [];

    const monthlyPct = totalOrgs > 0 ? Math.round((monthlyPlanOrgs / totalOrgs) * 100) : 0;
    const yearlyPct = totalOrgs > 0 ? Math.round((yearlyPlanOrgs / totalOrgs) * 100) : 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SaaS Platform Overview</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Multi-tenant portfolio health, organization metrics, and subscription telemetry.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/superadmin/settings"
                        className="px-4 py-2 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-xs"
                    >
                        Configure Plans
                    </Link>
                    <Link
                        href="/superadmin/organizations/create"
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-sm flex items-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Provision Organization</span>
                    </Link>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Organizations */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Organizations</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{totalOrgs}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="flex items-center text-emerald-700 font-bold gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {activeOrgs} Active
                        </span>
                        <span>•</span>
                        <span>{stats?.trialOrgs || 0} Trial</span>
                    </div>
                </div>

                {/* Estimated MRR */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated MRR</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{formatCurrency(estimatedMRR)}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Monthly Recurring Revenue</span>
                    </div>
                </div>

                {/* Estimated ARR */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Projected ARR</span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{formatCurrency(estimatedARR)}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-700 font-semibold">
                        <span>Annual Recurring Run-Rate</span>
                    </div>
                </div>

                {/* Platform Portfolio */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Properties & Units</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{totalProperties}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-medium">
                        <span className="text-purple-700 font-bold">{totalUnits} Units</span>
                        <span>•</span>
                        <span>{totalUsers} Users</span>
                    </div>
                </div>
            </div>

            {/* Subscriptions & Plan Distribution Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subscription Tiers Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Subscription Distribution</h3>
                            <p className="text-xs text-gray-500">Monthly vs Yearly plan adoption</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-100">
                            {totalOrgs} Total Orgs
                        </span>
                    </div>

                    <div className="space-y-4 pt-1">
                        {/* Monthly Plan */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                <span className="text-gray-700 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                    Monthly Plan
                                </span>
                                <span className="text-gray-900">{monthlyPlanOrgs} ({monthlyPct}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${monthlyPct}%` }}></div>
                            </div>
                        </div>

                        {/* Yearly Plan */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                <span className="text-gray-700 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    Yearly Plan (Best Value)
                                </span>
                                <span className="text-gray-900">{yearlyPlanOrgs} ({yearlyPct}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${yearlyPct}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-500">Active Billing Rates:</span>
                        <Link href="/superadmin/settings" className="text-blue-900 hover:text-blue-700 font-bold flex items-center gap-1">
                            Configure Pricing <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Quick Provisioning & Admin Actions */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">SuperAdmin Operations</h3>
                                <p className="text-xs text-gray-500">Key tenant lifecycle workflows and SaaS management</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Link
                                href="/superadmin/organizations/create"
                                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-900 transition-colors">Create Org</h4>
                                <p className="text-xs text-gray-500 mt-1">Provision a new organization + admin user</p>
                            </Link>

                            <Link
                                href="/superadmin/settings"
                                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">Manage Plans</h4>
                                <p className="text-xs text-gray-500 mt-1">Edit Monthly & Yearly prices and features</p>
                            </Link>

                            <Link
                                href="/superadmin/users"
                                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Users className="w-4 h-4" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-800 transition-colors">Global Users</h4>
                                <p className="text-xs text-gray-500 mt-1">Search users across all tenants & roles</p>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-blue-900 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-blue-900">SaaS Landing Page Live at Base URL</p>
                                <p className="text-xs text-blue-700">Visitors can view real-time monthly & yearly pricing and sign up for onboarding.</p>
                            </div>
                        </div>
                        <Link
                            href="/"
                            target="_blank"
                            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
                        >
                            <span>Open Landing Page</span>
                            <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Organizations Table */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Recent Organizations</h3>
                        <p className="text-xs text-gray-500">Latest tenant organizations registered on the platform</p>
                    </div>
                    <Link
                        href="/superadmin/organizations"
                        className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                    >
                        <span>View All Organizations</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentOrgs.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-700">No organizations created yet</p>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Create your first organization to start provisioning tenant workspaces.</p>
                        <Link
                            href="/superadmin/organizations/create"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-xs"
                        >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Create First Organization</span>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50">
                                <tr>
                                    <th className="py-3 px-3">Organization</th>
                                    <th className="py-3 px-3">Primary Admin</th>
                                    <th className="py-3 px-3">Plan</th>
                                    <th className="py-3 px-3">Status</th>
                                    <th className="py-3 px-3">Created</th>
                                    <th className="py-3 px-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrgs.map((org: any) => {
                                    const isYearly = org.subscription?.plan === "yearly";
                                    return (
                                        <tr key={org._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="py-3.5 px-3 font-bold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 font-bold text-xs">
                                                        {org.name?.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span>{org.name}</span>
                                                        <p className="text-[11px] text-gray-500 font-normal">/{org.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <p className="text-xs font-bold text-gray-800">{org.adminUser?.name || "Admin"}</p>
                                                <p className="text-[11px] text-gray-500">{org.adminUser?.email || org.email}</p>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                    isYearly
                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                        : "bg-blue-50 text-blue-900 border border-blue-200"
                                                }`}>
                                                    {org.subscription?.plan || "Monthly"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                                    org.status === "active"
                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                        : "bg-amber-50 text-amber-800 border border-amber-200"
                                                }`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {org.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-xs text-gray-500">
                                                {new Date(org.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-3 text-right">
                                                <Link
                                                    href={`/superadmin/organizations/${org._id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-900 hover:text-white text-gray-700 text-xs font-bold transition-colors"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
