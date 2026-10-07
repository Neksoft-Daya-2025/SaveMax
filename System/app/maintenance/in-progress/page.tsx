
"use client";

import MaintenanceList from "@/components/property/MaintenanceList";

export default function InProgressMaintenancePage() {
    return (
        <MaintenanceList
            title="In Progress Requests"
            subtitle="Maintenance requests currently being worked on"
            presetStatus="In Progress"
            hideStatusFilter
        />
    );
}
