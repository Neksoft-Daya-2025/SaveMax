/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect, useRef } from "react";
import {
    Plus, Home, MapPin, Edit, Trash2, Eye, Search,
    ChevronLeft, ChevronRight, RefreshCw, Building2,
    CheckCircle2, Users, Wrench, LayoutGrid, List,
    AlignJustify, ChevronDown, MoreHorizontal, X,
    Bed, Bath, Square, Building
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";
import { useSettings } from "@/components/providers/SettingsProvider";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UnitStats { total: number; available: number; occupied: number; rented: number; }
interface Unit {
    _id: string;
    unitNumber: string;
    type?: string;
    status: string;
    price: number;
    areaSize: number;
    bedrooms?: number;
    bathrooms?: number;
    block?: string;
    floor?: string;
    images?: { url: string; isFeatured: boolean }[];
    property?: {
        _id: string;
        title: string;
        description?: string;
        location: { address: string; city: string; state?: string; country: string };
        images?: { url: string; isFeatured: boolean }[];
    };
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, sublabel, value, icon, iconBg }: {
    label: string; sublabel: string; value: number | string;
    icon: React.ReactNode; iconBg: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
                {icon}
            </div>
        </div>
    );
}

// ─── Filter Dropdown ────────────────────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange }: {
    label: string; options: { label: string; value: string }[];
    value: string; onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find(o => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all whitespace-nowrap"
            >
                <span>{selected?.label || label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${value === opt.value ? 'text-blue-700 font-medium bg-blue-50' : 'text-gray-700'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Status badge colors ────────────────────────────────────────────────────────
function statusBadge(status: string) {
    switch (status) {
        case 'Available': return 'bg-emerald-500 text-white';
        case 'Rented':
        case 'Booked': return 'bg-orange-500 text-white';
        case 'Sold': return 'bg-gray-600 text-white';
        case 'Reserved': return 'bg-purple-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop";

// ─── Unit Card (Grid) ───────────────────────────────────────────────────────────
function UnitCard({ unit, formatCurrency, onDelete }: { unit: Unit; formatCurrency: (v: number) => string; onDelete: (id: string) => void }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const imgUrl = unit.images?.[0]?.url || unit.property?.images?.[0]?.url || DEFAULT_IMAGE;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img src={imgUrl} alt={`Unit ${unit.unitNumber}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {/* Status badge */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(unit.status)}`}>
                    {unit.status}
                </span>
                {/* Type badge */}
                <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 border border-white/50 shadow-sm">
                    <Building className="w-3 h-3 text-gray-500" />
                    {unit.type || "Unit"}
                </span>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                {/* Title + description */}
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
                        {unit.property?.title ? `${unit.property.title} - Unit ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{unit.property?.description || "No description provided"}</p>
                </div>

                {/* Address */}
                {unit.property?.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="line-clamp-1">{unit.property.location.city}, {unit.property.location.country}</span>
                    </div>
                )}

                {/* Specs row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    {unit.bedrooms !== undefined && (
                        <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{unit.bedrooms}</span>
                    )}
                    {unit.bathrooms !== undefined && (
                        <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{unit.bathrooms}</span>
                    )}
                    {unit.areaSize && (
                        <span className="flex items-center gap-1"><Square className="w-3 h-3" />{unit.areaSize} ft²</span>
                    )}
                    {(unit.block || unit.floor) && (
                        <span className="text-gray-400 ml-auto">{unit.block ? `Blk ${unit.block}` : ''}{unit.floor ? ` • Fl ${unit.floor}` : ''}</span>
                    )}
                </div>

                {/* Footer: Price + Menu */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(unit.price)}
                        <span className="text-xs font-normal text-gray-400"> /month</span>
                    </span>
                    <div ref={menuRef} className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuOpen && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 w-36">
                                <Link href={`/units/${unit._id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Eye className="w-3.5 h-3.5" /> View
                                </Link>
                                <PermissionGate resource="properties" action="edit">
                                    <Link href={`/units/edit/${unit._id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <Edit className="w-3.5 h-3.5" /> Edit
                                    </Link>
                                </PermissionGate>
                                <PermissionGate resource="properties" action="delete">
                                    <button
                                        onClick={() => { onDelete(unit._id); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </PermissionGate>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Unit Row (List) ────────────────────────────────────────────────────────────
function UnitRow({ unit, formatCurrency, onDelete }: { unit: Unit; formatCurrency: (v: number) => string; onDelete: (id: string) => void }) {
    const imgUrl = unit.images?.[0]?.url || unit.property?.images?.[0]?.url || DEFAULT_IMAGE;

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
            <img src={imgUrl} alt={`Unit ${unit.unitNumber}`} className="w-16 h-16 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {unit.property?.title ? `${unit.property.title} - Unit ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusBadge(unit.status)}`}>{unit.status}</span>
                </div>
                {unit.property?.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{unit.property.location.city}, {unit.property.location.country}
                    </p>
                )}
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    {unit.bedrooms !== undefined && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{unit.bedrooms} beds</span>}
                    {unit.bathrooms !== undefined && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{unit.bathrooms} baths</span>}
                    {unit.areaSize && <span className="flex items-center gap-1"><Square className="w-3 h-3" />{unit.areaSize} ft²</span>}
                </div>
            </div>
            <div className="shrink-0 text-right">
                <p className="font-bold text-sm text-gray-900">{formatCurrency(unit.price)}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                <span className="text-xs text-gray-400">{unit.type || "Unit"}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Link href={`/units/${unit._id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Eye className="w-4 h-4" /></Link>
                <PermissionGate resource="properties" action="edit">
                    <Link href={`/units/edit/${unit._id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Edit className="w-4 h-4" /></Link>
                </PermissionGate>
                <PermissionGate resource="properties" action="delete">
                    <button onClick={() => onDelete(unit._id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </PermissionGate>
            </div>
        </div>
    );
}

// ─── Unit Compact ───────────────────────────────────────────────────────────────
function UnitCompact({ unit, formatCurrency }: { unit: Unit; formatCurrency: (v: number) => string }) {
    return (
        <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-all">
            <span className={`w-2 h-2 rounded-full shrink-0 ${unit.status === 'Available' ? 'bg-emerald-500' : unit.status === 'Rented' || unit.status === 'Booked' ? 'bg-orange-500' : 'bg-gray-400'}`} />
            <span className="font-medium text-sm text-gray-900 flex-1 truncate">
                {unit.property?.title ? `${unit.property.title} - Unit ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
            </span>
            <span className="text-xs text-gray-400 shrink-0">{unit.type || "Unit"}</span>
            <span className="font-semibold text-sm text-gray-900 shrink-0">{formatCurrency(unit.price)}</span>
            <Link href={`/units/${unit._id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 shrink-0 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [stats, setStats] = useState<UnitStats>({ total: 0, available: 0, occupied: 0, rented: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 0 });
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortFilter, setSortFilter] = useState("newest");
    const { formatCurrency } = useSettings();

    useEffect(() => { fetchUnits(); }, [search, page, typeFilter, statusFilter, sortFilter]);

    const fetchUnits = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const sortMap: Record<string, { sortBy: string; sortOrder: string }> = {
                newest: { sortBy: 'createdAt', sortOrder: 'desc' },
                oldest: { sortBy: 'createdAt', sortOrder: 'asc' },
                price_asc: { sortBy: 'price', sortOrder: 'asc' },
                price_desc: { sortBy: 'price', sortOrder: 'desc' },
                unit_asc: { sortBy: 'unitNumber', sortOrder: 'asc' },
            };
            const { sortBy, sortOrder } = sortMap[sortFilter] || sortMap.newest;
            const query = new URLSearchParams({ page: page.toString(), limit: "12", search, sortBy, sortOrder });
            if (typeFilter) query.set('type', typeFilter);
            if (statusFilter) query.set('status', statusFilter);
            const res = await fetch(`/api/units?${query}`);
            const data = await res.json();
            if (data.success) {
                setUnits(data.data);
                if (data.pagination) setPagination(data.pagination);
                if (data.summary) {
                    setStats({
                        total: data.summary.totalUnits,
                        available: data.summary.totalUnits - data.summary.occupiedCount,
                        occupied: data.summary.occupiedCount,
                        rented: data.summary.occupiedCount
                    });
                }
            }
        } catch (error) { console.error("Error fetching units:", error); }
        finally { setLoading(false); setRefreshing(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this unit?")) return;
        try {
            const res = await fetch(`/api/units/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchUnits();
            else alert(data.error);
        } catch (error) { console.error("Error deleting unit:", error); }
    };

    const handleRefresh = () => { setPage(1); fetchUnits(true); };

    const typeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Apartment', value: 'Apartment' }, { label: 'Studio', value: 'Studio' },
        { label: 'Duplex', value: 'Duplex' }, { label: 'Penthouse', value: 'Penthouse' },
        { label: 'Office', value: 'Office' }, { label: 'Shop', value: 'Shop' },
    ];
    const statusOptions = [
        { label: 'All Statuses', value: '' },
        { label: 'Available', value: 'Available' }, { label: 'Rented', value: 'Rented' },
        { label: 'Booked', value: 'Booked' }, { label: 'Sold', value: 'Sold' },
        { label: 'Reserved', value: 'Reserved' },
    ];
    const sortOptions = [
        { label: 'Newest First', value: 'newest' }, { label: 'Oldest First', value: 'oldest' },
        { label: 'Price: Low to High', value: 'price_asc' }, { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Unit Number A-Z', value: 'unit_asc' },
    ];

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Units</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage individual units across all properties</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <PermissionGate resource="properties" action="create">
                        <Link
                            href="/units/create"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Unit
                        </Link>
                    </PermissionGate>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Units" sublabel="All unit listings"
                    value={stats.total} iconBg="bg-blue-50"
                    icon={<Building2 className="w-5 h-5 text-blue-600" />}
                />
                <StatCard
                    label="Available Units" sublabel="Ready for occupancy"
                    value={stats.available} iconBg="bg-emerald-50"
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                />
                <StatCard
                    label="Occupied Units" sublabel="Currently rented/booked"
                    value={stats.occupied} iconBg="bg-orange-50"
                    icon={<Users className="w-5 h-5 text-orange-500" />}
                />
                <StatCard
                    label="Under Maintenance" sublabel="Needs attention"
                    value={0} iconBg="bg-yellow-50"
                    icon={<Wrench className="w-5 h-5 text-yellow-500" />}
                />
            </div>

            {/* ── Units Panel ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Units</h2>
                            <p className="text-xs text-gray-400">
                                {loading ? 'Loading...' : `Showing ${Math.min((page - 1) * 12 + 1, pagination.total)} to ${Math.min(page * 12, pagination.total)} of ${pagination.total} units`}
                            </p>
                        </div>
                    </div>
                    {/* View toggles */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        {([['grid', LayoutGrid], ['list', List], ['compact', AlignJustify]] as const).map(([mode, Icon]) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`p-1.5 rounded-md transition-all ${viewMode === mode ? 'bg-white shadow-sm text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search units..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    {/* Dropdowns */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <FilterDropdown label="All Types" options={typeOptions} value={typeFilter} onChange={v => { setTypeFilter(v); setPage(1); }} />
                        <FilterDropdown label="All Statuses" options={statusOptions} value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} />
                        <FilterDropdown label="Newest First" options={sortOptions} value={sortFilter} onChange={v => { setSortFilter(v); setPage(1); }} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {loading && units.length === 0 ? (
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            : "space-y-3"}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className={`bg-gray-100 rounded-xl animate-pulse ${viewMode === 'grid' ? 'h-72' : 'h-20'}`} />
                            ))}
                        </div>
                    ) : units.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Home className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-1">No units found</h3>
                            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {units.map(u => <UnitCard key={u._id} unit={u} formatCurrency={formatCurrency} onDelete={handleDelete} />)}
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="space-y-3">
                            {units.map(u => <UnitRow key={u._id} unit={u} formatCurrency={formatCurrency} onDelete={handleDelete} />)}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {units.map(u => <UnitCompact key={u._id} unit={u} formatCurrency={formatCurrency} />)}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-6 pt-5 border-t border-gray-100">
                            <button
                                onClick={() => setPage(page - 1)} disabled={page <= 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                                .reduce((acc: (number | '...')[], p, idx, arr) => {
                                    if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) => p === '...'
                                    ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                                    : <button key={p} onClick={() => setPage(p as number)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-blue-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 border border-gray-200 bg-white'}`}>
                                        {p}
                                    </button>
                                )}
                            <button
                                onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
