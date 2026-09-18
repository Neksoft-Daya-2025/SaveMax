/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Building2,
    Search,
    Plus,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from "lucide-react";

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [planFilter, setPlanFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, pages: 1 });

    useEffect(() => {
        fetchOrganizations();
    }, [page, statusFilter, planFilter]);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "10");
            if (search) params.set("search", search);
            if (statusFilter) params.set("status", statusFilter);
            if (planFilter) params.set("plan", planFilter);

            const res = await fetch(`/api/superadmin/organizations?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setOrganizations(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchOrganizations();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to permanently delete "${name}" and all its associated data? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/superadmin/organizations/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchOrganizations();
            } else {
                alert(data.error || "Failed to delete organization");
            }
        } catch (error) {
            console.error("Error deleting organization:", error);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Organization Directory</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Manage tenant organizations, administrator accounts, and subscription tiers.</p>
                </div>

                <Link
                    href="/superadmin/organizations/create"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-sm self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Provision New Organization</span>
                </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by company name, slug, or email..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </form>

                <div className="flex items-center gap-2">
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="suspended">Suspended</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Plan Filter */}
                    <select
                        value={planFilter}
                        onChange={(e) => {
                            setPlanFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="">All Plans</option>
                        <option value="monthly">Monthly Plan</option>
                        <option value="yearly">Yearly Plan</option>
                    </select>

                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                            setPlanFilter("");
                            setPage(1);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Organizations Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-xs text-gray-500 font-medium">Loading organizations...</p>
                    </div>
                ) : organizations.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-900">No organizations found</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            {search || statusFilter || planFilter
                                ? "Try adjusting your search criteria or filters."
                                : "Click 'Provision New Organization' above to onboard your first tenant."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4">Organization</th>
                                    <th className="py-3 px-4">Admin Contact</th>
                                    <th className="py-3 px-4">Subscription Tier</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Expiry / Renewal</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {organizations.map((org) => {
                                    const isYearly = org.subscription?.plan === "yearly";
                                    return (
                                        <tr key={org._id} className="hover:bg-gray-50/80 transition-colors group">
                                            {/* Organization Name & Slug */}
                                            <td className="py-3.5 px-4 font-bold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 font-extrabold text-xs">
                                                        {org.name?.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="group-hover:text-blue-900 transition-colors">{org.name}</span>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-normal">
                                                            <span>slug: <code className="text-blue-800 font-mono bg-blue-50 px-1 rounded">/{org.slug}</code></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Admin Contact */}
                                            <td className="py-3.5 px-4">
                                                <p className="text-xs font-bold text-gray-800">{org.adminUser?.name || "Admin"}</p>
                                                <p className="text-[11px] text-gray-500">{org.adminUser?.email || org.email}</p>
                                                {org.phone && <p className="text-[10px] text-gray-400">{org.phone}</p>}
                                            </td>

                                            {/* Subscription Tier */}
                                            <td className="py-3.5 px-4">
                                                <div className="space-y-0.5">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                        isYearly
                                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                            : "bg-blue-50 text-blue-900 border border-blue-200"
                                                    }`}>
                                                        {org.subscription?.plan === "yearly" ? "Enterprise Yearly" : "Professional Monthly"}
                                                    </span>
                                                    <p className="text-[10px] text-gray-500 font-medium">
                                                        ${org.subscription?.amount || (isYearly ? 490 : 49)} / {org.subscription?.billingCycle || (isYearly ? "year" : "month")}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                                    org.status === "active"
                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                        : org.status === "trial"
                                                        ? "bg-blue-50 text-blue-900 border border-blue-200"
                                                        : "bg-rose-50 text-rose-800 border border-rose-200"
                                                }`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {org.status}
                                                </span>
                                            </td>

                                            {/* Expiry Date */}
                                            <td className="py-3.5 px-4 text-xs text-gray-500">
                                                {org.subscription?.endDate
                                                    ? new Date(org.subscription.endDate).toLocaleDateString()
                                                    : "N/A"}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/superadmin/organizations/${org._id}`}
                                                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-900 hover:text-white text-gray-700 text-xs font-bold transition-all"
                                                    >
                                                        Manage
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(org._id, org.name)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete Organization"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span>
                            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                disabled={page >= pagination.pages}
                                className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
