/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Search, Filter, MoreVertical, Mail, Phone, Plus,
    ChevronLeft, ChevronRight, Edit, Trash2, Home, CheckCircle2,
    Clock, XCircle, User, AlertCircle
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import Modal from "@/components/dashboard/Modal";
import FormInput, { FormButton, FormSelect, FormTextArea } from "@/components/dashboard/FormInput";

import { useSession } from "next-auth/react";

interface Inquiry {
    _id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'New' | 'Follow-up' | 'Contacted' | 'Closed' | 'Junk';
    property: {
        _id: string;
        title: string;
        price: number;
    };
    unit?: {
        _id: string;
        unitNumber: string;
        block?: string;
    };
    agent?: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export default function InquiriesPage() {
    const { data: session }: any = useSession();
    const isCustomer = session?.user?.role === "Customer";

    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [properties, setProperties] = useState<{ value: string, label: string }[]>([]);
    const [units, setUnits] = useState<{ value: string, label: string }[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        property: "",
        unit: "",
        status: "New"
    });

    const [customers, setCustomers] = useState<{ value: string, label: string, name: string, email: string, phone: string }[]>([]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (activeDropdown && !(event.target as Element).closest('.dropdown-trigger')) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeDropdown]);

    useEffect(() => {
        fetchInquiries();
    }, [search, page]);

    useEffect(() => {
        fetchProperties();
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (formData.property) {
            fetchUnits(formData.property);
        } else {
            setUnits([]);
            setFormData(prev => ({ ...prev, unit: "" }));
        }
    }, [formData.property]);

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/customers?limit=1000");
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data.map((c: any) => ({
                    value: c._id,
                    label: `${c.name} (${c.phone || (c.email ? c.email.split('@')[0] : 'No contact')})`,
                    name: c.name,
                    email: c.email || "",
                    phone: c.phone || ""
                })));
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const fetchUnits = async (propertyId: string) => {
        try {
            const res = await fetch(`/api/units?propertyId=${propertyId}&limit=100`);
            const data = await res.json();
            if (data.success) {
                setUnits(data.data.map((u: any) => ({
                    value: u._id,
                    label: `${u.unitNumber} ${u.block ? `(${u.block})` : ''}`
                })));
            }
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/properties?limit=100");
            const data = await res.json();
            if (data.success) {
                setProperties(data.data.map((p: any) => ({ value: p._id, label: p.title })));
            }
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    };

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search
            });
            const res = await fetch(`/api/inquiries?${query}`);
            const data = await res.json();
            if (data.success) {
                setInquiries(data.data);
                // Note: API currently doesn't return pagination for inquiries, setting defaults
                setPagination({ total: data.data.length, page: 1, limit: 10, pages: 1 });
            }
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (inquiry: Inquiry | null = null) => {
        if (inquiry) {
            setEditingInquiry(inquiry);
            setFormData({
                name: inquiry.name,
                email: inquiry.email,
                phone: inquiry.phone,
                message: inquiry.message,
                property: inquiry.property?._id || "",
                unit: inquiry.unit?._id || "",
                status: inquiry.status
            });
        } else {
            setEditingInquiry(null);
            setFormData({
                name: isCustomer ? (session?.user?.name || "") : "",
                email: isCustomer ? (session?.user?.email || "") : "",
                phone: isCustomer ? (session?.user?.phone || "") : "",
                message: "",
                property: "",
                unit: "",
                status: "New"
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInquiry(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingInquiry ? `/api/inquiries/${editingInquiry._id}` : "/api/inquiries";
            const res = await fetch(url, {
                method: editingInquiry ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                fetchInquiries();
                closeModal();
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving inquiry:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this inquiry?")) return;
        try {
            const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchInquiries();
        } catch (error) {
            console.error("Error deleting inquiry:", error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'New': return <div className="p-1 px-2 rounded-full border border-blue-100 bg-blue-50 text-blue-600 flex items-center gap-1"><Clock className="w-3 h-3" /> <span className="text-[10px] font-bold">NEW</span></div>;
            case 'Contacted': return <div className="p-1 px-2 rounded-full border border-green-100 bg-green-50 text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> <span className="text-[10px] font-bold">CONTACTED</span></div>;
            case 'Follow-up': return <div className="p-1 px-2 rounded-full border border-amber-100 bg-amber-50 text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> <span className="text-[10px] font-bold">FOLLOW UP</span></div>;
            case 'Closed': return <div className="p-1 px-2 rounded-full border border-gray-100 bg-gray-50 text-gray-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> <span className="text-[10px] font-bold">CLOSED</span></div>;
            case 'Junk': return <div className="p-1 px-2 rounded-full border border-red-100 bg-red-50 text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> <span className="text-[10px] font-bold">JUNK</span></div>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Property Inquiries</h1>
                        <p className="text-sm text-gray-500">Track and manage potential client leads</p>
                    </div>
                    <PermissionGate resource="inquiries" action="create">
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Inquiry
                        </button>
                    </PermissionGate>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-black">
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 border-b border-gray-200">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search client name, email..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <span className="text-gray-900">{inquiries.length}</span> Total Inquiries
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && inquiries.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : inquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No inquiries found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    inquiries.map((inquiry) => (
                                        <tr key={inquiry._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                        {inquiry.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{inquiry.name}</p>
                                                        <p className="text-[10px] text-gray-500">{inquiry.email}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{inquiry.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Home className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[150px]">{inquiry.property?.title || "Property"}</p>
                                                        <p className="text-[10px] font-bold text-blue-900">${inquiry.property?.price?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-gray-600 line-clamp-2 max-w-sm italic">"{inquiry.message}"</p>
                                                <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tight">Recieved: {new Date(inquiry.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    {getStatusIcon(inquiry.status)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="relative flex justify-end dropdown-trigger">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === inquiry._id ? null : inquiry._id)}
                                                        className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {activeDropdown === inquiry._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <PermissionGate resource="inquiries" action="edit">
                                                                <button
                                                                    onClick={() => { openModal(inquiry); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Update Status
                                                                </button>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="inquiries" action="delete">
                                                                <button
                                                                    onClick={() => { handleDelete(inquiry._id); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Remove
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
                            Showing <span className="text-gray-900">{inquiries.length}</span> of <span className="text-gray-900">{pagination.total}</span> inquiries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all font-bold"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-gray-400 px-2 uppercase tracking-widest">Page {page} of {pagination.pages || 1}</span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page >= pagination.pages}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all font-bold"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingInquiry ? "Update Inquiry Status" : "New Property Inquiry"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isCustomer && (
                        <div className="bg-gray-50 p-6 rounded-xl space-y-4 text-black">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-900" />
                                Contact Information
                            </h4>
                            <FormSelect
                                label="Select Customer"
                                required
                                options={customers}
                                value={customers.find(c => c.name === formData.name)?.value || ""}
                                onChange={(e: any) => {
                                    const selected = customers.find(c => c.value === e.target.value);
                                    if (selected) {
                                        setFormData({
                                            ...formData,
                                            name: selected.name || "",
                                            email: selected.email || "",
                                            phone: selected.phone || ""
                                        });
                                    }
                                }}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Email"
                                    type="email"
                                    required
                                    readOnly
                                    value={formData.email}
                                    onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <FormInput
                                    label="Phone"
                                    required
                                    readOnly
                                    value={formData.phone}
                                    onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 space-y-4 text-black">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Inquiry Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect
                                label="Interested Property"
                                required
                                options={properties}
                                value={formData.property}
                                onChange={(e: any) => setFormData({ ...formData, property: e.target.value, unit: "" })}
                            />
                            <FormSelect
                                label="Unit (Optional)"
                                options={units}
                                value={formData.unit}
                                onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                                disabled={!formData.property}
                            />
                            <FormSelect
                                label="Current Status"
                                required
                                value={formData.status}
                                options={[
                                    { value: 'New', label: 'New Lead' },
                                    { value: 'Contacted', label: 'Contacted' },
                                    { value: 'Follow-up', label: 'Follow Up Required' },
                                    { value: 'Closed', label: 'Closed' },
                                    { value: 'Junk', label: 'Junk/Not Interested' }
                                ]}
                                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                            />
                        </div>
                        <FormTextArea
                            label="Client Message/Requirements"
                            required
                            rows={4}
                            value={formData.message}
                            onChange={(e: any) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="What is the client looking for?"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium">Cancel</button>
                        <FormButton type="submit" loading={submitting} className="!w-auto px-8 !bg-blue-900 shadow-sm">
                            {editingInquiry ? "Save Changes" : "Create Inquiry"}
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

