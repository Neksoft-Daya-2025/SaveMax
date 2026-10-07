
"use client";

import { useState, useEffect } from "react";
import { Plus, Search, User, Mail, Phone, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";

const PAGE_SIZE = 10;

export default function ActiveCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ limit: "1000" });
            const res = await fetch(`/api/customers?${query}`);
            const data = await res.json();
            if (data.success) {
                const active = (data.data || []).filter(
                    (c: any) => (c.status || "").toString().toLowerCase() === "active"
                );
                setCustomers(active);
            }
        } catch (error) {
            console.error("Error fetching active customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = customers.filter((c: any) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (c.name || "").toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q) ||
            (c.phone || "").toLowerCase().includes(q)
        );
    });

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(page, pages);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Active Customers</h1>
                        <p className="text-sm text-gray-500">Customers currently active in your database</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PermissionGate resource="customers" action="create">
                            <Link
                                href="/customers/create"
                                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Customer
                            </Link>
                        </PermissionGate>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
                    {/* Filters Bar */}
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => { setSearch(""); setPage(1); }}
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm px-2"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Join Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Agents</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && customers.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : visible.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No active customers found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    visible.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900">{customer.name}</span>
                                                        {customer.address && (
                                                            <div className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]" title={customer.address}>
                                                                {customer.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    {customer.email ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            <span className="truncate max-w-[150px]">{customer.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No email</span>
                                                    )}
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${customer.status === "active" || customer.status === "Active"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                                    }`}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {customer.customerDetails?.assignedAgents && customer.customerDetails.assignedAgents.length > 0 ? (
                                                        customer.customerDetails.assignedAgents.map((agent: any) => (
                                                            <span key={agent._id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                {agent.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 italic">None assigned</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{visible.length}</span> of <span className="text-gray-900">{total}</span> active customers
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                                    let pageNum;
                                    if (pages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= pages - 2) pageNum = pages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${currentPage === pageNum
                                                ? "bg-blue-900 text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPage(currentPage + 1)}
                                disabled={currentPage >= pages}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
