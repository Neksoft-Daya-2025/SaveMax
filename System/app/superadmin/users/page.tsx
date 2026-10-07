"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Shield,
    Building2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    Mail,
    Phone,
} from "lucide-react";

export default function GlobalUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, pages: 1 });

    useEffect(() => {
        fetchUsers();
    }, [page, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "15");
            if (search) params.set("search", search);
            if (statusFilter) params.set("status", statusFilter);

            const res = await fetch(`/api/superadmin/users?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching global users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Global Platform Users</h1>
                <p className="text-gray-500 text-sm mt-1">Cross-tenant directory of all administrators, staff, agents, and customer accounts.</p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by user name or email address..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </form>

                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                    </select>

                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("");
                            setPage(1);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-900 animate-spin mb-3" />
                        <p className="text-xs text-gray-500">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-900">No users found</h3>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Organization Tenant</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => {
                                    const isSuperAdmin = u.isSuperAdmin || u.role?.name === "Super Admin";
                                    return (
                                        <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                        isSuperAdmin
                                                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                                                            : "bg-blue-50 text-blue-900 border border-blue-200"
                                                    }`}>
                                                        {u.name?.slice(0, 2).toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <span>{u.name || "Unnamed User"}</span>
                                                        <p className="text-[11px] text-gray-500 font-normal">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {isSuperAdmin ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                                                        <Shield className="w-3.5 h-3.5" /> Root Platform
                                                    </span>
                                                ) : u.organization ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                                        <span className="font-medium">{u.organization.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                                    isSuperAdmin
                                                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                                                        : u.role?.name === "Admin"
                                                        ? "bg-blue-50 text-blue-900 border border-blue-200"
                                                        : u.role?.name === "Agent"
                                                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                                }`}>
                                                    {isSuperAdmin ? "Super Admin" : u.role?.name || "Customer"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                                    u.status === "Active"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-gray-100 text-gray-600 border border-gray-200"
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        u.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                                                    }`}></span>
                                                    {u.status || "Active"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-gray-500">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                        <span>
                            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total users)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                disabled={page >= pagination.pages}
                                className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors cursor-pointer"
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
