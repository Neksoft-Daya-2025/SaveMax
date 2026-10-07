
"use client";

import { useState, useEffect } from "react";
import { Home, DollarSign, FileText, CalendarDays } from "lucide-react";
import ContractsTable from "@/components/property/ContractsTable";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function ActiveContractsPage() {
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
            if (data.success) setContracts(data.data);
        } catch (error) {
            console.error("Error fetching active contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: "Active Contracts", value: contracts.length, icon: FileText, color: "text-green-600", bg: "bg-green-50" },
        { label: "Total Value", value: formatCurrency(contracts.reduce((acc, curr: any) => acc + (curr.details?.amount || 0), 0)), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Rentals", value: contracts.filter((c: any) => c.type === 'Rent').length, icon: Home, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Leases", value: contracts.filter((c: any) => c.type === 'Lease').length, icon: CalendarDays, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Contracts</h1>
                    <p className="text-gray-500 text-sm">Currently running agreements and leases</p>
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
