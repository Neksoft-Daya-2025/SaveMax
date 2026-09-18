/* Developed by RUDRA via NEKLLM */

"use client";

import { ReactNode } from "react";
import { Download } from "lucide-react";

export const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = [2024, 2025, 2026];

interface PeriodSelectorProps {
    year: number;
    month: string;
    setYear: (y: number) => void;
    setMonth: (m: string) => void;
}

export function PeriodSelector({ year, month, setYear, setMonth }: PeriodSelectorProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
            >
                <option value="all">Full Year</option>
                {MONTHS.map((m, i) => (
                    <option key={i} value={(i + 1).toString()}>{m}</option>
                ))}
            </select>

            <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
                {YEARS.map((y) => (
                    <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${year === y ? 'bg-blue-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        {y}
                    </button>
                ))}
            </div>

            <button className="inline-flex items-center gap-2 px-3 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-all">
                <Download className="w-4 h-4" />
                Export
            </button>
        </div>
    );
}

interface CardProps {
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
}

export function Card({ title, subtitle, action, children, className = "", bodyClassName = "p-5" }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
            {(title || action) && (
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            )}
            <div className={bodyClassName}>{children}</div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: ReactNode;
    icon: any;
    color: string;   // text color, e.g. "text-emerald-600"
    bg: string;       // bg color, e.g. "bg-emerald-50"
    subtitle?: string;
}

export function StatCard({ label, value, icon: Icon, color, bg, subtitle }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className={`inline-flex p-2.5 rounded-lg ${bg} ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            {subtitle && <p className={`mt-1 text-xs font-medium ${color}`}>{subtitle}</p>}
        </div>
    );
}
