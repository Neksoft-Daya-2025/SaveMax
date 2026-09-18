/* Developed by RUDRA via NEKLLM */

"use client";

import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";

export function PropertySearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [isSearching, setIsSearching] = useState(false);

    // Handle debounced search
    useEffect(() => {
        // Don't trigger search if the value is the same as the current URL
        const currentSearch = searchParams.get("search") || "";
        if (searchTerm === currentSearch) {
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchTerm) {
                params.set("search", searchTerm);
            } else {
                params.delete("search");
            }
            params.set("page", "1"); // Reset to page 1 on new search

            router.replace(`/properties?${params.toString()}`, { scroll: false });
            setIsSearching(false);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, router, searchParams]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
            <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? "text-blue-600 animate-pulse" : "text-gray-400"}`} />
                <input
                    type="text"
                    placeholder="Quick search by title, location or city..."
                    className="w-full pl-12 pr-4 py-3.5 border border-transparent rounded-2xl focus:ring-2 focus:ring-blue-900 focus:bg-white outline-none text-black bg-gray-50 font-medium transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function PropertyPagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `/properties?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => router.push(createPageURL(currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => router.push(createPageURL(page))}
                        className={`
                            w-10 h-10 rounded-lg font-bold transition-all
                            ${currentPage === page
                                ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20 scale-110"
                                : "text-gray-600 hover:bg-gray-100 border border-gray-100"}
                        `}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => router.push(createPageURL(currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
}
