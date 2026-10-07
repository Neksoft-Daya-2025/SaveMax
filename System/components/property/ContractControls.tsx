
"use client";

import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function ContractSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
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
            params.set("page", "1");
            router.replace(`/contracts?${params.toString()}`, { scroll: false });
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, router, searchParams]);

    return (
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative w-full md:w-96">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? "text-blue-600 animate-pulse" : "text-gray-400"}`} />
                <input
                    type="text"
                    placeholder="Search by property, client or owner..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm text-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => { setSearchTerm(""); }}
                    className="text-gray-500 hover:text-gray-700 font-medium text-sm px-2"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}

export function ContractPagination({ totalPages, currentPage, totalResults, resultsOnPage }: { totalPages: number, currentPage: number, totalResults: number, resultsOnPage: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `/contracts?${params.toString()}`;
    };

    if (totalResults === 0) return null;

    return (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900">{resultsOnPage}</span> of <span className="text-gray-900">{totalResults}</span> contracts
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push(createPageURL(currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        return (
                            <button
                                key={pageNum}
                                onClick={() => router.push(createPageURL(pageNum))}
                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${currentPage === pageNum
                                    ? "bg-blue-900 text-white shadow-md shadow-blue-900/20"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => router.push(createPageURL(currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
