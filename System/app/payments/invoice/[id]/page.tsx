/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Download,
    Printer,
    ChevronLeft,
    CheckCircle2,
    Clock,
    XCircle,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    Home,
    User,
    FileText,
    DollarSign,
    TrendingUp,
    Wallet
} from "lucide-react";
import Link from "next/link";

export default function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const [payment, setPayment] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayment();
        fetchSettings();
    }, []);

    const fetchPayment = async () => {
        try {
            const res = await fetch(`/api/payments/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setPayment(data.data);
            } else {
                alert("Payment not found");
                router.push("/payments");
            }
        } catch (error) {
            console.error("Error fetching payment:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'Pending': return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'Failed': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Failed': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (!payment) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* Action Bar - Hidden on Print */}
            <div className="max-w-4xl mx-auto mb-6 print:hidden">
                <div className="flex items-center justify-between">
                    <Link
                        href="/payments"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Payments</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors font-medium shadow-sm">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Container */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">INVOICE</h1>
                            <p className="text-blue-100 text-sm">Payment Receipt</p>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                {getStatusIcon(payment.status)}
                                <span className="font-bold text-sm uppercase tracking-wider">{payment.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="p-8 md:p-12 space-y-8">
                    {/* Company & Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* From */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">From</h3>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-gray-900">{settings?.storeName || "Property Management"}</h2>
                                {settings?.address && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                        <span>{settings.address}</span>
                                    </div>
                                )}
                                {settings?.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{settings.phone}</span>
                                    </div>
                                )}
                                {settings?.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{settings.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* To */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bill To</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold">
                                        {payment.client?.name?.[0] || 'C'}
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900">{payment.client?.name || 'Unknown Client'}</h2>
                                </div>
                                {payment.client?.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{payment.client.email}</span>
                                    </div>
                                )}
                                {payment.client?.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{payment.client.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Number</p>
                            <p className="text-sm font-black text-gray-900">{payment.invoiceNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Date</p>
                            <p className="text-sm font-black text-gray-900">{new Date(payment.createdAt).toLocaleDateString()}</p>
                        </div>
                        {payment.billingMonth && (
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billing Period</p>
                                <p className="text-sm font-black text-gray-900">{payment.billingMonth} {payment.billingYear}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                            <p className="text-sm font-black text-gray-900">{payment.paymentMethod}</p>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Home className="w-6 h-6 text-blue-900" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Property Details</h3>
                                <h4 className="text-lg font-black text-gray-900 mb-1">{payment.property?.title}</h4>
                                {payment.property?.location && (
                                    <p className="text-sm text-gray-600">
                                        {payment.property.location.address}, {payment.property.location.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <FileText className="w-4 h-4 text-blue-900" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{payment.paymentType}</p>
                                                <p className="text-xs text-gray-500">
                                                    {payment.billingMonth && `${payment.billingMonth} ${payment.billingYear}`}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-lg font-black text-gray-900">${payment.amount?.toLocaleString()}</p>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-blue-900 text-white">
                                <tr>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold uppercase tracking-wider">Total Amount</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-2xl font-black">${payment.totalAmount?.toLocaleString()}</p>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Payment Progress */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Payment Progress
                        </h3>

                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-600">Payment Status</span>
                                    <span className="text-xs font-bold text-blue-900">
                                        {Math.round(((payment.receivedAmount || 0) / payment.totalAmount) * 100)}% Paid
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                                        style={{ width: `${Math.min(((payment.receivedAmount || 0) / payment.totalAmount) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Amount Breakdown */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <p className="text-xs font-bold text-gray-400 uppercase">Total</p>
                                    </div>
                                    <p className="text-lg font-black text-gray-900">${payment.totalAmount?.toLocaleString()}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Wallet className="w-4 h-4 text-green-600" />
                                        <p className="text-xs font-bold text-green-600 uppercase">Received</p>
                                    </div>
                                    <p className="text-lg font-black text-green-700">${(payment.receivedAmount || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-red-600" />
                                        <p className="text-xs font-bold text-red-600 uppercase">Due</p>
                                    </div>
                                    <p className="text-lg font-black text-red-700">${(payment.totalAmount - (payment.receivedAmount || 0)).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Status Message */}
                            {(payment.totalAmount - (payment.receivedAmount || 0)) > 0 ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Partial Payment Received</p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Outstanding balance of ${(payment.totalAmount - (payment.receivedAmount || 0)).toLocaleString()} is pending.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-green-900">Payment Completed</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Full payment has been received. Thank you!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deposit History */}
                    {payment.depositHistory && payment.depositHistory.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Deposit History ({payment.depositHistory.length} {payment.depositHistory.length === 1 ? 'Transaction' : 'Transactions'})
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Running Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payment.depositHistory.map((deposit: any, index: number) => {
                                            const runningBalance = payment.depositHistory!
                                                .slice(0, index + 1)
                                                .reduce((sum: number, d: any) => sum + d.amount, 0);

                                            return (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-900">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span className="font-semibold">
                                                                {new Date(deposit.date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(deposit.date).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg font-bold text-sm border border-green-200">
                                                            <DollarSign className="w-3.5 h-3.5" />
                                                            {deposit.amount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-700">{deposit.method}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-black text-gray-900">
                                                                ${runningBalance.toLocaleString()}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                of ${payment.totalAmount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total Received</span>
                                            </td>
                                            <td colSpan={3} className="px-6 py-4 text-right">
                                                <span className="text-xl font-black text-green-700">
                                                    ${(payment.receivedAmount || 0).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {payment.notes && (
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{payment.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-6 text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Thank you for your payment</p>
                        <p className="text-sm text-gray-600 mt-2">
                            This is a computer-generated invoice and does not require a signature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
