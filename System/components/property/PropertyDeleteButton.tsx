
"use client";

import { Trash2 } from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PropertyDeleteButton({ propertyId }: { propertyId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                router.refresh(); // Refresh the server component data
            } else {
                alert(data.error || "Failed to delete property");
            }
        } catch (error) {
            console.error("Error deleting property:", error);
            alert("An error occurred while deleting the property");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PermissionGate resource="properties" action="delete">
            <button
                onClick={handleDelete}
                disabled={loading}
                className={`
                    p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                title="Delete Property"
            >
                <Trash2 className={`w-5 h-5 ${loading ? "animate-pulse" : ""}`} />
            </button>
        </PermissionGate>
    );
}
