/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import {
    Home,
    Key,
    Calendar,
    Percent,
    Loader2,
    TrendingUp,
    Filter
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useSettings } from "@/components/providers/SettingsProvider";
import { Card, StatCard, PeriodSelector, MONTHS } from "@/components/reports/Report";

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#4f46e5'];

export default function RentalReportPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState<string>("all");
    const { formatCurrency } = useSettings();

    useEffect(() => {
        fetchReport();
    }, [year, month]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ year: year.toString(), month });
            const res = await fetch(`/api/reports/rental?${query}`);
            const json = await res.json();
            if (json.success) setData(json);
        } catch (error) {
            console.error("Error fetching rental report:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Calculating rental performance...</p>
            </div>
        );
    }

    const { summary, trends, propertyBreakdown, isMonthlyView } = data;
    const periodLabel = month !== 'all' ? MONTHS[parseInt(month) - 1] : `FY ${year}`;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rental Performance Report</h1>
                        <p className="text-sm text-gray-500 mt-1">Rental income, lease value and collection efficiency</p>
                    </div>
                    <PeriodSelector year={year} month={month} setYear={setYear} setMonth={setMonth} />
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard label="Active Rentals" value={summary.activeRentals} icon={Home} color="text-blue-600" bg="bg-blue-50" subtitle="Lease agreements" />
                    <StatCard label="Rental Income" value={formatCurrency(summary.totalRentalIncome)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" subtitle="Collected rent" />
                    <StatCard label="Expected Rent" value={formatCurrency(summary.expectedRent)} icon={Calendar} color="text-amber-600" bg="bg-amber-50" subtitle="Monthly contract value" />
                    <StatCard label="Collection Rate" value={`${summary.collectionRate.toFixed(1)}%`} icon={Percent} color="text-purple-600" bg="bg-purple-50" subtitle="vs expected" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Trend Chart */}
                    <Card
                        className="lg:col-span-2"
                        title={isMonthlyView ? `Daily Rental Income — ${MONTHS[parseInt(month) - 1]}` : "Monthly Rental Income"}
                        subtitle={isMonthlyView ? `Daily rent collected for ${MONTHS[parseInt(month) - 1]}` : "Rent collected across the year"}
                    >
                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRental" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val: number) => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : `${val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', padding: '10px' }} formatter={(value: number) => [formatCurrency(value), 'Income']} />
                                    <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRental)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Property Breakdown */}
                    <Card title="Income by Property" subtitle="Top sources of rent">
                        {propertyBreakdown.length === 0 ? (
                            <p className="text-sm text-gray-400 py-8 text-center">No rental income recorded</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={propertyBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                                                {COLORS.map((color, index) => (<Cell key={`cell-${index}`} fill={color} />))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {propertyBreakdown.slice(0, 5).map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-gray-600 truncate">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Detailed Table */}
                <Card
                    title="Rental Income Digest"
                    subtitle={isMonthlyView ? `Daily breakdown for ${MONTHS[parseInt(month) - 1]}` : "Monthly rental income breakdown"}
                    action={<Filter className="w-5 h-5 text-gray-400" />}
                    bodyClassName="p-0"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">{isMonthlyView ? 'Day' : 'Month'}</th>
                                    <th className="px-5 py-3">Rental Income</th>
                                    <th className="px-5 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trends.map((m: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            {isMonthlyView ? `${MONTHS[parseInt(month) - 1]} ${m.label}` : `${m.label} ${year}`}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-gray-700">{formatCurrency(m.income)}</td>
                                        <td className="px-5 py-3 text-right text-sm font-semibold text-emerald-600">{formatCurrency(m.income)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
