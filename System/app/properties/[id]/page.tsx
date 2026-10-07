"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MapPin,
    Bed,
    Bath,
    Square,
    Car,
    Calendar,
    Tag,
    User,
    Phone,
    Mail,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Shield,
    CheckCircle2,
    DollarSign,
    FileText,
    Building2,
    LayoutDashboard,
    CreditCard,
    Wallet,
    MessageSquare,
    Wrench,
    TrendingUp,
    Users,
    ArrowLeft,
    Compass,
    Image as ImageIcon,
    Video,
    Download,
    ExternalLink,
    AlertCircle,
    Info,
    Check,
    X,
    Copy,
    Building,
    PlusCircle
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [units, setUnits] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'invoices' | 'history'>('invoices');
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState(false);
    const { formatCurrency } = useSettings();

    useEffect(() => {
        if (params.id) {
            fetchProperty();
            fetchUnits(params.id as string);
            fetchPayments(params.id as string);
            fetchDeposits(params.id as string);
            fetchInquiries(params.id as string);
            fetchMaintenance(params.id as string);
        }
    }, [params.id]);

    const fetchProperty = async () => {
        try {
            const res = await fetch(`/api/properties/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setProperty(data.data);
            }
        } catch (error) {
            console.error("Error fetching property:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnits = async (id: string) => {
        try {
            const res = await fetch(`/api/units?propertyId=${id}&limit=100`);
            const data = await res.json();
            if (data.success) {
                setUnits(data.data);
            }
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    const fetchPayments = async (id: string) => {
        try {
            const res = await fetch(`/api/payments?property=${id}&limit=100`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    };

    const fetchDeposits = async (id: string) => {
        try {
            const res = await fetch(`/api/deposits?property=${id}&limit=100`);
            const data = await res.json();
            if (data.success) {
                setDeposits(data.data);
            }
        } catch (error) {
            console.error("Error fetching deposits:", error);
        }
    };

    const fetchInquiries = async (id: string) => {
        try {
            const res = await fetch(`/api/inquiries?property=${id}`);
            const data = await res.json();
            if (data.success) {
                setInquiries(data.data);
            }
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        }
    };

    const fetchMaintenance = async (id: string) => {
        try {
            const res = await fetch(`/api/maintenance?property=${id}`);
            const data = await res.json();
            if (data.success) {
                setMaintenanceRequests(data.data);
            }
        } catch (error) {
            console.error("Error fetching maintenance:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Received': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Refunded': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/properties/${params.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                router.push("/properties");
            }
        } catch (error) {
            console.error("Error deleting property:", error);
        }
    };

    const copyPropertyId = () => {
        if (property?._id) {
            navigator.clipboard.writeText(property._id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading property details...</p>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Property Not Found</h2>
                <p className="text-sm text-gray-500">The property you are looking for does not exist or has been deleted.</p>
                <Link href="/properties" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                    <ChevronLeft className="w-4 h-4" /> Back to Listings
                </Link>
            </div>
        );
    }

    const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop";
    const images = property.images && property.images.length > 0 ? property.images : [{ url: defaultImage }];

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-gray-900">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Link href="/dashboard" className="hover:text-blue-700 transition-colors">Dashboard</Link>
                    <span>/</span>
                    <Link href="/properties" className="hover:text-blue-700 transition-colors">Properties</Link>
                    <span>/</span>
                    <span className="text-gray-950 truncate max-w-[200px]">{property.title}</span>
                </div>
                <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Listings
                </Link>
            </div>

            {/* Premium Interactive Photo Gallery / Collage */}
            <div className="relative group overflow-hidden rounded-2xl shadow-sm bg-gray-100">
                {images.length === 1 ? (
                    <div className="relative h-[360px] md:h-[450px] w-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(0)}>
                        <img 
                            src={images[0].url} 
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                    </div>
                ) : images.length === 2 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[320px] md:h-[400px]">
                        {images.slice(0, 2).map((img: any, idx: number) => (
                            <div key={idx} className="relative h-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(idx)}>
                                <img src={img.url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] md:h-[420px]">
                        <div className="md:col-span-2 h-full relative overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(0)}>
                            <img src={images[0].url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                        </div>
                        <div className="grid grid-rows-2 gap-2 md:col-span-1 h-full">
                            <div className="relative h-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(1)}>
                                <img src={images[1].url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
                            </div>
                            <div className="relative h-full overflow-hidden cursor-pointer" onClick={() => setSelectedImageIndex(2)}>
                                <img src={images[2].url} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
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
                {/* View Photos Floating Button */}
                <button 
                    onClick={() => setSelectedImageIndex(0)}
                    className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md backdrop-blur-sm transition-all border border-gray-100"
                >
                    <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
                    View All Photos ({images.length})
                </button>
            </div>

            {/* Quick Overview Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            property.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                            {property.status}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">
                            {property.propertyType} • {property.purpose}
                        </span>
                        {property.isNegotiable && (
                            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-850 rounded-full text-xs font-bold uppercase tracking-wider">
                                Negotiable
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight">{property.title}</h1>
                    <div className="flex items-center text-gray-800 text-base font-semibold">
                        <MapPin className="w-5 h-5 mr-1.5 text-blue-600 shrink-0" />
                        <span>{property.location.address}, {property.location.city}, {property.location.country}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto shrink-0 md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <div className="text-left md:text-right mr-auto md:mr-0">
                        {property.submissionSource === 'public' && <p className="text-sm text-gray-700 mb-2">Submitted by {property.createdBy?.name || 'Customer'} · {property.createdBy?.email} {property.createdBy?.phone}</p>}
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-1">Asset Price</p>
                        <h2 className="text-3xl font-black text-blue-800">
                            {formatCurrency(property.price)}
                            {['Rent', 'Lease'].includes(property.purpose) && <span className="text-base font-semibold text-gray-500"> /{property.pricePeriod === 'year' ? 'year' : 'month'}</span>}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <PermissionGate resource="properties" action="edit">
                            <Link
                                href={`/properties/edit/${property._id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-100"
                            >
                                <Edit className="w-3.5 h-3.5" /> Edit Asset
                            </Link>
                        </PermissionGate>
                        <PermissionGate resource="properties" action="delete">
                            <button
                                onClick={handleDelete}
                                className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all border border-rose-100"
                                title="Delete Property"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </PermissionGate>
                    </div>
                </div>
            </div>

            {/* Quick Analytics & Stats Dashboard row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Units", value: units.length, icon: Building, color: "text-indigo-700", bg: "bg-indigo-50" },
                    { label: "Total Inquiries", value: inquiries.length, icon: MessageSquare, color: "text-blue-700", bg: "bg-blue-50" },
                    { label: "Maintenance Requests", value: maintenanceRequests.filter(r => r.status !== 'Resolved').length, icon: Wrench, color: "text-amber-700", bg: "bg-amber-50" },
                    { label: "Asset Lifetime Revenue", value: formatCurrency(payments.reduce((acc, curr) => acc + (curr.receivedAmount || 0), 0)), icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider truncate">{stat.label}</p>
                            <p className="text-xl font-black text-gray-950 mt-1 truncate">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Layout Grid (Main vs Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Asset Details & Inventory */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Specifications Grid */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        <h3 className="text-lg font-black text-gray-955 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-700" /> Specifications & Metrics
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: Bed, label: "Bedrooms", value: property.bedrooms || "N/A" },
                                { icon: Bath, label: "Bathrooms", value: property.bathrooms || "N/A" },
                                { icon: Square, label: "Area Size", value: `${property.areaSize} ${property.areaUnit}` },
                                { icon: Car, label: "Parking Slots", value: property.parking || "None" },
                                { icon: Calendar, label: "Built/Age", value: property.age ? `${property.age} Years` : "N/A" },
                                { icon: Building2, label: "Floor Level", value: property.floor || "N/A" },
                                { icon: Shield, label: "Block/Tower", value: property.block || "N/A" },
                                { icon: Clock, label: "Possession Date", value: property.possessionDate ? new Date(property.possessionDate).toLocaleDateString() : "Immediate" },
                            ].map((spec, i) => (
                                <div key={i} className="bg-gray-100/50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-lg text-gray-700 border border-gray-100 shadow-sm shrink-0">
                                        <spec.icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-650 uppercase tracking-wider truncate">{spec.label}</p>
                                        <p className="text-sm font-black text-gray-950 truncate mt-1">{spec.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                        <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-700" /> Property Overview
                        </h3>
                        <div className="text-gray-800 text-base leading-relaxed font-semibold whitespace-pre-line bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                            {property.description}
                        </div>
                    </div>

                    {/* Unit Inventory List */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-955 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-700" /> Unit Inventory ({units.length})
                            </h3>
                            <PermissionGate resource="properties" action="edit">
                                <Link href="/units/create" className="text-sm font-bold text-blue-755 hover:text-blue-900 transition-colors inline-flex items-center gap-1.5">
                                    <PlusCircle className="w-4 h-4" /> Add Unit
                                </Link>
                            </PermissionGate>
                        </div>
                        {units.length > 0 ? (
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-gray-50/20">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 border-b border-gray-100 text-gray-800 font-extrabold uppercase tracking-wider">
                                                <th className="px-5 py-3.5">Unit Number</th>
                                                <th className="px-5 py-3.5">Type</th>
                                                <th className="px-5 py-3.5">Floor/Block</th>
                                                <th className="px-5 py-3.5 text-center">Status</th>
                                                <th className="px-5 py-3.5 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-900 bg-white">
                                            {units.map((unit: any) => (
                                                <tr key={unit._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-3.5 font-bold text-gray-950">
                                                        <Link href={`/units/${unit._id}`} className="hover:text-blue-750 transition-colors">
                                                            {unit.unitNumber}
                                                        </Link>
                                                    </td>
                                                    <td className="px-5 py-3.5 font-semibold text-gray-800">{unit.type || "N/A"}</td>
                                                    <td className="px-5 py-3.5 text-gray-700 font-medium">Floor {unit.floor || "-"} • {unit.block || "-"}</td>
                                                    <td className="px-5 py-3.5 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            unit.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                                            unit.status === 'Rented' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                                                            'bg-amber-50 text-amber-800 border border-amber-100'
                                                        }`}>
                                                            {unit.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-black text-blue-700">{formatCurrency(unit.price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100/40 p-6 rounded-xl border border-dashed border-gray-100 text-center">
                                {property.unit ? (
                                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                        <div className="p-3.5 bg-white rounded-lg border border-gray-100">
                                            <span className="text-xs text-gray-700 font-bold block mb-1">Unit</span>
                                            <span className="font-black text-gray-950 text-base">{property.unit}</span>
                                        </div>
                                        <div className="p-3.5 bg-white rounded-lg border border-gray-100">
                                            <span className="text-xs text-gray-700 font-bold block mb-1">Floor</span>
                                            <span className="font-black text-gray-950 text-base">{property.floor || "N/A"}</span>
                                        </div>
                                        <div className="p-3.5 bg-white rounded-lg border border-gray-100">
                                            <span className="text-xs text-gray-700 font-bold block mb-1">Block</span>
                                            <span className="font-black text-gray-950 text-base">{property.block || "N/A"}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 text-sm font-semibold italic">No child units associated with this master asset.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Features/Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-700" /> Amenities & Features
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {property.amenities.map((item: string) => (
                                    <div key={item} className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 font-semibold">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0 font-extrabold" />
                                        <span className="truncate">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Financial History Tabs */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-0">
                        <div className="border-b border-gray-100 bg-gray-50/50 p-4 pb-0">
                            <h3 className="text-lg font-black text-gray-950 flex items-center gap-2 mb-3">
                                <DollarSign className="w-5 h-5 text-blue-700" /> Financial Records
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('invoices')}
                                    className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                                        activeTab === 'invoices'
                                            ? 'text-blue-900 border-blue-700 bg-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-750 border-transparent'
                                    }`}
                                >
                                    Invoices ({payments.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                                        activeTab === 'history'
                                            ? 'text-blue-900 border-blue-700 bg-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-750 border-transparent'
                                    }`}
                                >
                                    Transaction Ledger
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            {/* Invoices Tab */}
                            {activeTab === 'invoices' && (
                                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-100 text-gray-700 font-extrabold uppercase">
                                            <tr>
                                                <th className="px-5 py-3.5 text-left">Invoice No</th>
                                                <th className="px-5 py-3.5 text-left">Billing Type</th>
                                                <th className="px-5 py-3.5 text-right">Total</th>
                                                <th className="px-5 py-3.5 text-right text-emerald-850">Received</th>
                                                <th className="px-5 py-3.5 text-right text-rose-700">Due</th>
                                                <th className="px-5 py-3.5 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100 text-gray-900">
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-5 py-12 text-center text-gray-600">
                                                        <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-35" />
                                                        <p className="font-bold text-sm">No invoice history found</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                payments.map((payment) => {
                                                    const dueAmount = payment.totalAmount - (payment.receivedAmount || 0);
                                                    return (
                                                        <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-5 py-3.5">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-950">{payment.invoiceNumber}</span>
                                                                    <span className="text-xs text-gray-500 font-medium">{new Date(payment.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3.5">
                                                                <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">
                                                                    {payment.paymentType}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-right font-black text-gray-950">{formatCurrency(payment.totalAmount)}</td>
                                                            <td className="px-5 py-3.5 text-right font-semibold text-emerald-800">{formatCurrency(payment.receivedAmount || 0)}</td>
                                                            <td className={`px-5 py-3.5 text-right font-black ${dueAmount > 0 ? 'text-rose-700' : 'text-gray-650'}`}>
                                                                {formatCurrency(dueAmount)}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.status)}`}>
                                                                    {payment.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {/* Ledger Tab */}
                            {activeTab === 'history' && (
                                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                                        <thead className="bg-gray-100 border-b border-gray-100 text-gray-800 font-extrabold uppercase">
                                            <tr>
                                                <th className="px-5 py-3.5 text-left">Date</th>
                                                <th className="px-5 py-3.5 text-left">Reference</th>
                                                <th className="px-5 py-3.5 text-left">Details</th>
                                                <th className="px-5 py-3.5 text-left">Method</th>
                                                <th className="px-5 py-3.5 text-right">Amount</th>
                                                <th className="px-5 py-3.5 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100 text-gray-900 font-medium">
                                            {(() => {
                                                const allTxns: any[] = [];
                                                deposits.forEach(d => {
                                                    allTxns.push({
                                                        _id: d._id,
                                                        date: d.createdAt,
                                                        amount: d.receivedAmount || d.amount,
                                                        type: d.type || 'Deposit',
                                                        description: `Deposit collected`,
                                                        method: d.paymentMethod,
                                                        reference: d.receiptNumber,
                                                        status: d.status,
                                                        isInvoice: false
                                                    });
                                                });
                                                payments.forEach(p => {
                                                    if (p.depositHistory && p.depositHistory.length > 0) {
                                                        p.depositHistory.forEach((h: any, idx: number) => {
                                                            allTxns.push({
                                                                _id: `${p._id}_${idx}`,
                                                                date: h.date,
                                                                amount: h.amount,
                                                                type: 'Payment',
                                                                description: `Invoice: ${p.invoiceNumber}`,
                                                                method: h.method || p.paymentMethod,
                                                                reference: p.invoiceNumber,
                                                                status: 'Completed',
                                                                isInvoice: true
                                                            });
                                                        });
                                                    } else if ((p.receivedAmount || 0) > 0) {
                                                        allTxns.push({
                                                            _id: `${p._id}_legacy`,
                                                            date: p.createdAt,
                                                            amount: p.receivedAmount,
                                                            type: 'Payment',
                                                            description: `Invoice: ${p.invoiceNumber}`,
                                                            method: p.paymentMethod,
                                                            reference: p.invoiceNumber,
                                                            status: 'Completed',
                                                            isInvoice: true
                                                        });
                                                    }
                                                });
                                                const sorted = allTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                                                if (sorted.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                                                                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-35" />
                                                                <p className="font-bold text-sm">No transactions recorded</p>
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return sorted.map(txn => (
                                                    <tr key={txn._id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-3.5 text-gray-800 font-bold">{new Date(txn.date).toLocaleDateString()}</td>
                                                        <td className="px-5 py-3.5 font-mono font-bold text-gray-950">{txn.reference}</td>
                                                        <td className="px-5 py-3.5 font-bold text-gray-950">
                                                            <span>{txn.description}</span>
                                                            <span className="text-xs block text-gray-500 font-bold uppercase mt-1">{txn.type}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-gray-800 font-bold">{txn.method}</td>
                                                        <td className="px-5 py-3.5 text-right font-black text-gray-955">{formatCurrency(txn.amount)}</td>
                                                        <td className="px-5 py-3.5 text-center">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(txn.status)}`}>
                                                                {txn.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Sidebar Controls & Management */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Metadata & Quick Info */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-gray-700">Asset Identifiers</h4>
                        <div className="space-y-2.5 text-sm text-gray-800">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <span className="text-gray-600 font-semibold">Asset ID</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-gray-950">{property._id.toUpperCase()}</span>
                                    <button onClick={copyPropertyId} className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-800 transition-all">
                                        {copiedId ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <span className="text-gray-600 font-semibold">Ownership Asset</span>
                                <span className="font-bold text-gray-950">{property.owner?.name || "Corporate Owned"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-semibold">System Onboarding</span>
                                <span className="font-bold text-gray-950">{new Date(property.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Agent / Owner Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700">Asset Representation</h4>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-base shadow-inner">
                                    {property.agent?.name?.charAt(0) || property.owner?.name?.charAt(0) || "M"}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-950 truncate">{property.agent?.name || "Corporate Management"}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{property.agent ? "Assigned Agent" : "Property Manager"}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-800 font-semibold pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-550 shrink-0" />
                                    <span className="truncate">{property.agent?.email || property.owner?.email || "contact@savemax.ro"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-550 shrink-0" />
                                    <span>{property.agent?.phone || property.owner?.phone || "+1 (555) 019-9000"}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <a 
                                    href={`tel:${property.agent?.phone || property.owner?.phone || ""}`}
                                    className="inline-flex items-center justify-center gap-1.5 py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-all shadow-sm"
                                >
                                    <Phone className="w-3.5 h-3.5 text-gray-500" /> Call
                                </a>
                                <a 
                                    href={`mailto:${property.agent?.email || property.owner?.email || ""}`}
                                    className="inline-flex items-center justify-center gap-1.5 py-2 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl text-xs font-bold text-blue-700 transition-all shadow-sm"
                                >
                                    <Mail className="w-3.5 h-3.5 text-blue-500" /> Email
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Recent Inquiries Widget */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-blue-700" /> Recent Inquiries
                            </h4>
                            <Link href="/inquiries" className="text-xs font-bold text-blue-750 uppercase hover:underline">All Inquiries</Link>
                        </div>
                        <div className="p-0">
                            {inquiries.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {inquiries.slice(0, 3).map((inquiry) => (
                                        <div key={inquiry._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-1.5 gap-2">
                                                <p className="text-sm font-bold text-gray-955 truncate">{inquiry.name}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    inquiry.status === 'New' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {inquiry.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-800 line-clamp-2 leading-relaxed mb-2.5 font-medium">{inquiry.message}</p>
                                            <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
                                                <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                                <div className="flex gap-2">
                                                    <a href={`tel:${inquiry.phone}`} className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-700"><Phone className="w-3.5 h-3.5" /></a>
                                                    <a href={`mailto:${inquiry.email}`} className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-700"><Mail className="w-3.5 h-3.5" /></a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center">
                                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 font-semibold">No active inquiries</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Maintenance Ticket Widget */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                <Wrench className="w-4 h-4 text-amber-700" /> Maintenance Logs
                            </h4>
                            <Link href="/maintenance" className="text-xs font-bold text-blue-755 uppercase hover:underline">Manage Logs</Link>
                        </div>
                        <div className="p-0">
                            {maintenanceRequests.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {maintenanceRequests.slice(0, 3).map((req) => (
                                        <div key={req._id} className="p-4 hover:bg-gray-50/50 transition-colors space-y-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-sm font-bold text-gray-955 line-clamp-1">{req.title}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    req.priority === 'High' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                                                }`}>
                                                    {req.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className={`font-bold ${
                                                    req.status === 'Resolved' ? 'text-emerald-700' : 'text-amber-700'
                                                }`}>
                                                    {req.status}
                                                </span>
                                                <span className="text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center">
                                    <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-xs text-gray-650 font-semibold">No active tickets</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="bg-blue-950 p-5 rounded-2xl shadow-lg shadow-blue-955/20 text-white space-y-4">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-2.5 text-center text-[10px] font-bold uppercase tracking-wider">
                            <Link 
                                href={`/payments/record?propertyId=${property._id}`}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 flex flex-col items-center gap-1.5"
                            >
                                <DollarSign className="w-4 h-4 text-blue-300" />
                                <span>Add Payment</span>
                            </Link>
                            <Link 
                                href={`/inquiries?propertyId=${property._id}`}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/5 flex flex-col items-center gap-1.5"
                            >
                                <MessageSquare className="w-4 h-4 text-blue-300" />
                                <span>New Inquiry</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox / Media Viewer */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md transition-all">
                    <button 
                        onClick={() => setSelectedImageIndex(null)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    {images.length > 1 && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(prev => (prev === null || prev === 0 ? images.length - 1 : prev - 1));
                            }}
                            className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Previous"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    <div className="max-w-5xl max-h-[80vh] px-4 flex flex-col items-center justify-center">
                        <img 
                            src={images[selectedImageIndex]?.url || defaultImage} 
                            alt={`Property Image ${selectedImageIndex + 1}`}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                        />
                        <p className="text-center text-white/60 text-xs mt-4 font-medium uppercase tracking-widest">
                            Image {selectedImageIndex + 1} of {images.length}
                        </p>
                    </div>

                    {images.length > 1 && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(prev => (prev === null || prev === images.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Next"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
