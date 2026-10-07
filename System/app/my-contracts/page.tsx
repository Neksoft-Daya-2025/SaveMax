
"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Home,
    User,
    Calendar,
    DollarSign,
    AlertCircle,
    MapPin,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function MyContractsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const { formatCurrency } = useSettings();

    useEffect(() => {
        fetchContracts();
    }, [search, page]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search
            });
            const res = await fetch(`/api/contracts?${query}`);
            const data = await res.json();
            if (data.success) {
                // API already scopes results to the logged-in customer (view: 'own')
                setContracts(data.data);
                if (data.pagination) setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700';
            case 'Draft': return 'bg-blue-100 text-blue-700';
            case 'Expired': return 'bg-red-100 text-red-700';
            case 'Terminated': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Rent': return 'text-purple-600 bg-purple-50';
            case 'Sale': return 'text-orange-600 bg-orange-50';
            case 'Lease': return 'text-indigo-600 bg-indigo-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Contracts</h1>
                <p className="text-gray-500 text-sm">View the agreements linked to your account</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Agreements", value: contracts.filter((c: any) => c.status === 'Active').length, icon: Home, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Total Value", value: formatCurrency(contracts.reduce((acc, curr: any) => acc + (curr.details?.amount || 0), 0)), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Expired", value: contracts.filter((c: any) => c.status === 'Expired').length, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Drafts", value: contracts.filter((c: any) => c.status === 'Draft').length, icon: FileText, color: "text-gray-600", bg: "bg-gray-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <h3 className="text-lg font-black text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contracts List Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by property or owner..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                            value={search}
                            onChange={(e: any) => { setSearch(e.target.value); setPage(1); }}
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property & Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Financials</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading && contracts.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                    </tr>
                                ))
                            ) : contracts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No contracts found</p>
                                    </td>
                                </tr>
                            ) : (
                                contracts.map((contract: any) => (
                                    <tr key={contract._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-mono font-bold text-gray-400">#{contract._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${getTypeColor(contract.type)}`}>
                                                    <Home className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {contract.property?.title || "Property N/A"}
                                                        {contract.unit?.unitNumber && (
                                                            <span className="ml-1.5 text-blue-600">({contract.unit.unitNumber})</span>
                                                        )}
                                                    </span>
                                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{contract.type} Agreement</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                {contract.parties?.owner?.name || "Real Estate"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900">{formatCurrency(contract.details?.amount)}</span>
                                            {contract.type === 'Rent' && (
                                                <span className="text-[10px] text-gray-400 ml-1">/{contract.details?.billingCycle?.charAt(0)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{new Date(contract.details?.startDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(contract.status)}`}>
                                                {contract.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <Link
                                                href={`/contracts/${contract._id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                            >
                                                View <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{contracts.length}</span> of <span className="text-gray-900">{pagination.total}</span> contracts
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page <= 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.pages || 0) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.pages <= 5) pageNum = i + 1;
                                    else if (page <= 3) pageNum = i + 1;
                                    else if (page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                                    else pageNum = page - 2 + i;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${page === pageNum
                                                ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                                                : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= pagination.pages}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
