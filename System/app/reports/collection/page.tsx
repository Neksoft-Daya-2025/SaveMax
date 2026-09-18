/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    FileText,
    Clock,
    Percent,
    Loader2,
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

const COLORS = ['#16a34a', '#f59e0b', '#dc2626', '#2563eb', '#7c3aed', '#db2777'];

export default function CollectionReportPage() {
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
            const res = await fetch(`/api/reports/collection?${query}`);
            const json = await res.json();
            if (json.success) setData(json);
        } catch (error) {
            console.error("Error fetching collection report:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Calculating collection performance...</p>
            </div>
        );
    }

    const { summary, trends, statusBreakdown, isMonthlyView } = data;
    const periodLabel = month !== 'all' ? MONTHS[parseInt(month) - 1] : `FY ${year}`;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Collection Performance Report</h1>
                        <p className="text-sm text-gray-500 mt-1">Payments collected against invoiced amounts</p>
                    </div>
                    <PeriodSelector year={year} month={month} setYear={setYear} setMonth={setMonth} />
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard label="Total Collected" value={formatCurrency(summary.totalCollected)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" subtitle="Received payments" />
                    <StatCard label="Total Invoiced" value={formatCurrency(summary.totalInvoiced)} icon={FileText} color="text-blue-600" bg="bg-blue-50" subtitle="Billed amount" />
                    <StatCard label="Outstanding" value={formatCurrency(summary.totalPending)} icon={Clock} color="text-amber-600" bg="bg-amber-50" subtitle="Pending / failed" />
                    <StatCard label="Collection Rate" value={`${summary.collectionRate.toFixed(1)}%`} icon={Percent} color="text-purple-600" bg="bg-purple-50" subtitle="of invoiced" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Trend Chart */}
                    <Card
                        className="lg:col-span-2"
                        title={isMonthlyView ? `Daily Collections — ${MONTHS[parseInt(month) - 1]}` : "Monthly Collections"}
                        subtitle={isMonthlyView ? `Payments received for ${MONTHS[parseInt(month) - 1]}` : "Collections across the year"}
                    >
                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val: number) => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : `${val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', padding: '10px' }} formatter={(value: number) => [formatCurrency(value), 'Collected']} />
                                    <Area type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorCollection)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Status Breakdown */}
                    <Card title="Collection by Status" subtitle="Collected vs outstanding">
                        <div className="space-y-4">
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                                            {COLORS.map((color, index) => (<Cell key={`cell-${index}`} fill={color} />))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {statusBreakdown.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <span className="text-gray-600">{item.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Detailed Table */}
                <Card
                    title="Collection Digest"
                    subtitle={isMonthlyView ? `Daily breakdown for ${MONTHS[parseInt(month) - 1]}` : "Monthly collection breakdown"}
                    action={<Filter className="w-5 h-5 text-gray-400" />}
                    bodyClassName="p-0"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">{isMonthlyView ? 'Day' : 'Month'}</th>
                                    <th className="px-5 py-3">Collected</th>
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
