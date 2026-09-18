/* Developed by RUDRA via NEKLLM */

"use client";

import MaintenanceList from "@/components/property/MaintenanceList";

export default function EmergencyMaintenancePage() {
    return (
        <MaintenanceList
            title="Emergency Requests"
            subtitle="High-priority maintenance issues that need immediate attention"
            presetPriority="Emergency"
            hidePriorityFilter
        />
    );
}
