
"use client";

import { useState, useEffect } from "react";
import {
    Users, Search, Filter, Home, DollarSign, TrendingUp,
    MoreVertical, Mail, Phone, Plus, UserCircle,
    ChevronLeft, ChevronRight, Edit, Trash2, Building2,
    User, Briefcase, FileText
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import Modal from "@/components/dashboard/Modal";
import FormInput, { FormButton, FormSelect } from "@/components/dashboard/FormInput";

interface Owner {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    propertiesCount: number;
    ownerDetails?: {
        companyName?: string;
        taxId?: string;
    };
    role?: any;
    createdAt: string;
}

export default function OwnersPage() {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const [globalStats, setGlobalStats] = useState<any>({ totalOwners: 0, totalProperties: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [roles, setRoles] = useState<{ value: string, label: string }[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (activeDropdown && !(event.target as Element).closest('.dropdown-trigger')) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeDropdown]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        status: "Active",
        role: "",
        password: "",
        ownerDetails: {
            companyName: "",
            taxId: ""
        }
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchOwners();
    }, [search, page]);

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/roles?limit=100");
            const data = await res.json();
            if (data.success) {
                const mappedRoles = data.data
                    .map((r: any) => ({ value: r._id, label: r.name }))
                    .filter((r: any) => r.label === 'Owner');
                setRoles(mappedRoles);

                // If modal is open and in create mode with no role, set default
                if (isModalOpen && !editingOwner && !formData.role) {
                    const ownerRole = mappedRoles.find((r: any) => r.label === 'Owner');
                    if (ownerRole) {
                        setFormData(prev => ({ ...prev, role: ownerRole.value }));
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search
            });
            const res = await fetch(`/api/owners?${query}`);
            const data = await res.json();
            if (data.success) {
                setOwners(data.data);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching owners:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (owner: any | null = null) => {
        if (owner) {
            setEditingOwner(owner);
            setFormData({
                name: owner.name || "",
                email: owner.email || "",
                password: "",
                phone: owner.phone || "",
                status: owner.status || "Active",
                role: owner.role?._id || owner.role || "",
                ownerDetails: {
                    companyName: owner.ownerDetails?.companyName || "",
                    taxId: owner.ownerDetails?.taxId || ""
                }
            });
        } else {
            setEditingOwner(null);
            const ownerRole = roles.find(r => r.label === 'Owner');
            setFormData({
                name: "",
                email: "",
                phone: "",
                status: "Active",
                role: ownerRole?.value || "",
                password: "",
                ownerDetails: {
                    companyName: "",
                    taxId: ""
                }
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOwner(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData };



            const url = editingOwner ? `/api/owners/${editingOwner._id}` : "/api/owners";
            const res = await fetch(url, {
                method: editingOwner ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                fetchOwners();
                closeModal();
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving owner:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this owner?")) return;
        try {
            const res = await fetch(`/api/owners/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchOwners();
        } catch (error) {
            console.error("Error deleting owner:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Property Owners</h1>
                        <p className="text-sm text-gray-500">Manage individuals and companies owning properties</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PermissionGate resource="owners" action="create">
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Owner
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Total Owners", value: globalStats.totalOwners, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Total Properties", value: globalStats.totalProperties, icon: Home, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Corporate Owners", value: owners.filter(o => o.ownerDetails?.companyName).length, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-lg`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
                    {/* Filters Bar */}
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name, company or tax ID..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setSearch(""); setPage(1); }}
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm px-2"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner / Entity</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Portfolio</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && owners.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : owners.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No owners found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    owners.map((owner) => (
                                        <tr key={owner._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-50 rounded-lg">
                                                        <Building2 className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900">{owner.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            {owner.ownerDetails?.companyName && (
                                                                <div className="text-[10px] text-purple-600 font-medium uppercase">{owner.ownerDetails.companyName}</div>
                                                            )}
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-bold border border-purple-100 uppercase">
                                                                {typeof owner.role === 'object' ? owner.role?.name : 'Owner'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                                    <Home className="w-4 h-4 text-gray-400" />
                                                    {owner.propertiesCount} Properties
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        {owner.email}
                                                    </div>
                                                    {owner.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            {owner.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${owner.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                                    }`}>
                                                    {owner.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="relative flex justify-end dropdown-trigger">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === owner._id ? null : owner._id)}
                                                        className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {activeDropdown === owner._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <PermissionGate resource="owners" action="edit">
                                                                <button
                                                                    onClick={() => {
                                                                        openModal(owner);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Edit Details
                                                                </button>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="owners" action="delete">
                                                                <button
                                                                    onClick={() => {
                                                                        handleDelete(owner._id);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete Owner
                                                                </button>
                                                            </PermissionGate>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{owners.length}</span> of <span className="text-gray-900">{pagination.total}</span> owners
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (pagination.pages > 5) {
                                        if (page > 3) pageNum = page - 2 + i;
                                        if (page > pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${page === pageNum
                                                ? "bg-blue-900 text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page >= pagination.pages}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Owner Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingOwner ? "Edit Owner Info" : "Register New Owner"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl space-y-4 text-black">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-900" />
                            Identity Details
                        </h4>
                        <FormInput
                            label="Full Name / Representative"
                            required
                            value={formData.name}
                            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Email address"
                                type="email"
                                required
                                disabled={!!editingOwner}
                                value={formData.email}
                                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <FormInput
                                label="Contact Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                    </div>

                    <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100/50 space-y-4 text-black">
                        <h4 className="text-xs font-bold text-purple-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Business Information (Optional)
                        </h4>
                        <FormInput
                            label="Company / Entity Name"
                            value={formData.ownerDetails.companyName}
                            onChange={(e: any) => setFormData({
                                ...formData,
                                ownerDetails: { ...formData.ownerDetails, companyName: e.target.value }
                            })}
                            placeholder="Real Estate Holdings Ltd."
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="Tax / registration ID"
                                value={formData.ownerDetails.taxId}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    ownerDetails: { ...formData.ownerDetails, taxId: e.target.value }
                                })}
                            />
                            <FormSelect
                                label="Status"
                                value={formData.status}
                                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Inactive', label: 'Inactive' }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium">Cancel</button>
                        <FormButton type="submit" loading={submitting} className="!w-auto px-8 !bg-blue-900 shadow-sm">
                            {editingOwner ? "Save Changes" : "Register Owner"}
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
