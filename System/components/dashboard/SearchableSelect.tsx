/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

export interface SearchableSelectOption {
    value: string;
    label: string;
    subLabel?: string;
    badge?: string;
    icon?: React.ReactNode;
}

interface SearchableSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    icon?: React.ReactNode;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export default function SearchableSelect({
    label,
    value,
    onChange,
    options,
    placeholder = "Select an option...",
    searchPlaceholder = "Type to search...",
    icon,
    error,
    required = false,
    disabled = false,
    className = "",
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Selected option info
    const selectedOption = useMemo(() => {
        return options.find((opt) => opt.value === value);
    }, [options, value]);

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.toLowerCase().trim();
        return options.filter((opt) => {
            const matchLabel = opt.label.toLowerCase().includes(q);
            const matchValue = opt.value.toLowerCase().includes(q);
            const matchSub = opt.subLabel?.toLowerCase().includes(q);
            const matchBadge = opt.badge?.toLowerCase().includes(q);
            return matchLabel || matchValue || matchSub || matchBadge;
        });
    }, [options, searchQuery]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Auto-focus search input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearchQuery("");
        }
    }, [isOpen]);

    // Handle escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
            {label && (
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs transition-all text-left outline-none ${
                    disabled
                        ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
                        : error
                        ? "border-red-500 ring-2 ring-red-500/20 bg-white"
                        : isOpen
                        ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 hover:bg-white text-gray-900 cursor-pointer"
                }`}
            >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                    {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
                    {selectedOption ? (
                        <div className="flex items-center gap-2 truncate">
                            {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                            <span className="font-semibold text-gray-900 truncate">{selectedOption.label}</span>
                            {selectedOption.badge && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                                    {selectedOption.badge}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>

                <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                />
            </button>

            {/* Floating Dropdown Popover */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input Box */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="p-1 text-gray-400 hover:text-gray-600 absolute right-1.5 top-1/2 -translate-y-1/2"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1 divide-y divide-gray-50 text-xs">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-gray-400">
                                <p className="text-xs">No matching options found</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">Try searching with a different term</p>
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${
                                            isSelected
                                                ? "bg-blue-50 text-blue-900 font-bold"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                                            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                            <div className="truncate">
                                                <div className="truncate font-medium">{opt.label}</div>
                                                {opt.subLabel && (
                                                    <div className="text-[11px] text-gray-400 truncate font-normal">
                                                        {opt.subLabel}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {opt.badge && (
                                                <span
                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                        isSelected
                                                            ? "bg-blue-200 text-blue-900"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {opt.badge}
                                                </span>
                                            )}
                                            {isSelected && <Check className="w-4 h-4 text-blue-900 shrink-0" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer showing count */}
                    <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>Showing {filteredOptions.length} of {options.length} options</span>
                        <span>ESC to close</span>
                    </div>
                </div>
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
