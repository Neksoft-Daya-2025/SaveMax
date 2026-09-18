/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import {
    Calendar, Search, Filter, MoreVertical, Plus,
    ChevronLeft, ChevronRight, Edit, Trash2, Home, CheckCircle2,
    Clock, XCircle, User, AlertCircle, MapPin, Phone, Mail
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import Modal from "@/components/dashboard/Modal";
import FormInput, { FormButton, FormSelect, FormTextArea } from "@/components/dashboard/FormInput";

import { useSession } from "next-auth/react";

interface Booking {
    _id: string;
    property: {
        _id: string;
        title: string;
        price: number;
        location?: { address: string; city: string };
    };
    unit?: {
        _id: string;
        unitNumber: string;
        block?: string;
    };
    customer: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    agent?: {
        _id: string;
        name: string;
    };
    visitDate: string;
    visitTime: string;
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show';
    message?: string;
    adminNotes?: string;
    createdAt: string;
}

export default function BookingsPage() {
    const { data: session }: any = useSession();
    const isCustomer = session?.user?.role === "Customer";

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [properties, setProperties] = useState<{ value: string, label: string }[]>([]);
    const [units, setUnits] = useState<{ value: string, label: string }[]>([]);
    const [customers, setCustomers] = useState<{ value: string, label: string }[]>([]);
    const [agents, setAgents] = useState<{ value: string, label: string }[]>([]);
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
        property: "",
        unit: "",
        customer: "",
        agent: "",
        visitDate: "",
        visitTime: "",
        status: "Pending" as any,
        message: "",
        adminNotes: ""
    });

    useEffect(() => {
        fetchBookings();
    }, [search, page]);

    useEffect(() => {
        fetchFormData();
    }, []);

    useEffect(() => {
        if (formData.property) {
            fetchUnits(formData.property);
        } else {
            setUnits([]);
            setFormData(prev => ({ ...prev, unit: "" }));
        }
    }, [formData.property]);

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

    const fetchFormData = async () => {
        try {
            const [propRes, custRes, agentRes] = await Promise.all([
                fetch("/api/properties?limit=100"),
                fetch("/api/customers?limit=100"),
                fetch("/api/agents?limit=100")
            ]);

            const propData = await propRes.json();
            const custData = await custRes.json();
            const agentData = await agentRes.json();

            if (propData.success) setProperties(propData.data.map((p: any) => ({ value: p._id, label: p.title })));
            if (custData.success) setCustomers(custData.data.map((c: any) => ({ value: c._id, label: `${c.name} (${c.email || 'No email'})` })));
            if (agentData.success) {
                // agents API returns stats wrapper, data is in .data
                const agentsList = Array.isArray(agentData.data) ? agentData.data : [];
                let mappedAgents = agentsList.map((a: any) => ({ value: a._id, label: a.name }));
                
                // If logged in as agent, only show self in the list
                if (session?.user?.role === "Agent") {
                    mappedAgents = mappedAgents.filter((a: any) => a.value === session.user.id);
                }
                
                setAgents(mappedAgents);
            }
        } catch (error) {
            console.error("Error fetching form data:", error);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search
            });
            const res = await fetch(`/api/bookings?${query}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.data);
                // The API currently returns data.data as an array, adding dummy pagination if missing
                setPagination(data.pagination || { total: data.data.length, page: 1, limit: 10, pages: 1 });
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (booking: Booking | null = null) => {
        if (booking) {
            setEditingBooking(booking);
            setFormData({
                property: booking.property?._id || "",
                unit: booking.unit?._id || "",
                customer: booking.customer?._id || "",
                agent: booking.agent?._id || "",
                visitDate: booking.visitDate ? new Date(booking.visitDate).toISOString().split('T')[0] : "",
                visitTime: booking.visitTime || "",
                status: booking.status,
                message: booking.message || "",
                adminNotes: booking.adminNotes || ""
            });
        } else {
            setEditingBooking(null);
            setFormData({
                property: "",
                unit: "",
                customer: isCustomer ? (session?.user?.id || "") : "",
                agent: session?.user?.role === "Agent" ? (session?.user?.id || "") : "",
                visitDate: "",
                visitTime: "",
                status: "Pending",
                message: "",
                adminNotes: ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBooking(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingBooking ? `/api/bookings/${editingBooking._id}` : "/api/bookings";
            const res = await fetch(url, {
                method: editingBooking ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                fetchBookings();
                closeModal();
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving booking:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchBookings();
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return "bg-yellow-50 text-yellow-700 border-yellow-100";
            case 'Confirmed': return "bg-blue-50 text-blue-700 border-blue-100";
            case 'Completed': return "bg-green-50 text-green-700 border-green-100";
            case 'Cancelled': return "bg-red-50 text-red-700 border-red-100";
            case 'No-show': return "bg-gray-50 text-gray-700 border-gray-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Property Visits</h1>
                        <p className="text-sm text-gray-500">Manage inspection schedules and appointments</p>
                    </div>
                    <PermissionGate resource="bookings" action="create">
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Booking
                        </button>
                    </PermissionGate>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Pending Visits", value: bookings.filter(b => b.status === 'Pending').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Confirmed Visits", value: bookings.filter(b => b.status === 'Confirmed').length, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Total Bookings", value: pagination.total, icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
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
                                placeholder="Search by customer or property..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{bookings.length}</span> Appointments
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property & Visit</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Agent</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && bookings.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4 text-center"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium text-lg">No appointments found</p>
                                            <p className="text-sm">Try adjusting your search or create a new booking.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Home className="w-4 h-4 text-blue-900" />
                                                        <span className="text-sm font-bold text-gray-900 line-clamp-1">{booking.property?.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(booking.visitDate).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                            <Clock className="w-3 h-3" />
                                                            {booking.visitTime}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                        {booking.customer?.name?.[0] || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{booking.customer?.name || 'Unknown'}</p>
                                                        <p className="text-[10px] text-gray-500">{booking.customer?.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {booking.agent ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        {booking.agent.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative flex justify-end dropdown-trigger">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === booking._id ? null : booking._id)}
                                                        className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {activeDropdown === booking._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left text-black">
                                                            <PermissionGate resource="bookings" action="edit">
                                                                <button
                                                                    onClick={() => { openModal(booking); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Manage Visit
                                                                </button>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="bookings" action="delete">
                                                                <button
                                                                    onClick={() => { handleDelete(booking._id); setActiveDropdown(null); }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Cancel Booking
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
                            Showing <span className="text-gray-900">{bookings.length}</span> of <span className="text-gray-900">{pagination.total}</span> visits
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

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBooking ? "Manage Visit Details" : "Schedule New Inspection"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl space-y-4 text-black">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Home className="w-4 h-4 text-blue-900" />
                            Property & Client
                        </h4>
                        <FormSelect
                            label="Target Property"
                            required
                            options={properties}
                            value={formData.property}
                            onChange={(e: any) => setFormData({ ...formData, property: e.target.value, unit: "" })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect
                                label="Unit (Optional)"
                                options={units}
                                value={formData.unit}
                                onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                                disabled={!formData.property}
                            />
                            {!isCustomer && (
                                <FormSelect
                                    label="Customer"
                                    required
                                    options={customers}
                                    value={formData.customer}
                                    onChange={(e: any) => setFormData({ ...formData, customer: e.target.value })}
                                />
                            )}
                        </div>
                        <FormSelect
                            label="Assign Agent"
                            options={agents}
                            value={formData.agent}
                            onChange={(e: any) => setFormData({ ...formData, agent: e.target.value })}
                        />
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 space-y-4 text-black">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Schedule Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Visit Date"
                                type="date"
                                required
                                value={formData.visitDate}
                                onChange={(e: any) => setFormData({ ...formData, visitDate: e.target.value })}
                            />
                            <FormInput
                                label="Visit Time"
                                type="time"
                                required
                                value={formData.visitTime}
                                onChange={(e: any) => setFormData({ ...formData, visitTime: e.target.value })}
                            />
                        </div>
                        <FormSelect
                            label="Current Status"
                            required
                            value={formData.status}
                            options={[
                                { value: 'Pending', label: 'Pending Request' },
                                { value: 'Confirmed', label: 'Confirmed' },
                                { value: 'Completed', label: 'Completed' },
                                { value: 'Cancelled', label: 'Cancelled' },
                                { value: 'No-show', label: 'No-show' }
                            ]}
                            onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4 text-black">
                        <FormTextArea
                            label="Administrative Notes"
                            rows={3}
                            value={formData.adminNotes}
                            onChange={(e: any) => setFormData({ ...formData, adminNotes: e.target.value })}
                            placeholder="Add internal notes about this visit..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium">Cancel</button>
                        <FormButton type="submit" loading={submitting} className="!w-auto px-8 !bg-blue-900 shadow-sm">
                            {editingBooking ? "Save Changes" : "Create Appointment"}
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
