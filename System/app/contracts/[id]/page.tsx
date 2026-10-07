"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FileText,
    ChevronLeft,
    Calendar,
    DollarSign,
    User,
    Home,
    MapPin,
    Clock,
    Shield,
    CheckCircle2,
    Download,
    Eye,
    Edit,
    Trash2,
    Building2,
    Briefcase,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function ContractDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [contract, setContract] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'history'>('invoices');
    const { formatCurrency } = useSettings();

    useEffect(() => {
        if (params.id) {
            fetchContract();
            fetchContractPayments();
            fetchContractDeposits();
        }
    }, [params.id]);

    const fetchContract = async () => {
        try {
            const res = await fetch(`/api/contracts/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setContract(data.data);
            }
        } catch (error) {
            console.error("Error fetching contract:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchContractPayments = async () => {
        try {
            const res = await fetch(`/api/payments?contract=${params.id}`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    };

    const fetchContractDeposits = async () => {
        try {
            const res = await fetch(`/api/deposits?contract=${params.id}`);
            const data = await res.json();
            if (data.success) {
                setDeposits(data.data);
            }
        } catch (error) {
            console.error("Error fetching deposits:", error);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this contract?")) return;
        try {
            const res = await fetch(`/api/contracts/${params.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                router.push("/contracts");
            }
        } catch (error) {
            console.error("Error deleting contract:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <FileText className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contract not found</h2>
                <Link href="/contracts" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back to contracts
                </Link>
            </div>
        );
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-50 text-green-700 border-green-100';
            case 'Draft': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Expired': return 'bg-red-50 text-red-700 border-red-100';
            case 'Terminated': return 'bg-gray-50 text-gray-700 border-gray-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-gray-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Link href="/contracts" className="text-gray-400 hover:text-gray-900 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${getStatusStyle(contract.status)}`}>
                            {contract.status}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-tight">
                            {contract.type} Agreement
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Contract #{contract._id.slice(-8).toUpperCase()}
                    </h1>
                    <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        Created on {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <PermissionGate resource="contracts" action="edit">
                        <Link
                            href={`/contracts/edit/${contract._id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm"
                        >
                            <Edit className="w-4 h-4" /> Edit Contract
                        </Link>
                    </PermissionGate>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-semibold text-sm">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <PermissionGate resource="contracts" action="delete">
                        <button
                            onClick={handleDelete}
                            className="p-2 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </PermissionGate>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Financial & Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Amount</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(contract.details.amount)}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {contract.type === 'Rent' ? `Billed ${contract.details.billingCycle}` : 'One-time payment'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {new Date(contract.details.startDate).toLocaleDateString()}
                                    {contract.details.endDate && ` - ${new Date(contract.details.endDate).toLocaleDateString()}`}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {contract.details.endDate ? 'Fixed Term' : 'Indefinite / TBD'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Property & Unit Details */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Home className="w-4 h-4 text-blue-600" /> Property Information
                        </h3>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listed Property</p>
                                    <Link href={`/properties/${contract.property?._id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                        {contract.property?.title}
                                    </Link>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        {contract.property?.location?.address}
                                    </p>
                                </div>
                                {contract.unit && (
                                    <div className="pt-4 border-t border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specific Unit</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div>
                                                <p className="text-xs text-gray-500">Unit No</p>
                                                <p className="font-bold">#{contract.unit.unitNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Block</p>
                                                <p className="font-bold">{contract.unit.block || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Floor</p>
                                                <p className="font-bold">{contract.unit.floor || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                                <Building2 className="w-10 h-10 text-gray-200 mb-2" />
                                <p className="text-sm text-gray-500">Legal Reference</p>
                                <p className="text-xs font-mono text-gray-400 mt-1">{contract.property?._id}</p>
                            </div>
                        </div>
                    </section>

                    {/* Legal Notes */}
                    {contract.notes && (
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" /> Terms & Clauses
                            </h3>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm italic text-gray-600 leading-relaxed">
                                "{contract.notes}"
                            </div>
                        </section>
                    )}

                    {/* Financial History Tabs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="border-b border-gray-200 bg-gray-50 flex">
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

                        {/* Invoices Tab */}
                        {activeTab === 'invoices' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100 text-black">
                                        {payments.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                    <p className="font-medium">No invoices found for this contract</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            payments.map((payment: any) => (
                                                <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold text-gray-900">{payment.invoiceNumber}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(payment.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(payment.totalAmount)}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-green-700">{formatCurrency(payment.receivedAmount || 0)}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-red-600">{formatCurrency(payment.totalAmount - (payment.receivedAmount || 0))}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(payment.status)}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* History Tab */}
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
                                            deposits.forEach((d: any) => {
                                                allTxns.push({
                                                    _id: d._id,
                                                    date: d.createdAt,
                                                    amount: d.receivedAmount || d.amount,
                                                    type: d.type || 'Deposit',
                                                    description: `Deposit`,
                                                    method: d.paymentMethod,
                                                    reference: d.receiptNumber,
                                                    status: d.status,
                                                    isInvoice: false
                                                });
                                            });
                                            payments.forEach((p: any) => {
                                                if (p.depositHistory && p.depositHistory.length > 0) {
                                                    p.depositHistory.forEach((h: any, index: number) => {
                                                        allTxns.push({
                                                            _id: `${p._id}_${index}`,
                                                            date: h.date,
                                                            amount: h.amount,
                                                            type: 'Payment',
                                                            description: `Invoice Payment`,
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
                                                        description: `Invoice Payment`,
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
                                                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
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
                                                        <span className="text-sm text-gray-600">{txn.method}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                        {formatCurrency(txn.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(txn.status)}`}>
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

                    {/* Attached Documents */}
                    {contract.documents && contract.documents.length > 0 && (
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" /> Attachments & Documents
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {contract.documents.map((doc: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-900 truncate" title={doc.name}>{doc.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Attachment</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={doc.url}
                                                download={doc.name}
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar: Involved Parties */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" /> Contract Parties
                        </h4>

                        <div className="space-y-6">
                            {/* Client (Tenant/Buyer) */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Client (Tenant/Buyer)</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                                        {contract.parties.client?.name?.[0] || "C"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{contract.parties.client?.name}</p>
                                        <p className="text-xs text-gray-500">{contract.parties.client?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Owner */}
                            <div className="pt-6 border-t border-gray-50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Property Owner</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center font-bold text-sm border border-gray-100">
                                        {contract.parties.owner?.name?.[0] || "O"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{contract.parties.owner?.name}</p>
                                        <p className="text-xs text-gray-500">{contract.parties.owner?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Info Widget */}
                    <div className="bg-blue-900 p-6 rounded-2xl text-white shadow-lg shadow-blue-900/20 space-y-4">
                        <div className="p-2 bg-white/10 rounded-lg w-fit">
                            <Shield className="w-5 h-5 text-blue-200" />
                        </div>
                        <div>
                            <h5 className="font-bold">Legal Compliance</h5>
                            <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                                This document is a digital representation of the signed contract stored in our secure vaults.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 pt-2">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified Agreement
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
