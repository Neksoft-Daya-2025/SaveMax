
"use client";

import { useState, useEffect } from "react";
import { FileText, DollarSign, Clock, Home, Loader2, ChevronRight } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CustomerDashboardPage() {
    const { data: session } = useSession();
    const { formatCurrency } = useSettings();
    const [contracts, setContracts] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const userName = (session?.user as any)?.name?.split(" ")[0] || "there";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, pRes] = await Promise.all([
                fetch("/api/contracts?limit=1000"),
                fetch("/api/payments?limit=1000"),
            ]);
            const cData = await cRes.json();
            const pData = await pRes.json();
            if (cData.success) setContracts(cData.data);
            if (pData.success) setPayments(pData.data);
        } catch (error) {
            console.error("Error fetching customer dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const activeLeases = contracts.filter((c: any) => c.status === "Active");
    const rentedProperties = new Set(activeLeases.map((c: any) => c.property?._id || c.property)).size;

    const totalPaid = payments
        .filter((p: any) => p.status === "Completed")
        .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

    const outstanding = payments
        .filter((p: any) => p.status !== "Completed")
        .reduce((acc: number, p: any) => acc + (p.totalAmount || p.amount || 0), 0);

    const recentPayments = [...payments]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
                <p className="text-sm text-gray-500 mt-1">Here's a snapshot of your leases and payments</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Active Leases" value={activeLeases.length} icon={FileText} color="blue" />
                <StatCard title="Total Paid" value={formatCurrency(totalPaid)} icon={DollarSign} color="green" />
                <StatCard title="Outstanding" value={formatCurrency(outstanding)} icon={Clock} color="orange" />
                <StatCard title="Properties Rented" value={rentedProperties} icon={Home} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* My Leases */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900">My Leases</h3>
                        <Link href="/my-contracts" className="text-sm font-medium text-blue-900 hover:underline flex items-center gap-1">
                            View all <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {activeLeases.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-10">No active leases found</p>
                        ) : (
                            activeLeases.slice(0, 5).map((c: any) => (
                                <div key={c._id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {c.property?.title || "Property"}
                                            {c.unit?.unitNumber && <span className="ml-1.5 text-blue-600">({c.unit.unitNumber})</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {c.type} · {formatCurrency(c.details?.amount)}
                                            {c.details?.billingCycle ? ` / ${c.details.billingCycle}` : ""}
                                        </p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100 shrink-0">
                                        {c.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900">Recent Payments</h3>
                        <Link href="/payments" className="text-sm font-medium text-blue-900 hover:underline flex items-center gap-1">
                            View all <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentPayments.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-10">No payments found</p>
                        ) : (
                            recentPayments.map((p: any) => (
                                <div key={p._id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {p.property?.title || p.paymentType || "Payment"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                            {p.invoiceNumber ? ` · #${p.invoiceNumber}` : ""}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${p.status === "Completed" ? "text-green-600" : "text-amber-600"}`}>
                                            {p.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
