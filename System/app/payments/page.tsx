/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    CreditCard,
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
    Mail,
    Phone,
    Wallet
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";
import Select from "react-select";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Payment {
    _id: string;
    invoiceNumber: string;
    property: {
        _id: string;
        title: string;
        location?: any;
    };
    client: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    amount: number;
    receivedAmount: number;
    totalAmount: number;
    paymentType: string;
    paymentMethod: string;
    status: string;
    billingMonth?: string;
    billingYear?: number;
    createdAt: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const { formatCurrency } = useSettings();

    // Filter states
    const [properties, setProperties] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedClient, setSelectedClient] = useState("");
    const [customers, setCustomers] = useState<any[]>([]);

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
        fetchProperties();
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (selectedProperty) {
            fetchUnits(selectedProperty);
        } else {
            setUnits([]);
            setSelectedUnit("");
        }
    }, [selectedProperty]);

    useEffect(() => {
        fetchPayments();
    }, [search, page, selectedProperty, selectedUnit, selectedType, selectedClient]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/properties?limit=100");
            const data = await res.json();
            if (data.success) setProperties(data.data);
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/customers?limit=1000");
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data.map((c: any) => ({
                    value: c._id,
                    label: `${c.name} (${c.email || c.phone || 'No contact'})`
                })));
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const fetchUnits = async (propertyId: string) => {
        try {
            const res = await fetch(`/api/units?propertyId=${propertyId}&limit=100`);
            const data = await res.json();
            if (data.success) setUnits(data.data);
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                ...(selectedProperty && { property: selectedProperty }),
                ...(selectedUnit && { unit: selectedUnit }),
                ...(selectedType && { type: selectedType }),
                ...(selectedClient && { client: selectedClient })
            });
            const res = await fetch(`/api/payments?${query}`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data);
                if (data.pagination) setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payment record?")) return;
        try {
            const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchPayments();
            } else {
                alert(data.error || "Failed to delete payment");
            }
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Failed': return 'bg-red-50 text-red-700 border-red-200';
            case 'Refunded': return 'bg-gray-50 text-gray-700 border-gray-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Records</h1>
                        <p className="text-sm text-gray-500">Track rent collections, deposits, and installments</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <PermissionGate resource="payments" action="create">
                            <Link
                                href="/payments/record"
                                className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm font-semibold text-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Record Payment
                            </Link>
                        </PermissionGate>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Total Collected", value: formatCurrency(payments.reduce((acc, curr) => acc + (curr.receivedAmount || 0), 0)), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Total Dues", value: formatCurrency(payments.reduce((acc, curr) => acc + (curr.totalAmount - (curr.receivedAmount || 0)), 0)), icon: Clock, color: "text-red-600", bg: "bg-red-50" },
                        { label: "This Month", value: formatCurrency(payments.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + curr.totalAmount, 0)), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Total Records", value: pagination.total, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
                    {/* Filters Bar */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-4">
                        {/* Filter Controls */}
                        {/* Filter Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                            {/* Property Filter */}
                            <Select
                                options={[
                                    { value: "", label: "All Properties" },
                                    ...properties.map(p => ({ value: p._id, label: p.title }))
                                ]}
                                value={selectedProperty ? { value: selectedProperty, label: properties.find(p => p._id === selectedProperty)?.title || "All Properties" } : null}
                                onChange={(option) => setSelectedProperty(option?.value || "")}
                                placeholder="Select Property..."
                                className="text-sm"
                                classNames={{
                                    control: () => "!bg-white !border-gray-200 !rounded-lg !shadow-none hover:!border-blue-900/30 focus:!ring-2 focus:!ring-blue-900/20",
                                    option: () => "!text-sm"
                                }}
                            />

                            {/* Unit Filter */}
                            <Select
                                options={[
                                    { value: "", label: "All Units" },
                                    ...units.map(u => ({ value: u._id, label: `${u.unitNumber} ${u.block ? `(Blk ${u.block})` : ''}` }))
                                ]}
                                value={selectedUnit ? { value: selectedUnit, label: units.find(u => u._id === selectedUnit)?.unitNumber || "All Units" } : null}
                                onChange={(option) => setSelectedUnit(option?.value || "")}
                                isDisabled={!selectedProperty}
                                placeholder="Select Unit..."
                                className="text-sm"
                                classNames={{
                                    control: (state) => `!bg-white !border-gray-200 !rounded-lg !shadow-none ${state.isDisabled ? '!bg-gray-100 !opacity-60' : 'hover:!border-blue-900/30'}`,
                                    option: () => "!text-sm"
                                }}
                            />

                            {/* Payment Type Filter */}
                            <Select
                                options={[
                                    { value: "", label: "All Payment Types" },
                                    { value: "Rent", label: "Monthly Rent" },
                                    { value: "Security Deposit", label: "Security Deposit" },
                                    { value: "Sale Installment", label: "Sale Installment" },
                                    { value: "Recurring", label: "Recurring Service" }
                                ]}
                                value={selectedType ? { value: selectedType, label: selectedType } : null}
                                onChange={(option) => setSelectedType(option?.value || "")}
                                placeholder="Payment Type..."
                                className="text-sm"
                                classNames={{
                                    control: () => "!bg-white !border-gray-200 !rounded-lg !shadow-none hover:!border-blue-900/30",
                                    option: () => "!text-sm"
                                }}
                            />

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search invoice #"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Client Filter */}
                            <Select
                                options={[
                                    { value: "", label: "All Customers" },
                                    ...customers
                                ]}
                                value={selectedClient ? customers.find(c => c.value === selectedClient) : null}
                                onChange={(option) => setSelectedClient(option?.value || "")}
                                placeholder="Filter by Customer..."
                                className="text-sm"
                                classNames={{
                                    control: () => "!bg-white !border-gray-200 !rounded-lg !shadow-none hover:!border-blue-900/30",
                                    option: () => "!text-sm"
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                            <span>Active Filters: {
                                [
                                    selectedProperty && 'Property',
                                    selectedUnit && 'Unit',
                                    selectedType && 'Type',
                                    selectedClient && 'Customer',
                                    search && 'Search'
                                ].filter(Boolean).join(', ') || 'None'
                            }</span>
                            <span>Showing <span className="text-gray-900">{payments.length}</span> of <span className="text-gray-900">{pagination.total}</span></span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Received</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider text-red-600">Due</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && payments.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg">No payment records found</p>
                                            <p className="text-sm">Try adjusting your search or create a new payment.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-gray-900">{payment.invoiceNumber}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                        {payment.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{payment.client?.name || 'Unknown'}</p>
                                                        {payment.client?.email && (
                                                            <p className="text-[10px] text-gray-500">{payment.client.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-blue-900 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block w-fit">
                                                        {payment.paymentType}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                        <CreditCard className="w-3 h-3" />
                                                        {payment.paymentMethod}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(payment.totalAmount)}</span>
                                                    {payment.billingMonth && (
                                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{payment.billingMonth} {payment.billingYear}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-green-700">{formatCurrency(payment.receivedAmount || 0)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-bold ${payment.totalAmount - (payment.receivedAmount || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {formatCurrency(payment.totalAmount - (payment.receivedAmount || 0))}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="relative flex items-center justify-end gap-2 dropdown-trigger">
                                                    <Link
                                                        href={`/payments/invoice/${payment._id}`}
                                                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 text-gray-600 hover:text-blue-900 transition-all"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === payment._id ? null : payment._id)}
                                                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-all"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {activeDropdown === payment._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <PermissionGate resource="payments" action="edit">
                                                                <Link
                                                                    href={`/payments/record?id=${payment._id}`}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Edit Payment
                                                                </Link>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="payments" action="delete">
                                                                <button
                                                                    onClick={() => { handleDelete(payment._id); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete Payment
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

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{payments.length}</span> of <span className="text-gray-900">{pagination.total}</span> payments
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => page > 1 && setPage(page - 1)}
                                disabled={page <= 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.pages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.pages - 2) {
                                        pageNum = pagination.pages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${page === pageNum
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
                                onClick={() => page < pagination.pages && setPage(page + 1)}
                                disabled={page >= pagination.pages}
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
