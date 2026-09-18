/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import {
    Sparkles, Search, Plus, MoreVertical, Edit, Trash2, 
    ChevronLeft, ChevronRight, X, CheckCircle2, Shield
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import Modal from "@/components/dashboard/Modal";
import FormInput, { FormButton, FormSelect } from "@/components/dashboard/FormInput";

interface Amenity {
    _id: string;
    name: string;
    icon?: string;
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export default function AmenitiesPage() {
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        icon: "",
        status: "Active"
    });

    useEffect(() => {
        fetchAmenities();
    }, [search]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (activeDropdown && !(event.target as Element).closest('.dropdown-trigger')) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeDropdown]);

    const fetchAmenities = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ search });
            const res = await fetch(`/api/amenities?${query}`);
            const data = await res.json();
            if (data.success) {
                setAmenities(data.data);
            }
        } catch (error) {
            console.error("Error fetching amenities:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (amenity: Amenity | null = null) => {
        if (amenity) {
            setEditingAmenity(amenity);
            setFormData({
                name: amenity.name,
                icon: amenity.icon || "",
                status: amenity.status
            });
        } else {
            setEditingAmenity(null);
            setFormData({
                name: "",
                icon: "",
                status: "Active"
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAmenity(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingAmenity ? `/api/amenities/${editingAmenity._id}` : "/api/amenities";
            const res = await fetch(url, {
                method: editingAmenity ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                fetchAmenities();
                closeModal();
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving amenity:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this amenity?")) return;
        try {
            const res = await fetch(`/api/amenities/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchAmenities();
        } catch (error) {
            console.error("Error deleting amenity:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Amenities Management</h1>
                        <p className="text-sm text-gray-500">Manage common features and facilities for properties</p>
                    </div>
                    <PermissionGate resource="amenities" action="create">
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Amenity
                        </button>
                    </PermissionGate>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amenities</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{amenities.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Sparkles className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{amenities.filter(a => a.status === 'Active').length}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disabled</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{amenities.filter(a => a.status === 'Inactive').length}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            <X className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search amenities..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : amenities.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No amenities found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    amenities.map((amenity) => (
                                        <tr key={amenity._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                                                {amenity.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(amenity.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    amenity.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                                }`}>
                                                    {amenity.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="relative flex justify-end dropdown-trigger">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === amenity._id ? null : amenity._id)}
                                                        className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                    {activeDropdown === amenity._id && (
                                                        <div className="absolute right-0 mt-10 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <PermissionGate resource="amenities" action="edit">
                                                                <button
                                                                    onClick={() => { openModal(amenity); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Edit
                                                                </button>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="amenities" action="delete">
                                                                <button
                                                                    onClick={() => { handleDelete(amenity._id); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
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
                </div>
            </div>

            {/* Amenity Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAmenity ? "Edit Amenity" : "Add New Amenity"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormInput
                        label="Amenity Name"
                        required
                        value={formData.name}
                        onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Swimming Pool, Gym, WiFi"
                    />
                    <FormSelect
                        label="Status"
                        value={formData.status}
                        onChange={(e: any) => setFormData({ ...formData, status: e.target.value as any })}
                        options={[
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' }
                        ]}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <FormButton type="submit" loading={submitting} className="!w-auto px-8 !bg-blue-900 shadow-sm">
                            {editingAmenity ? "Update" : "Save"}
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
