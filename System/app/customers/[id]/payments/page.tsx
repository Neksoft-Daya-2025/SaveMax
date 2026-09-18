/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    DollarSign,
    Wallet,
    CreditCard,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle2,
    User,
    Mail,
    Phone,
    FileText,
    Eye,
    Download
} from "lucide-react";
import Link from "next/link";

export default function CustomerPaymentsPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'history'>('invoices');

    useEffect(() => {
        fetchCustomerData();
        fetchPayments();
        fetchDeposits();
    }, []);

    const fetchCustomerData = async () => {
        try {
            const res = await fetch(`/api/customers/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setCustomer(data.data);
            } else {
                alert("Customer not found");
                router.push("/customers");
            }
        } catch (error) {
            console.error("Error fetching customer:", error);
        }
    };

    const fetchPayments = async () => {
        try {
            const res = await fetch(`/api/payments?client=${params.id}&limit=100`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeposits = async () => {
        try {
            const res = await fetch(`/api/deposits?client=${params.id}&limit=100`);
            const data = await res.json();
            if (data.success) {
                setDeposits(data.data);
            }
        } catch (error) {
            console.error("Error fetching deposits:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Failed': return 'bg-red-50 text-red-700 border-red-200';
            case 'Received': return 'bg-green-50 text-green-700 border-green-200';
            case 'Refunded': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading || !customer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    const totalPaid = payments.reduce((sum, p) => sum + (p.receivedAmount || 0), 0);
    const totalDue = payments.reduce((sum, p) => sum + (p.totalAmount - (p.receivedAmount || 0)), 0);
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.receivedAmount || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/customers" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                            <p className="text-sm text-gray-500">Complete financial overview for {customer.name}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Info Card */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">{customer.name}</h2>
                                <div className="flex items-center gap-4 mt-2 text-blue-100">
                                    {customer.email && (
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Mail className="w-4 h-4" />
                                            {customer.email}
                                        </div>
                                    )}
                                    {customer.phone && (
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Phone className="w-4 h-4" />
                                            {customer.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${customer.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                            }`}>
                            {customer.status}
                        </span>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Total Paid", value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Outstanding Due", value: `$${totalDue.toLocaleString()}`, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
                        { label: "Security Deposits", value: `$${totalDeposits.toLocaleString()}`, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Total Transactions", value: payments.length + deposits.length, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
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

                {/* Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('invoices')}
                                className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'invoices'
                                    ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Invoices ({payments.length})
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'history'
                                    ? 'text-blue-900 border-b-2 border-blue-900 bg-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Transaction History
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Invoices Tab */}
                    {activeTab === 'invoices' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100 text-black">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium">No payment records found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment) => (
                                            <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-bold text-gray-900">{payment.invoiceNumber}</span>
                                                        <span className="text-[10px] text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{payment.property?.title}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold text-blue-900 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                        {payment.paymentType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">${payment.totalAmount?.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-green-700">${(payment.receivedAmount || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-red-600">${(payment.totalAmount - (payment.receivedAmount || 0)).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/payments/invoice/${payment._id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* History Tab (Unified Transactions) */}
                    {activeTab === 'history' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100 text-black">
                                    {(() => {
                                        const allTxns: any[] = [];

                                        // Add standalone deposits
                                        deposits.forEach(d => {
                                            allTxns.push({
                                                _id: d._id,
                                                date: d.createdAt,
                                                amount: d.receivedAmount || d.amount,
                                                type: d.type || 'Deposit',
                                                description: `Security Deposit - ${d.property?.title || 'Unknown Property'}`,
                                                method: d.paymentMethod,
                                                reference: d.receiptNumber,
                                                status: d.status,
                                                isInvoice: false
                                            });
                                        });

                                        // Add invoice payments
                                        payments.forEach(p => {
                                            if (p.depositHistory && p.depositHistory.length > 0) {
                                                p.depositHistory.forEach((h: any, index: number) => {
                                                    allTxns.push({
                                                        _id: `${p._id}_${index}`,
                                                        date: h.date,
                                                        amount: h.amount,
                                                        type: 'Payment',
                                                        description: `Invoice Payment - ${p.invoiceNumber}`,
                                                        method: h.method || p.paymentMethod,
                                                        reference: p.invoiceNumber,
                                                        status: 'Completed',
                                                        isInvoice: true
                                                    });
                                                });
                                            } else if ((p.receivedAmount || 0) > 0) {
                                                allTxns.push({
                                                    _id: `${p._id}_legacy`,
                                                    date: p.createdAt,
                                                    amount: p.receivedAmount,
                                                    type: 'Payment',
                                                    description: `Invoice Payment - ${p.invoiceNumber}`,
                                                    method: p.paymentMethod,
                                                    reference: p.invoiceNumber,
                                                    status: 'Completed',
                                                    isInvoice: true
                                                });
                                            }
                                        });

                                        const sortedTxns = allTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                        if (sortedTxns.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                        <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                        <p className="font-medium">No transaction records found</p>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return sortedTxns.map((txn) => (
                                            <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(txn.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-mono text-xs font-bold ${txn.isInvoice ? 'text-blue-600' : 'text-amber-600'}`}>
                                                        {txn.reference}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {txn.description}
                                                    <div className="text-[10px] text-gray-400">{txn.type}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                                        {txn.method}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    ${txn.amount?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(txn.status)}`}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
