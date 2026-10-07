
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
    Calendar,
    ArrowUpRight,
    Wallet,
    X
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";
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

export default function DueCollectionPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [depositAmount, setDepositAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [submitting, setSubmitting] = useState(false);
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
        fetchDuePayments();
    }, [search, page]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const fetchDuePayments = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "100", // Fetch more to filter client-side
                search
            });
            const res = await fetch(`/api/payments?${query}`);
            const data = await res.json();
            if (data.success) {
                // Filter to show only payments with outstanding dues
                const paymentsWithDues = data.data.filter((p: Payment) =>
                    (p.totalAmount - (p.receivedAmount || 0)) > 0
                );
                setPayments(paymentsWithDues);
                // Update pagination to reflect filtered results
                setPagination({
                    ...data.pagination,
                    total: paymentsWithDues.length,
                    pages: Math.ceil(paymentsWithDues.length / 10)
                });
            }
        } catch (error) {
            console.error("Error fetching due payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        if (!confirm("Are you sure you want to mark this payment as paid?")) return;
        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Completed" })
            });
            const data = await res.json();
            if (data.success) {
                fetchDuePayments();
            } else {
                alert(data.error || "Failed to update payment");
            }
        } catch (error) {
            console.error("Error updating payment:", error);
        }
    };

    const handleOpenDepositModal = (payment: Payment) => {
        setSelectedPayment(payment);
        const dueAmount = payment.totalAmount - (payment.receivedAmount || 0);
        setDepositAmount(dueAmount);
        setPaymentMethod("Cash");
        setShowDepositModal(true);
    };

    const handleSubmitDeposit = async () => {
        if (!selectedPayment || depositAmount <= 0) return;

        setSubmitting(true);
        try {
            const newReceivedAmount = (selectedPayment.receivedAmount || 0) + depositAmount;
            const res = await fetch(`/api/payments/${selectedPayment._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receivedAmount: newReceivedAmount,
                    paymentMethod: paymentMethod
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowDepositModal(false);
                setSelectedPayment(null);
                fetchDuePayments();
            } else {
                alert(data.error || "Failed to record deposit");
            }
        } catch (error) {
            console.error("Error recording deposit:", error);
            alert("Failed to record deposit");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Due Collection</h1>
                        <p className="text-sm text-gray-500">Manage and collect outstanding payments from clients</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-bold text-amber-700">Total Pending Duo: {formatCurrency(payments.reduce((acc, curr) => acc + (curr.totalAmount - (curr.receivedAmount || 0)), 0))}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
                    {/* Filters Bar */}
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by invoice number..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{payments.length}</span> pending dues
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Due</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && payments.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-200" />
                                            <p className="font-medium text-lg text-gray-900">Great! No pending dues.</p>
                                            <p className="text-sm">All collections are up to date.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-gray-900">{payment.invoiceNumber}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase">Issued: {new Date(payment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs uppercase">
                                                        {payment.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{payment.client?.name || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-500">{payment.client?.phone || 'No phone'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Home className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate max-w-[150px]">{payment.property?.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-red-600">{formatCurrency(payment.totalAmount - (payment.receivedAmount || 0))}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium tracking-tight">Total: {formatCurrency(payment.totalAmount || 0)}</span>
                                                    {payment.billingMonth && (
                                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{payment.billingMonth} {payment.billingYear}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold text-blue-900 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                    {payment.paymentType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative flex items-center justify-end gap-2 dropdown-trigger">
                                                    <button
                                                        onClick={() => handleOpenDepositModal(payment)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-all shadow-sm"
                                                    >
                                                        <Wallet className="w-3.5 h-3.5 mr-1.5" />
                                                        Deposit
                                                    </button>

                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === payment._id ? null : payment._id)}
                                                        className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-all"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {activeDropdown === payment._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <Link
                                                                href={`/payments/invoice/${payment._id}`}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4 text-blue-600" />
                                                                View Details
                                                            </Link>
                                                            <Link
                                                                href={`/payments/record?id=${payment._id}`}
                                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4 text-amber-600" />
                                                                Update Details
                                                            </Link>
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
                            Showing <span className="text-gray-900">{payments.length}</span> records
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => page > 1 && setPage(page - 1)}
                                disabled={page <= 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
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

                {/* Info Box */}
                <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <AlertCircle className="w-6 h-6 text-blue-300" />
                                Automated Collection Assistant
                            </h3>
                            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
                                This screen lists all payments currently in <span className="font-bold text-white">Pending</span> status. Marking a payment as paid here will automatically generate any associated agent commissions and update the property's financial shadow.
                            </p>
                        </div>
                        <Link
                            href="/payments/record"
                            className="bg-white text-blue-900 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-tight hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shrink-0"
                        >
                            Record New Due
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {/* Abstract Grid Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-full opacity-5 pointer-events-none transform -skew-x-12 translate-x-32 group-hover:translate-x-24 transition-transform duration-1000">
                        <div className="w-full h-full bg-blue-100"></div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && selectedPayment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-amber-600" />
                                Record Deposit
                            </h3>
                            <button
                                onClick={() => setShowDepositModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">Invoice</div>
                                <div className="font-bold text-gray-900">{selectedPayment.invoiceNumber}</div>
                                <div className="text-xs text-gray-500 mt-2">Client</div>
                                <div className="font-semibold text-gray-900">{selectedPayment.client?.name}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                                    <div className="font-bold text-gray-900">{formatCurrency(selectedPayment.totalAmount)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Already Received</div>
                                    <div className="font-bold text-green-600">{formatCurrency(selectedPayment.receivedAmount || 0)}</div>
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <div className="text-xs text-red-600 mb-1">Outstanding Due</div>
                                <div className="font-black text-2xl text-red-600">
                                    {formatCurrency(selectedPayment.totalAmount - (selectedPayment.receivedAmount || 0))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Deposit Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-bold"
                                    placeholder="Enter amount"
                                    min="0"
                                    max={selectedPayment.totalAmount - (selectedPayment.receivedAmount || 0)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Credit/Debit Card</option>
                                    <option value="Online">Online Payment</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDepositModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitDeposit}
                                disabled={submitting || depositAmount <= 0}
                                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Recording..." : "Record Deposit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
