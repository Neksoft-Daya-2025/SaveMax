/* Developed by RUDRA via NEKLLM */

"use client";

import { MoreVertical, Edit, Trash2, ArrowUpRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import PermissionGate from "@/components/PermissionGate";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContractActions({ contractId }: { contractId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this contract?")) return;
        try {
            const res = await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                router.refresh();
            } else {
                alert(data.error || "Failed to delete");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative flex justify-end" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                    <Link
                        href={`/contracts/${contractId}`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                        View Details
                    </Link>
                    <PermissionGate resource="contracts" action="edit">
                        <Link
                            href={`/contracts/edit/${contractId}`}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                        >
                            <Edit className="w-4 h-4 text-green-600" />
                            Edit Details
                        </Link>
                    </PermissionGate>
                    <div className="h-px bg-gray-100 my-1" />
                    <PermissionGate resource="contracts" action="delete">
                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Contract
                        </button>
                    </PermissionGate>
                </div>
            )}
        </div>
    );
}
