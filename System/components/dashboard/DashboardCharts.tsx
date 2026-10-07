"use client";

import dynamic from 'next/dynamic';

const SalesChart = dynamic(() => import('./SalesChart'), { ssr: false });
const PropertyStatusChart = dynamic(() => import('./PropertyStatusChart'), { ssr: false });

interface DashboardChartsProps {
    salesData: any[];
    statusData: any[];
}

export default function DashboardCharts({ salesData, statusData }: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart data={salesData} />
            <PropertyStatusChart data={statusData} />
        </div>
    );
}
