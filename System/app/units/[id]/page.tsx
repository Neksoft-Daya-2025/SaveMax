/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, MapPin, Bed, Bath, Square, Car, Calendar, Building2,
    Shield, Clock, Edit, Trash2, ChevronLeft, ChevronRight,
    User, Phone, Mail, Tag, Home, AlertCircle, Check, CheckCircle2,
    Info, X, Building, Compass
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function UnitDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [unit, setUnit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const { formatCurrency } = useSettings();

    useEffect(() => {
        if (params.id) fetchUnit();
    }, [params.id]);

    const fetchUnit = async () => {
        try {
            const res = await fetch(`/api/units/${params.id}`);
            const data = await res.json();
            if (data.success) setUnit(data.data);
        } catch (error) {
            console.error("Error fetching unit:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this unit? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/units/${params.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) router.push("/units");
        } catch (error) {
            console.error("Error deleting unit:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-800 border-emerald-100';
            case 'Rented': return 'bg-blue-50 text-blue-800 border-blue-100';
            case 'Booked': return 'bg-amber-50 text-amber-800 border-amber-100';
            case 'Sold': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Reserved': return 'bg-purple-50 text-purple-800 border-purple-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading unit details...</p>
            </div>
        );
    }

    if (!unit) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Unit Not Found</h2>
                <p className="text-sm text-gray-500">The unit you are looking for does not exist or has been deleted.</p>
                <Link href="/units" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                    <ChevronLeft className="w-4 h-4" /> Back to Units
                </Link>
            </div>
        );
    }

    const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop";
    const images = unit.images && unit.images.length > 0
        ? unit.images
        : unit.property?.images && unit.property.images.length > 0
            ? unit.property.images
            : [{ url: defaultImage }];

    return (
        <div className="space-y-5">

            {/* ── Breadcrumb & Back ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Link href="/dashboard" className="hover:text-blue-700 transition-colors">Dashboard</Link>
                    <span>/</span>
                    <Link href="/units" className="hover:text-blue-700 transition-colors">Units</Link>
                    <span>/</span>
                    <span className="text-gray-950 truncate max-w-[200px]">Unit {unit.unitNumber}</span>
                </div>
                <Link href="/units" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Units
                </Link>
            </div>

            {/* ── Photo Gallery ── */}
            <div className="relative group overflow-hidden rounded-2xl shadow-sm bg-gray-100">
                {images.length === 1 ? (
                    <div className="relative h-[300px] md:h-[380px] w-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(0)}>
                        <img src={images[0].url} alt={`Unit ${unit.unitNumber}`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                    </div>
                ) : images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-2 h-[280px] md:h-[360px]">
                        {images.slice(0, 2).map((img: any, idx: number) => (
                            <div key={idx} className="relative h-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(idx)}>
                                <img src={img.url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[280px] md:h-[360px]">
                        <div className="md:col-span-2 h-full relative overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(0)}>
                            <img src={images[0].url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                        </div>
                        <div className="grid grid-rows-2 gap-2 md:col-span-1 h-full">
                            <div className="relative h-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(1)}>
                                <img src={images[1].url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            </div>
                            <div className="relative h-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(2)}>
                                <img src={images[2]?.url || images[0].url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            </div>
                        </div>
                        <div className="md:col-span-1 h-full relative overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(Math.min(images.length - 1, 3))}>
                            <img src={images[3]?.url || images[0].url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            {images.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-semibold">
                                    <span className="text-xl">+{images.length - 4}</span>
                                    <span className="text-xs uppercase tracking-wider">More Photos</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Overview Strip ── */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(unit.status)}`}>
                            {unit.status}
                        </span>
                        {unit.type && (
                            <span className="px-3 py-1 bg-gray-100 border border-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                {unit.type}
                            </span>
                        )}
                        {unit.isCorner && (
                            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                Corner Unit
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight">
                        {unit.property?.title ? `${unit.property.title} — Unit ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
                    </h1>
                    {unit.property?.location && (
                        <div className="flex items-center text-gray-800 text-base font-semibold">
                            <MapPin className="w-5 h-5 mr-1.5 text-blue-600 shrink-0" />
                            <span>{unit.property.location.address}, {unit.property.location.city}, {unit.property.location.country}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto shrink-0 md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <div className="text-left md:text-right mr-auto md:mr-0">
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1">Unit Price</p>
                        <h2 className="text-3xl font-black text-blue-800">
                            {formatCurrency(unit.price)}
                            <span className="text-base font-semibold text-gray-500">/mo</span>
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <PermissionGate resource="properties" action="edit">
                            <Link
                                href={`/units/edit/${unit._id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md"
                            >
                                <Edit className="w-3.5 h-3.5" /> Edit Unit
                            </Link>
                        </PermissionGate>
                        <PermissionGate resource="properties" action="delete">
                            <button
                                onClick={handleDelete}
                                className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all border border-rose-100"
                                title="Delete Unit"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </PermissionGate>
                    </div>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ── Left Column ── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Specifications */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-700" /> Unit Specifications
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: Bed, label: "Bedrooms", value: unit.bedrooms ?? "N/A" },
                                { icon: Bath, label: "Bathrooms", value: unit.bathrooms ?? "N/A" },
                                { icon: Square, label: "Area Size", value: unit.areaSize ? `${unit.areaSize} ft²` : "N/A" },
                                { icon: Car, label: "Windows", value: unit.windows ?? "N/A" },
                                { icon: Building2, label: "Floor Level", value: unit.floor ?? "N/A" },
                                { icon: Shield, label: "Block", value: unit.block ?? "N/A" },
                                { icon: Compass, label: "Facing", value: unit.facing ?? "N/A" },
                                { icon: Calendar, label: "Unit Number", value: unit.unitNumber },
                            ].map((spec, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-lg text-gray-700 border border-gray-100 shadow-sm shrink-0">
                                        <spec.icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{spec.label}</p>
                                        <p className="text-sm font-black text-gray-950 truncate mt-1">{spec.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features / Amenities */}
                    {unit.features && unit.features.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-700" /> Features & Amenities
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {unit.features.map((item: string) => (
                                    <div key={item} className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 font-semibold">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span className="truncate">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Parent Property Link */}
                    {unit.property && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                            <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-700" /> Parent Property
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-blue-50/60 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-600 rounded-xl text-white">
                                        <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-950 text-base">{unit.property.title}</p>
                                        {unit.property.location && (
                                            <p className="text-xs text-gray-600 font-semibold flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {unit.property.location.city}, {unit.property.location.country}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Link
                                    href={`/properties/${unit.property._id}`}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                                >
                                    View Property
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Sidebar ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Unit Identifiers */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-gray-700">Unit Identifiers</h4>
                        <div className="space-y-2.5 text-sm text-gray-800">
                            {[
                                { label: "Unit ID", value: unit._id?.slice(-8).toUpperCase() },
                                { label: "Unit Number", value: unit.unitNumber },
                                { label: "Block", value: unit.block || "—" },
                                { label: "Floor", value: unit.floor || "—" },
                                { label: "Type", value: unit.type || "—" },
                                { label: "Created", value: new Date(unit.createdAt).toLocaleDateString() },
                            ].map((row, i, arr) => (
                                <div key={i} className={`flex items-center justify-between pb-2 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <span className="text-gray-600 font-semibold">{row.label}</span>
                                    <span className="font-bold text-gray-950">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Owner Info */}
                    {unit.owner && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700">Owner</h4>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-base">
                                        {unit.owner.name?.charAt(0) || "O"}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-950 text-sm">{unit.owner.name}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Property Owner</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-800 font-semibold pt-2 border-t border-gray-100">
                                    {unit.owner.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="truncate">{unit.owner.email}</span>
                                        </div>
                                    )}
                                    {unit.owner.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>{unit.owner.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tenant Info */}
                    {unit.tenant && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700">Current Tenant</h4>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-base">
                                        {unit.tenant.name?.charAt(0) || "T"}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-950 text-sm">{unit.tenant.name}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tenant</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-800 font-semibold pt-2 border-t border-gray-100">
                                    {unit.tenant.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span className="truncate">{unit.tenant.email}</span>
                                        </div>
                                    )}
                                    {unit.tenant.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>{unit.tenant.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-blue-950 p-5 rounded-2xl shadow-lg text-white space-y-4">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-2.5 text-center text-[10px] font-bold uppercase tracking-wider">
                            <PermissionGate resource="properties" action="edit">
                                <Link
                                    href={`/units/edit/${unit._id}`}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 flex flex-col items-center gap-1.5"
                                >
                                    <Edit className="w-4 h-4 text-blue-300" />
                                    <span>Edit Unit</span>
                                </Link>
                            </PermissionGate>
                            {unit.property && (
                                <Link
                                    href={`/properties/${unit.property._id}`}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 flex flex-col items-center gap-1.5"
                                >
                                    <Building className="w-4 h-4 text-blue-300" />
                                    <span>View Property</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Lightbox ── */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md">
                    <button
                        onClick={() => setSelectedImageIndex(null)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    {images.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); setSelectedImageIndex(prev => (prev === null || prev === 0 ? images.length - 1 : prev - 1)); }}
                            className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div className="max-w-5xl max-h-[80vh] px-4 flex flex-col items-center justify-center">
                        <img
                            src={images[selectedImageIndex]?.url || defaultImage}
                            alt={`Unit Image ${selectedImageIndex + 1}`}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                        />
                        <p className="text-center text-white/60 text-xs mt-4 font-medium uppercase tracking-widest">
                            Image {selectedImageIndex + 1} of {images.length}
                        </p>
                    </div>
                    {images.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); setSelectedImageIndex(prev => (prev === null || prev === images.length - 1 ? 0 : prev + 1)); }}
                            className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
