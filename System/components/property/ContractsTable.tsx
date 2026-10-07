
"use client";

import { useState } from "react";
import {
    Home,
    User,
    Calendar,
    FileText,
    DollarSign,
    MapPin,
    Search,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import ContractActions from "@/components/property/ContractActions";
import { useSettings } from "@/components/providers/SettingsProvider";

const PAGE_SIZE = 10;

export default function ContractsTable({ contracts, loading }: { contracts: any[]; loading: boolean }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const { formatCurrency } = useSettings();

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

    const filtered = contracts.filter((c: any) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const property = (c.property?.title || "").toLowerCase();
        const client = (c.parties?.client?.name || "").toLowerCase();
        const owner = (c.parties?.owner?.name || "").toLowerCase();
        return property.includes(q) || client.includes(q) || owner.includes(q);
    });

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = filtered.slice(start, start + PAGE_SIZE);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
            {/* Search Bar - Staff style */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by property, client or owner..."
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
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parties</th>
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
                        ) : visible.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No contracts found</p>
                                </td>
                            </tr>
                        ) : (
                            visible.map((contract: any) => (
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
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-bold">
                                                <User className="w-3 h-3 text-blue-900" />
                                                {contract.parties?.client?.name || "Anonymous"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                Owner: {contract.parties?.owner?.name || "Real Estate"}
                                            </div>
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
                                        <ContractActions contractId={contract._id} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination - Staff Style */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500 font-medium">
                    Showing <span className="text-gray-900">{visible.length}</span> of <span className="text-gray-900">{total}</span> contracts
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
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage >= pages}
                        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
