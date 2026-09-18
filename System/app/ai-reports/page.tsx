/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect, useRef } from "react";
import {
    Sparkles, Send, Loader2, TrendingUp, AlertTriangle,
    Lightbulb, PieChart, RefreshCw, Printer, Download,
    DollarSign, Home, Users, BarChart3, ChevronRight, FileText
} from "lucide-react";
import { FormButton } from "@/components/dashboard/FormInput";
import ReactMarkdown from "react-markdown";

interface ReportContext {
    businessName: string;
    timeRange: string;
    financials: {
        revenue: number;
        expenses: number;
        contractVolume: number;
        netCashFlow: number;
    };
    inventory: {
        totalProperties: number;
        activeListings: number;
        occupancyRate: string;
    };
    overallStats: {
        totalPayments: number;
        totalNewContracts: number;
    };
}

export default function AIReportsPage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState("");
    const [reportContext, setReportContext] = useState<ReportContext | null>(null);
    const [error, setError] = useState("");
    const [timeRange, setTimeRange] = useState("30");
    const [aiEnabled, setAiEnabled] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        checkSettings();
    }, []);

    const checkSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.success && !data.data.aiEnabled) {
                setAiEnabled(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generateAnalysis = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");
        setAnalysis("");
        setReportContext(null);

        try {
            const res = await fetch("/api/ai-reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, timeRange }),
            });
            const data = await res.json();
            if (data.success) {
                setAnalysis(data.analysis);
                setReportContext(data.context);
            } else {
                setError(data.error || "Failed to generate AI analysis");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!aiEnabled) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <div className="bg-purple-50 border border-purple-100 rounded-3xl p-16 shadow-sm">
                    <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Sparkles className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">AI Reporting is Hidden</h1>
                    <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto">
                        Unlock advanced business intelligence and strategic growth insights. Enable OpenAI integration in your settings to activate.
                    </p>
                    <a
                        href="/settings"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 hover:-translate-y-1"
                    >
                        Go to Settings
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Control Panel - Hidden on Print */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Strategy Hub</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Professional market analysis and operational intelligence</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                        {["7", "30", "90", "365"].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${timeRange === range
                                    ? "bg-purple-600 text-white shadow-md"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                {range === "365" ? "Year" : `${range}D`}
                            </button>
                        ))}
                    </div>

                    <FormButton
                        onClick={() => generateAnalysis()}
                        loading={loading}
                        variant="purple"
                        className="rounded-xl px-6"
                        icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                    >
                        Regenerate Report
                    </FormButton>

                    {analysis && (
                        <button
                            onClick={handlePrint}
                            className="p-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 font-bold"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Print Report</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Input & Tools (Hidden on Print if report exists) */}
                <div className={`lg:col-span-4 space-y-6 print:hidden ${analysis ? 'xl:col-span-3' : ''}`}>
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-black text-gray-900 flex items-center gap-2">
                                <Send className="w-4 h-4 text-purple-600" />
                                Strategic Inquiry
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Ask about performance, risk factors, or growth opportunities.
                            </p>
                            <form onSubmit={generateAnalysis} className="space-y-4">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. Analyze my current occupancy vs industry standards and suggest ways to improve revenue."
                                    className="w-full h-40 px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all resize-none text-sm font-medium"
                                />
                                <FormButton
                                    type="submit"
                                    loading={loading}
                                    className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg shadow-purple-100"
                                    icon={<Sparkles className="w-5 h-5" />}
                                >
                                    Analyze Data
                                </FormButton>
                            </form>
                        </div>
                    </div>

                    {/* Pre-defined prompts */}
                    {!analysis && (
                        <div className="space-y-3">
                            <button
                                onClick={() => setPrompt("What are my highest risk properties and why?")}
                                className="w-full text-left p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-between group"
                            >
                                Risk Assessment
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                            </button>
                            <button
                                onClick={() => setPrompt("Suggest a 5-step growth strategy based on my current revenue.")}
                                className="w-full text-left p-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-between group"
                            >
                                Strategy Planning
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: The Report */}
                <div className={`lg:col-span-8 print:col-span-12 ${analysis ? 'xl:col-span-9' : ''}`}>
                    {loading ? (
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-20 h-full flex flex-col items-center justify-center text-center">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-purple-200 rounded-full blur-2xl animate-pulse opacity-50"></div>
                                <Loader2 className="w-20 h-20 text-purple-600 animate-spin relative z-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Generating Strategic Analysis</h3>
                            <p className="text-gray-500 max-w-sm text-lg font-medium leading-relaxed">
                                Our AI is aggregating your property data, financial trends, and inventory status to prepare your report.
                            </p>
                        </div>
                    ) : analysis ? (
                        <div ref={reportRef} className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-full print:shadow-none print:border-none">
                            {/* Report Header */}
                            <div className="p-10 border-b-4 border-purple-600 bg-gray-50 print:bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                                            PN
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Business Intelligence Report</h2>
                                            <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">{reportContext?.businessName || "Property Management System"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left md:text-right space-y-1">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Report Identifier</p>
                                    <p className="text-sm font-bold text-gray-900">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                    <p className="text-xs font-bold text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Dashboard Snippet in Report */}
                            {reportContext && (
                                <div className="px-10 py-8 bg-white border-b border-gray-100">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
                                            <p className="text-xl font-black text-gray-900">${reportContext.financials.revenue.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Cash Flow</p>
                                            <p className={`text-xl font-black ${reportContext.financials.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${reportContext.financials.netCashFlow.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Occupancy</p>
                                            <p className="text-xl font-black text-gray-900">{reportContext.inventory.occupancyRate}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Period</p>
                                            <p className="text-xl font-black text-gray-900">{timeRange} Days</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sectioned Content */}
                            <div className="flex-1 p-10 space-y-12 bg-white print:p-0">
                                {(() => {
                                    // Split by ## sections
                                    const parts = analysis.split('##');
                                    const preamble = parts[0].replace(/# .*\n?/, '').trim();
                                    const sections = parts.slice(1);

                                    return (
                                        <div className="space-y-8">
                                            {preamble && (
                                                <p className="text-gray-600 leading-relaxed font-medium bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                                                    {preamble}
                                                </p>
                                            )}

                                            {sections.map((section, idx) => {
                                                const lines = section.split('\n');
                                                const firstNonEmptyIndex = lines.findIndex(l => l.trim() !== "");

                                                if (firstNonEmptyIndex === -1) return null;

                                                const title = lines[firstNonEmptyIndex].trim();
                                                const content = lines.slice(firstNonEmptyIndex + 1).join('\n').trim();

                                                if (!title && !content) return null;

                                                const isRisk = title.toLowerCase().includes('risk');

                                                return (
                                                    <div key={idx} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                                                        <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${isRisk ? 'bg-red-50/30' : 'bg-gray-50/30'}`}>
                                                            {isRisk ? (
                                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                            ) : (
                                                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                                            )}
                                                            <h3 className="text-lg font-black text-gray-900 m-0">
                                                                {title}
                                                            </h3>
                                                        </div>
                                                        <div className="p-8 prose prose-slate max-w-none prose-p:leading-relaxed prose-li:text-gray-700">
                                                            <ReactMarkdown>{content}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Report Footer */}
                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center print:hidden">
                                <p className="text-xs font-bold text-gray-400 italic">
                                    This report was generated by AI based on your live operational data.
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 text-sm font-black text-gray-600 hover:text-purple-600 transition-all"
                                    >
                                        <Printer className="w-4 h-4" />
                                        PDF Version
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-3xl border border-red-200 shadow-xl p-16 h-full flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
                                <AlertTriangle className="w-12 h-12 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3">Analysis Interrupted</h3>
                            <p className="text-red-500 max-w-sm mb-10 text-lg font-medium">{error}</p>
                            <button
                                onClick={() => generateAnalysis()}
                                className="px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all hover:-translate-y-1 shadow-xl shadow-gray-200"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm p-20 h-full flex flex-col items-center justify-center text-center group">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                                <FileText className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Generate Strategy Report</h3>
                            <p className="text-gray-500 max-w-sm mb-12 text-lg font-medium leading-relaxed">
                                Access deep insights into your property portfolio, revenue leaks, and market positioning.
                            </p>
                            <FormButton
                                onClick={() => generateAnalysis()}
                                loading={loading}
                                variant="purple"
                                className="px-12 py-5 text-xl rounded-2xl font-black shadow-2xl shadow-purple-200 hover:-translate-y-1 transition-all"
                            >
                                Build Professional Report
                            </FormButton>

                            <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-2xl opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                <div className="flex flex-col items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-gray-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Financials</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <Home className="w-6 h-6 text-gray-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inventory</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <Users className="w-6 h-6 text-gray-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contracts</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
