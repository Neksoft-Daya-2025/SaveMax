/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import { AlertCircle, DollarSign, CalendarClock, CalendarDays } from "lucide-react";
import ContractsTable from "@/components/property/ContractsTable";
import { useSettings } from "@/components/providers/SettingsProvider";

const EXPIRY_WINDOW_DAYS = 30;

export default function ExpiringContractsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatCurrency } = useSettings();

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ status: "Active", limit: "1000" });
            const res = await fetch(`/api/contracts?${query}`);
            const data = await res.json();
            if (data.success) {
                const now = new Date();
                const horizon = new Date();
                horizon.setDate(horizon.getDate() + EXPIRY_WINDOW_DAYS);

                const expiring = (data.data as any[])
                    .filter((c: any) => {
                        const end = c.details?.endDate ? new Date(c.details.endDate) : null;
                        return end && end >= now && end <= horizon;
                    })
                    .sort((a: any, b: any) => new Date(a.details.endDate).getTime() - new Date(b.details.endDate).getTime());

                setContracts(expiring);
            }
        } catch (error) {
            console.error("Error fetching expiring contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    const soonest = contracts.length
        ? new Date(contracts[0].details.endDate).toLocaleDateString()
        : "—";

    const stats = [
        { label: "Expiring Soon", value: contracts.length, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Expiring Value", value: formatCurrency(contracts.reduce((acc, curr: any) => acc + (curr.details?.amount || 0), 0)), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Within 7 Days", value: contracts.filter((c: any) => {
            const end = new Date(c.details.endDate);
            const in7 = new Date();
            in7.setDate(in7.getDate() + 7);
            return end <= in7;
        }).length, icon: CalendarClock, color: "text-red-600", bg: "bg-red-50" },
        { label: "Earliest Expiry", value: soonest, icon: CalendarDays, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expiring Soon</h1>
                    <p className="text-gray-500 text-sm">
                        Active contracts ending within the next {EXPIRY_WINDOW_DAYS} days
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
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

            <ContractsTable contracts={contracts} loading={loading} />
        </div>
    );
}
