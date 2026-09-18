/* Developed by RUDRA via NEKLLM */
"use client";
import { useState, useEffect } from "react";
import {
    Plus, Search, Filter, Home, DollarSign, TrendingUp,
    MoreVertical, Mail, Phone, UserCircle,
    ChevronLeft, ChevronRight, Edit, Trash2, Building2,
    User, Briefcase, FileText, Wrench, Clock, CheckCircle2,
    XCircle, AlertTriangle
} from "lucide-react";
import Select from "react-select";
import PermissionGate from "@/components/PermissionGate";
import Modal from "@/components/dashboard/Modal";
import FormInput, { FormButton, FormSelect, FormTextArea } from "@/components/dashboard/FormInput";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useSession } from "next-auth/react";

export default function MaintenancePage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [selectedPriority, setSelectedPriority] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<any>(null);
    const [customers, setCustomers] = useState<{ value: string, label: string }[]>([]);
    const [agents, setAgents] = useState<{ value: string, label: string }[]>([]);
    const { formatCurrency } = useSettings();
    const { data: session }: any = useSession();
    const isCustomer = session?.user?.role === "Customer";

    const [formData, setFormData] = useState({
        property: "",
        unit: "",
        title: "",
        description: "",
        type: "Repair",
        priority: "Medium",
        status: "Pending",
        cost: "",
        scheduledDate: "",
        requestedBy: "",
        assignedTo: ""
    });

    useEffect(() => {
        fetchProperties();
        fetchCustomers();
        fetchAgents();
    }, []);

    useEffect(() => {
        if (formData.property) {
            fetchUnits(formData.property);
        } else {
            setUnits([]);
        }
    }, [formData.property]);

    useEffect(() => {
        fetchRequests();
    }, [search, page, selectedProperty, selectedPriority, selectedStatus]);

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
    
    const fetchAgents = async () => {
        try {
            const res = await fetch("/api/agents?limit=100");
            const data = await res.json();
            if (data.success) {
                // agents API returns stats wrapper, data is in .data
                const agentsList = Array.isArray(data.data) ? data.data : [];
                let mappedAgents = agentsList.map((a: any) => ({
                    value: a._id,
                    label: a.name
                }));

                // If logged in as agent, only show self in the list
                if (session?.user?.role === "Agent") {
                    mappedAgents = mappedAgents.filter((a: any) => a.value === session.user.id);
                }

                setAgents(mappedAgents);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/customers?limit=1000");
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data.map((c: any) => ({
                    value: c._id,
                    label: `${c.name} (${c.phone || c.email || 'No contact'})`
                })));
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const fetchUnits = async (propertyId: string) => {
        try {
            // Use the existing /api/units endpoint filtered by propertyId
            const query = new URLSearchParams({
                propertyId,
                limit: "100"
            });
            const res = await fetch(`/api/units?${query.toString()}`);
            const data = await res.json();
            if (data.success) {
                setUnits(
                    data.data.map((u: any) => ({
                        value: u._id,
                        label: `Unit ${u.unitNumber}${u.block ? ` - ${u.block}` : ""}`
                    }))
                );
            } else {
                setUnits([]);
            }
        } catch (error) {
            console.error("Error fetching units:", error);
            setUnits([]);
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'Emergency': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'High': return <Clock className="w-4 h-4 text-orange-600" />;
            case 'Medium': return <Clock className="w-4 h-4 text-blue-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search,
                ...(selectedProperty && { property: selectedProperty.value }),
                ...(selectedPriority && { priority: selectedPriority.value }),
                ...(selectedStatus && { status: selectedStatus.value })
            });
            const res = await fetch(`/api/maintenance?${query}`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
                setPagination(data.pagination || { total: data.data.length, page: 1, limit: 10, pages: 1 });
            }
        } catch (error) {
            console.error("Error fetching maintenance requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (request: any = null) => {
        if (request) {
            setEditingRequest(request);
            setFormData({
                property: request.property?._id || request.property || "",
                unit: request.unit?._id || request.unit || "",
                title: request.title || "",
                description: request.description || "",
                type: request.type || "Repair",
                priority: request.priority || "Medium",
                status: request.status || "Pending",
                cost: request.cost?.toString() || "",
                scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : "",
                requestedBy: request.requestedBy?._id || request.requestedBy || "",
                assignedTo: request.assignedTo?._id || request.assignedTo || ""
            });
        } else {
            setEditingRequest(null);
            setFormData({
                property: "",
                unit: "",
                title: "",
                description: "",
                type: "Repair",
                priority: "Medium",
                status: "Pending",
                cost: "",
                scheduledDate: "",
                requestedBy: isCustomer ? (session?.user?.id || "") : "",
                assignedTo: session?.user?.role === "Agent" ? (session?.user?.id || "") : ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRequest(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingRequest ? `/api/maintenance/${editingRequest._id}` : "/api/maintenance";
            const res = await fetch(url, {
                method: editingRequest ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                fetchRequests();
                closeModal();
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving maintenance request:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this request?")) return;
        try {
            const res = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchRequests();
        } catch (error) {
            console.error("Error deleting maintenance request:", error);
        }
    };

    const selectStyles = {
        control: (base: any) => ({
            ...base,
            borderColor: '#e5e7eb',
            borderRadius: '0.5rem',
            padding: '2px',
            fontSize: '14px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#1e3a8a'
            }
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected ? '#1e3a8a' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            fontSize: '14px',
            cursor: 'pointer'
        })
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
                        <p className="text-sm text-gray-500">Track and manage property maintenance and repairs</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PermissionGate resource="maintenance" action="create">
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Request
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Total Requests", value: pagination.total, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Pending", value: requests.filter((r: any) => r.status === 'Pending').length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
                        { label: "In Progress", value: requests.filter((r: any) => r.status === 'In Progress').length, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "High Priority", value: requests.filter((r: any) => r.priority === 'High' || r.priority === 'Emergency').length, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
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
                    <div className="p-4 border-b border-gray-200 flex flex-col xl:flex-row gap-4 items-center justify-between bg-gray-50/50">
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div className="w-full md:w-48">
                                <Select
                                    placeholder="Property"
                                    options={properties}
                                    value={selectedProperty}
                                    onChange={setSelectedProperty}
                                    styles={selectStyles}
                                    isClearable
                                />
                            </div>

                            <div className="w-full md:w-40">
                                <Select
                                    placeholder="Priority"
                                    options={[
                                        { value: 'Low', label: 'Low' },
                                        { value: 'Medium', label: 'Medium' },
                                        { value: 'High', label: 'High' },
                                        { value: 'Emergency', label: 'Emergency' }
                                    ]}
                                    value={selectedPriority}
                                    onChange={setSelectedPriority}
                                    styles={selectStyles}
                                    isClearable
                                />
                            </div>

                            <div className="w-full md:w-40">
                                <Select
                                    placeholder="Status"
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'In Progress', label: 'In Progress' },
                                        { value: 'Completed', label: 'Completed' },
                                        { value: 'Cancelled', label: 'Cancelled' }
                                    ]}
                                    value={selectedStatus}
                                    onChange={setSelectedStatus}
                                    styles={selectStyles}
                                    isClearable
                                />
                            </div>

                            {(selectedProperty || selectedPriority || selectedStatus || search) && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setSelectedProperty(null);
                                        setSelectedPriority(null);
                                        setSelectedStatus(null);
                                        setPage(1);
                                    }}
                                    className="text-gray-500 hover:text-red-600 font-medium text-sm px-2 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                            Showing <span className="text-gray-900">{requests.length}</span> Requests
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client/Requester</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && requests.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4 text-center"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg">No maintenance requests found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-gray-900">{request.title}</span>
                                                    <span className="text-xs text-gray-500 line-clamp-1">{request.description}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">
                                                            {request.type}
                                                        </span>
                                                        {request.cost && (
                                                            <span className="text-[10px] text-green-600 font-bold flex items-center">
                                                                {formatCurrency(request.cost)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Home className="w-4 h-4 text-gray-400" />
                                                    {request.property?.title}
                                                </div>
                                                {request.unit && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-6">
                                                        <Building2 className="w-3 h-3" />
                                                        Unit {request.unit.unitNumber}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="w-4 h-4 text-blue-900" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">{request.requestedBy?.name || "System/Admin"}</span>
                                                        <span className="text-[10px] text-gray-500">{request.requestedBy?.email || "No contact"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-semibold">
                                                    {getPriorityIcon(request.priority)}
                                                    <span className={
                                                        request.priority === 'Emergency' ? 'text-red-600' :
                                                            request.priority === 'High' ? 'text-orange-600' :
                                                                'text-gray-600'
                                                    }>{request.priority}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative flex justify-end dropdown-trigger">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === request._id ? null : request._id)}
                                                        className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {activeDropdown === request._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left text-black">
                                                            <PermissionGate resource="maintenance" action="edit">
                                                                <button
                                                                    onClick={() => { openModal(request); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Edit Request
                                                                </button>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="maintenance" action="delete">
                                                                <button
                                                                    onClick={() => { handleDelete(request._id); setActiveDropdown(null); }}
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

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{requests.length}</span> of <span className="text-gray-900">{pagination.total}</span> requests
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

                <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRequest ? "Update Maintenance Request" : "New Maintenance Request"}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl space-y-4 text-black">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Home className="w-4 h-4 text-blue-900" />
                                Property Details
                            </h4>
                            <FormSelect
                                label="Property"
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
                            {!isCustomer && (
                                <FormSelect
                                    label="Requested By (Customer - Optional)"
                                    options={customers}
                                    value={formData.requestedBy}
                                    onChange={(e: any) => setFormData({ ...formData, requestedBy: e.target.value })}
                                />
                            )}
                        </div>

                        <div className="bg-white p-2 rounded-xl space-y-4 text-black">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Title"
                                    required
                                    value={formData.title}
                                    onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="E.g. Leaking faucet"
                                />
                                <FormSelect
                                    label="Type"
                                    required
                                    value={formData.type}
                                    options={[
                                        { value: 'Repair', label: 'Repair' },
                                        { value: 'Routine', label: 'Routine Maintenance' },
                                        { value: 'Emergency', label: 'Emergency' },
                                        { value: 'Inspection', label: 'Inspection' }
                                    ]}
                                    onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                                />
                            </div>
                            <FormTextArea
                                label="Description"
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the issue in detail..."
                            />
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 space-y-4 text-black">
                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Status & Priority
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormSelect
                                    label="Priority"
                                    required
                                    value={formData.priority}
                                    options={[
                                        { value: 'Low', label: 'Low' },
                                        { value: 'Medium', label: 'Medium' },
                                        { value: 'High', label: 'High' },
                                        { value: 'Emergency', label: 'Emergency' }
                                    ]}
                                    onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
                                />
                                <FormSelect
                                    label="Current Status"
                                    required
                                    value={formData.status}
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'In Progress', label: 'In Progress' },
                                        { value: 'Completed', label: 'Completed' },
                                        { value: 'Cancelled', label: 'Cancelled' }
                                    ]}
                                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Estimated Cost"
                                    type="number"
                                    value={formData.cost}
                                    onChange={(e: any) => setFormData({ ...formData, cost: e.target.value })}
                                    placeholder="0.00"
                                />
                                <FormInput
                                    label="Scheduled Date"
                                    type="date"
                                    value={formData.scheduledDate}
                                    onChange={(e: any) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                />
                            </div>
                            {!isCustomer && (
                                <FormSelect
                                    label="Assigned Agent (Optional)"
                                    options={agents}
                                    value={formData.assignedTo}
                                    onChange={(e: any) => setFormData({ ...formData, assignedTo: e.target.value })}
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium">Cancel</button>
                            <FormButton type="submit" loading={submitting} className="!w-auto px-8 !bg-blue-900 shadow-sm">
                                {editingRequest ? "Save Changes" : "Create Request"}
                            </FormButton>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
