/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import {
    Sparkles, Send, Loader2, Home,
    Bot, ChevronDown, Info, TrendingUp, DollarSign,
    AlertTriangle, FileText, BarChart3, Search
} from "lucide-react";
import { FormButton } from "@/components/dashboard/FormInput";
import ReactMarkdown from "react-markdown";

interface PropertyOption {
    _id: string;
    title: string;
    price: number;
    location: { city: string };
    propertyType: string;
}

export default function PropertyAssistantPage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<PropertyOption[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [error, setError] = useState("");
    const [aiEnabled, setAiEnabled] = useState(true);

    useEffect(() => {
        checkSettings();
        fetchProperties();
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

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/property-assistant");
            const data = await res.json();
            if (data.success) {
                setProperties(data.data);
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

        try {
            const res = await fetch("/api/property-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt || "Provide a comprehensive pricing analysis and investment evaluation for this property.",
                    propertyId: selectedPropertyId
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAnalysis(data.message);
            } else {
                setError(data.error || "Failed to generate analysis");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!aiEnabled) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-16 shadow-sm">
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Bot className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">AI Analysis Locked</h1>
                    <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto">
                        Enable OpenAI integration in your settings to unlock advanced property investment intelligence.
                    </p>
                    <a
                        href="/settings"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                    >
                        Go to Settings
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 h-auto">
            {/* Header Area */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Investment Intelligence</h1>
                    </div>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        Select a property to generate a professional valuation report, market comparison, and ROI prediction powered by AI.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3 self-end lg:self-center">
                    <div className="w-full sm:w-auto">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1 block">Property Selection</label>
                        <div className="relative group">
                            <select
                                value={selectedPropertyId}
                                onChange={(e) => setSelectedPropertyId(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 block w-full sm:w-72 p-4 pr-10 outline-none transition-all font-bold cursor-pointer hover:bg-gray-100"
                            >
                                <option value="">🌐 General Market Analysis</option>
                                {properties.map(p => (
                                    <option key={p._id} value={p._id}>
                                        🏠 {p.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-4.5 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto">
                {/* Input Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Search className="w-4 h-4 text-blue-600" />
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Analysis Focus</h3>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Focus on rental yield potential and structural risks in the neighborhood."
                            className="w-full h-32 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all font-medium text-sm"
                        />
                        <div className="text-[10px] font-bold text-gray-400 italic">
                            Leave empty for a standard comprehensive report.
                        </div>

                        <FormButton
                            onClick={() => generateAnalysis()}
                            loading={loading}
                            variant="purple"
                            className="w-full h-[52px] rounded-2xl text-lg font-black shadow-xl shadow-purple-100 mt-4"
                            icon={<BarChart3 className="w-5 h-5 ml-2" />}
                            disabled={!selectedPropertyId && !prompt}
                        >
                            Generate Report
                        </FormButton>
                    </div>

                    {selectedPropertyId && (
                        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <DollarSign className="w-20 h-20" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Selected Asset</h4>
                            <div className="text-xl font-black mb-1">
                                {properties.find(p => p._id === selectedPropertyId)?.title}
                            </div>
                            <div className="text-2xl font-black">
                                ${properties.find(p => p._id === selectedPropertyId)?.price.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Results Area */}
                <div className="lg:col-span-8 h-auto">
                    {loading ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-20 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl animate-pulse"></div>
                                <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Gathering Intelligence...</h3>
                            <p className="text-gray-500 max-w-xs font-medium">Evaluating market trends and property specifics to generate your report.</p>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500 h-auto relative overflow-hidden">
                            {/* Watermark for professionalism */}
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 -rotate-12 pointer-events-none opacity-[0.03] select-none text-9xl font-black text-slate-900 tracking-tighter whitespace-nowrap hidden lg:block">
                                CONFIDENTIAL REPORT
                            </div>

                            {(() => {
                                const parts = analysis.split('##');
                                const preamble = parts[0].replace(/# .*\n?/, '').trim();
                                const sections = parts.slice(1);

                                return (
                                    <>
                                        {/* Professional Report Header (Internal) */}
                                        <div className="bg-white border-b-4 border-slate-900 p-10 flex justify-between items-start rounded-t-3xl shadow-sm">
                                            <div className="space-y-1">
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase font-serif">Valuation Analysis</h2>
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Institutional Series • AI Verified</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full border border-red-100 uppercase tracking-widest mb-2">
                                                    Internal Access Only
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Generated: {new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {preamble && (
                                            <div className="bg-slate-50 border-x border-slate-100 p-10 text-slate-700 font-medium leading-relaxed italic text-lg border-b border-dashed border-slate-200">
                                                <span className="text-4xl text-slate-300 font-serif mr-2">"</span>
                                                {preamble}
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            {sections.map((section, idx) => {
                                                const lines = section.split('\n');
                                                const firstNonEmptyIndex = lines.findIndex(l => l.trim() !== "");

                                                if (firstNonEmptyIndex === -1) return null;

                                                const title = lines[firstNonEmptyIndex].trim();
                                                const content = lines.slice(firstNonEmptyIndex + 1).join('\n').trim();

                                                if (!title && !content) return null;

                                                const isRisk = title.toLowerCase().includes('risk');
                                                const isRecommendation = title.toLowerCase().includes('recommendation');

                                                return (
                                                    <div key={idx} className="bg-white border border-slate-100 mb-8 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all">
                                                        <div className={`px-10 py-6 border-b border-slate-50 flex items-center justify-between ${isRisk ? 'bg-red-50/30' : isRecommendation ? 'bg-emerald-50/30' : 'bg-slate-50/30'}`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2.5 rounded-xl shadow-sm ${isRisk ? 'bg-red-100 text-red-600' : isRecommendation ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-900 text-white'}`}>
                                                                    {isRisk ? <AlertTriangle className="w-5 h-5" /> : isRecommendation ? <Sparkles className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                                                                </div>
                                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-tight">
                                                                    {title}
                                                                </h3>
                                                            </div>
                                                            <div className="hidden sm:block">
                                                                <div className="h-1 w-12 bg-slate-900/10 rounded-full"></div>
                                                            </div>
                                                        </div>
                                                        <div className="p-10 prose prose-slate max-w-none prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900 prose-headings:hidden">
                                                            <ReactMarkdown>{content}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Formal Signature Area for Printing */}
                                        <div className="mt-12 p-10 border-t-2 border-slate-100 flex flex-col sm:flex-row justify-between items-end gap-8 opacity-60">
                                            <div className="space-y-4 w-full sm:w-auto">
                                                <div className="w-48 border-b border-slate-400 h-10"></div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Analyst Signature</p>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Identification Matrix</p>
                                                <div className="flex gap-1 justify-end">
                                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-1 h-4 bg-slate-200"></div>)}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-16 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Analysis Interrupted</h3>
                            <p className="text-red-500 font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center group h-full flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                                <FileText className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Ready for Assessment</h3>
                            <p className="text-gray-500 max-w-xs mx-auto font-medium text-lg leading-relaxed mb-8">
                                Choose a property and click analyze to generate your strategic investment report.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
