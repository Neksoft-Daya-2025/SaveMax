
"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    DollarSign,
    Download,
    Search,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    FileText,
    Home,
    Eye,
    Trash2,
    Edit,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    RefreshCcw,
    History
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Deposit {
    _id: string;
    receiptNumber: string;
    property: {
        _id: string;
        title: string;
    };
    client: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    amount: number;
    receivedAmount: number;
    refundedAmount: number;
    type: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
}

export default function DepositsPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const { formatCurrency } = useSettings();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (activeDropdown && !(event.target as Element).closest('.dropdown-trigger')) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeDropdown]);

    useEffect(() => {
        fetchDeposits();
    }, [search, page]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search
            });
            const res = await fetch(`/api/deposits?${query}`);
            const data = await res.json();
            if (data.success) {
                setDeposits(data.data);
                if (data.pagination) setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching deposits:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this deposit record?")) return;
        try {
            const res = await fetch(`/api/deposits/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchDeposits();
            } else {
                alert(data.error || "Failed to delete deposit");
            }
        } catch (error) {
            console.error("Error deleting deposit:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Received': return 'bg-green-50 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Refunded': return 'bg-red-50 text-red-700 border-red-200';
            case 'Consumed': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6 text-black">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Deposit Management</h1>
                        <p className="text-sm text-gray-500">Track security deposits, holding fees, and refunds</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PermissionGate resource="deposits" action="create">
                            <Link
                                href="/deposits/record"
                                className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm font-semibold text-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Record Deposit
                            </Link>
                        </PermissionGate>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Active Holding", value: formatCurrency(deposits.filter(d => d.status === 'Received').reduce((acc, curr) => acc + curr.receivedAmount, 0)), icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Pending Receipts", value: formatCurrency(deposits.filter(d => d.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0)), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Refunded Total", value: formatCurrency(deposits.reduce((acc, curr) => acc + (curr.refundedAmount || 0), 0)), icon: RefreshCcw, color: "text-red-600", bg: "bg-red-50" },
                        { label: "Total Managed", value: pagination.total, icon: History, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <div className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by receipt number..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && deposits.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : deposits.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg">No deposit records found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    deposits.map((deposit) => (
                                        <tr key={deposit._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-gray-900">{deposit.receiptNumber}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase">{new Date(deposit.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                        {deposit.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{deposit.client?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {deposit.property?.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">{formatCurrency(deposit.receivedAmount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold text-blue-900 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                    {deposit.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(deposit.status)}`}>
                                                    {deposit.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative flex items-center justify-end gap-2 dropdown-trigger">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === deposit._id ? null : deposit._id)}
                                                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-all"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {activeDropdown === deposit._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <PermissionGate resource="deposits" action="edit">
                                                                <Link
                                                                    href={`/deposits/record?id=${deposit._id}`}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Edit Deposit
                                                                </Link>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="deposits" action="delete">
                                                                <button
                                                                    onClick={() => { handleDelete(deposit._id); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete Record
                                                                </button>
                                                            </PermissionGate>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
