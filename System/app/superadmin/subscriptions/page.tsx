"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    CheckCircle2,
    Loader2,
    Building2,
    ArrowUpRight,
} from "lucide-react";

export default function SubscriptionsPage() {
    const [stats, setStats] = useState<any>(null);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, orgsRes] = await Promise.all([
                fetch("/api/superadmin/stats"),
                fetch("/api/superadmin/organizations?limit=50"),
            ]);
            const statsData = await statsRes.json();
            const orgsData = await orgsRes.json();

            if (statsData.success) setStats(statsData.data);
            if (orgsData.success) setOrganizations(orgsData.data);
        } catch (error) {
            console.error("Error loading subscription data:", error);
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
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-xs text-gray-500 font-medium">Loading subscriptions ledger...</p>
            </div>
        );
    }

    const estimatedMRR = stats?.estimatedMRR || 0;
    const estimatedARR = stats?.estimatedARR || 0;
    const monthlyPlanOrgs = stats?.monthlyPlanOrgs || 0;
    const yearlyPlanOrgs = stats?.yearlyPlanOrgs || 0;
    const totalOrgs = stats?.totalOrgs || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SaaS Subscriptions & Revenue</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Monitor recurring billing cycles, tier distributions, and tenant renewal schedules.</p>
                </div>
                <Link
                    href="/superadmin/settings"
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-sm self-start sm:self-auto"
                >
                    Configure Plan Pricing
                </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated MRR</span>
                    <p className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(estimatedMRR)}</p>
                    <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Recurring monthly run rate
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Projected ARR</span>
                    <p className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(estimatedARR)}</p>
                    <p className="text-xs text-blue-900 font-semibold mt-1">Annualized revenue baseline</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan Distribution</span>
                    <div className="flex items-center gap-4 mt-2">
                        <div>
                            <span className="text-2xl font-black text-blue-900">{monthlyPlanOrgs}</span>
                            <p className="text-[11px] text-gray-500 font-medium">Monthly</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div>
                            <span className="text-2xl font-black text-emerald-700">{yearlyPlanOrgs}</span>
                            <p className="text-[11px] text-gray-500 font-medium">Yearly</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div>
                            <span className="text-2xl font-black text-gray-900">{totalOrgs}</span>
                            <p className="text-[11px] text-gray-500 font-medium">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscriptions Ledger Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tenant Subscription Ledger</h3>
                        <p className="text-xs text-gray-500">All active, trial, and expiring tenant subscriptions</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b border-gray-200">
                            <tr>
                                <th className="py-3 px-4">Organization</th>
                                <th className="py-3 px-4">Subscription Plan</th>
                                <th className="py-3 px-4">Rate</th>
                                <th className="py-3 px-4">Start Date</th>
                                <th className="py-3 px-4">Renewal Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {organizations.map((org) => {
                                const isYearly = org.subscription?.plan === "yearly";
                                return (
                                    <tr key={org._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-gray-900">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 font-bold text-xs">
                                                    {org.name?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span>{org.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                isYearly
                                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                    : "bg-blue-50 text-blue-900 border border-blue-200"
                                            }`}>
                                                {org.subscription?.plan === "yearly" ? "Enterprise Yearly" : "Professional Monthly"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-gray-900">
                                            ${org.subscription?.amount || (isYearly ? 490 : 49)} <span className="text-gray-500 font-normal text-xs">/ {org.subscription?.billingCycle || (isYearly ? "yr" : "mo")}</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-gray-500">
                                            {org.subscription?.startDate ? new Date(org.subscription.startDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-gray-500">
                                            {org.subscription?.endDate ? new Date(org.subscription.endDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                                org.subscription?.status === "active"
                                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                    : org.subscription?.status === "trial"
                                                    ? "bg-blue-50 text-blue-900 border border-blue-200"
                                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                                            }`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                {org.subscription?.status || "active"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <Link
                                                href={`/superadmin/organizations/${org._id}`}
                                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-900 hover:text-white text-gray-700 text-xs font-bold transition-all"
                                            >
                                                Manage Plan
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
