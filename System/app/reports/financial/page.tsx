/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
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

const COLORS = ['#2563eb', '#7c3aed', '#db2777'];

export default function FinancialReportPage() {
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
            const res = await fetch(`/api/reports/financial?${query}`);
            const json = await res.json();
            if (json.success) setData(json);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Calculating financial balance...</p>
            </div>
        );
    }

    const { summary, trends, isMonthlyView } = data;
    const outflowBreakdown = [
        { name: 'Payroll', value: summary.totalPayroll },
        { name: 'Operations', value: summary.totalExpenses },
        { name: 'Commissions', value: summary.totalCommissions },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Financial Performance Report</h1>
                        <p className="text-sm text-gray-500 mt-1">Income, payroll and operational expenses</p>
                    </div>
                    <PeriodSelector year={year} month={month} setYear={setYear} setMonth={setMonth} />
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatCard label="Total Receipts" value={formatCurrency(summary.totalIncome)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" subtitle="Gross income" />
                    <StatCard label="Operating Outflow" value={formatCurrency(summary.totalOutflow)} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50" subtitle="Payroll + expenses" />
                    <StatCard label="Net Profit" value={formatCurrency(summary.netProfit)} icon={DollarSign} color="text-blue-600" bg="bg-blue-50" subtitle={`${summary.profitMargin.toFixed(1)}% margin`} />
                    <StatCard label="Reserved (Est. 20%)" value={formatCurrency(summary.netProfit * 0.2)} icon={Calendar} color="text-amber-600" bg="bg-amber-50" subtitle="Tax / provision" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Trend Chart */}
                    <Card
                        className="lg:col-span-2"
                        title={isMonthlyView ? `Daily Performance — ${MONTHS[parseInt(month) - 1]}` : "Revenue vs Expenditure"}
                        subtitle={isMonthlyView ? `Daily cash flow for ${MONTHS[parseInt(month) - 1]}` : "Monthly cash flow performance"}
                        action={
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-600"></div> Income</div>
                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-rose-500"></div> Expense</div>
                            </div>
                        }
                    >
                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val: number) => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : `${val}`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', padding: '10px' }} formatter={(value: number) => [formatCurrency(value), '']} />
                                    <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Outflow Breakdown */}
                    <Card title="Outflow Source" subtitle="Where spend goes">
                        <div className="space-y-4">
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={outflowBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                                            {COLORS.map((color, index) => (<Cell key={`cell-${index}`} fill={color} />))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {outflowBreakdown.map((item: any, i: number) => (
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
                    title="Detailed Ledger Digest"
                    subtitle={isMonthlyView ? `Daily breakdown for ${MONTHS[parseInt(month) - 1]}` : "Monthly performance breakdown"}
                    action={<Filter className="w-5 h-5 text-gray-400" />}
                    bodyClassName="p-0"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">{isMonthlyView ? 'Day' : 'Accounting Period'}</th>
                                    <th className="px-5 py-3">Revenue Inflow</th>
                                    <th className="px-5 py-3">Total Expenditure</th>
                                    <th className="px-5 py-3">Gains / Losses</th>
                                    <th className="px-5 py-3 text-right">Yield</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trends.map((m: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            {isMonthlyView ? `${MONTHS[parseInt(month) - 1]} ${m.label}` : `${m.label} ${year}`}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-700">{formatCurrency(m.income)}</td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-700">{formatCurrency(m.expense)}</td>
                                        <td className={`px-5 py-3 text-sm font-semibold ${m.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(m.profit)}</td>
                                        <td className="px-5 py-3 text-right">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${m.profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                {m.income > 0 ? ((m.profit / m.income) * 100).toFixed(1) : 0}%
                                            </span>
                                        </td>
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
