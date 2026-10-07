
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, Search, Filter, Home, DollarSign, TrendingUp,
    MoreVertical, Mail, Phone, Plus, UserCircle,
    ChevronLeft, ChevronRight, Edit, Trash2, Shield,
    User, Award, Briefcase, Star, CheckCircle2
} from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import Modal from "@/components/dashboard/Modal";
import FormInput, { FormButton, FormSelect } from "@/components/dashboard/FormInput";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Agent {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    listingsCount: number;
    totalEarnings: number;
    agentDetails?: {
        commissionType: 'percentage' | 'fixed';
        commissionValue: number;
        specialization: string[];
        experience: number;
    };
    role?: any;
    password?: string;
    createdAt: string;
}

interface AgentListing {
    _id: string;
    title: string;
    propertyType: string;
    purpose: string;
    status: string;
    price: number;
    location?: { city?: string; address?: string };
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 10, pages: 0 });
    const [globalStats, setGlobalStats] = useState<any>({ totalAgents: 0, totalPaidCommissions: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [roles, setRoles] = useState<{ value: string, label: string }[]>([]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const { formatCurrency } = useSettings();
    const [listingsAgent, setListingsAgent] = useState<Agent | null>(null);
    const [agentListings, setAgentListings] = useState<AgentListing[]>([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [listingsError, setListingsError] = useState("");
    const [listingsPage, setListingsPage] = useState(1);
    const [listingsPages, setListingsPages] = useState(1);

    useEffect(() => {
        if (!listingsAgent) return;
        const controller = new AbortController();
        const loadListings = async () => {
            setListingsLoading(true);
            setListingsError("");
            setAgentListings([]);
            try {
                const query = new URLSearchParams({ agent: listingsAgent._id, page: String(listingsPage), limit: "10" });
                const res = await fetch(`/api/properties?${query}`, { signal: controller.signal });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.error || "Could not load listings.");
                if (controller.signal.aborted) return;
                setAgentListings(data.data);
                setListingsPages(Math.max(1, data.pagination?.pages || 1));
            } catch (error) {
                if (!controller.signal.aborted) {
                    setListingsError(error instanceof Error ? error.message : "Could not load listings.");
                }
            } finally {
                if (!controller.signal.aborted) setListingsLoading(false);
            }
        };
        loadListings();
        return () => controller.abort();
    }, [listingsAgent, listingsPage]);

    const openListings = (agent: Agent) => {
        setAgentListings([]);
        setListingsError("");
        setListingsLoading(true);
        setListingsPage(1);
        setListingsPages(1);
        setListingsAgent(agent);
    };

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
        agentDetails: {
            commissionType: 'percentage',
            commissionValue: 0,
            specialization: "",
            experience: 0
        }
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchAgents();
    }, [search, page]);

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/roles?limit=100");
            const data = await res.json();
            if (data.success) {
                const mappedRoles = data.data
                    .map((r: any) => ({ value: r._id, label: r.name }))
                    .filter((r: any) => r.label === 'Agent');
                setRoles(mappedRoles);

                // If modal is open and in create mode with no role, set default
                if (isModalOpen && !editingAgent && !formData.role) {
                    const agentRole = mappedRoles.find((r: any) => r.label === 'Agent');
                    if (agentRole) {
                        setFormData(prev => ({ ...prev, role: agentRole.value }));
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                search
            });
            const res = await fetch(`/api/agents?${query}`);
            const data = await res.json();
            if (data.success) {
                setAgents(data.data);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (agent: any | null = null) => {
        if (agent) {
            setEditingAgent(agent);
            setFormData({
                name: agent.name || "",
                email: agent.email || "",
                password: "",
                phone: agent.phone || "",
                status: agent.status || "Active",
                role: agent.role?._id || agent.role || "",
                agentDetails: {
                    commissionType: agent.agentDetails?.commissionType || 'percentage',
                    commissionValue: agent.agentDetails?.commissionValue || 0,
                    specialization: agent.agentDetails?.specialization?.join(", ") || "",
                    experience: agent.agentDetails?.experience || 0
                }
            });
        } else {
            setEditingAgent(null);
            const agentRole = roles.find(r => r.label === 'Agent');
            setFormData({
                name: "",
                email: "",
                phone: "",
                status: "Active",
                role: agentRole?.value || "",
                password: "",
                agentDetails: {
                    commissionType: 'percentage',
                    commissionValue: 0,
                    specialization: "",
                    experience: 0
                }
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAgent(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                ...formData,
                agentDetails: {
                    ...formData.agentDetails,
                    specialization: formData.agentDetails.specialization.split(",").map(s => s.trim()).filter(Boolean)
                }
            };





            const url = editingAgent ? `/api/agents/${editingAgent._id}` : "/api/agents";
            const method = editingAgent ? "PUT" : "POST";

            // Don't send empty password if editing
            if (editingAgent && !payload.password) {
                delete payload.password;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                fetchAgents();
                closeModal();
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error("Error saving agent:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this agent?")) return;
        try {
            const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchAgents();
        } catch (error) {
            console.error("Error deleting agent:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Agent Performance</h1>
                        <p className="text-sm text-gray-500">Monitor listing activity and commission earnings</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PermissionGate resource="agents" action="create">
                            <button
                                onClick={() => openModal()}
                                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 shadow-sm font-semibold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Agent
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Performance Cards - Keep these but style like staff page theme if possible */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Active Agents", value: globalStats.totalAgents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Gross Commissions", value: formatCurrency(globalStats.totalEarnedCommissions || 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Top Performer", value: agents[0]?.name || "N/A", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                {stat.label === "Gross Commissions" && globalStats.totalPaidCommissions > 0 && (
                                    <p className="text-[10px] text-green-600 font-bold mt-1">
                                        {formatCurrency(globalStats.totalPaidCommissions)} already disbursed
                                    </p>
                                )}
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
                                placeholder="Search agents by name or email..."
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Earnings</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading && agents.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded"></div></td>
                                        </tr>
                                    ))
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No agents found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    agents.map((agent) => (
                                        <tr key={agent._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <User className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900">{agent.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] text-gray-400 font-medium uppercase">{agent.agentDetails?.specialization?.join(", ") || "General Agent"}</div>
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold border border-blue-100 uppercase">
                                                                {typeof agent.role === 'object' ? agent.role?.name : 'Agent'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <PermissionGate resource="properties" action="view" fallback={<span className="text-sm font-bold text-gray-900">{agent.listingsCount} Listings</span>}>
                                                    <button
                                                        type="button"
                                                        onClick={() => openListings(agent)}
                                                        aria-label={`View listings for ${agent.name}`}
                                                        className="flex items-center gap-2 rounded text-sm font-bold text-blue-900 hover:underline focus-visible:outline-2 focus-visible:outline-blue-900"
                                                    >
                                                        <Home className="w-4 h-4" />
                                                        {agent.listingsCount} {agent.listingsCount === 1 ? "Listing" : "Listings"}
                                                    </button>
                                                </PermissionGate>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{agent.agentDetails?.experience || 0} Years Experience</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900">{formatCurrency(agent.totalEarnings)}</span>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">Total Earned</p>
                                                {(agent as any).paidEarnings > 0 && (
                                                    <div className="flex items-center gap-1 mt-1 text-green-600">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        <span className="text-[10px] font-bold">{formatCurrency((agent as any).paidEarnings)} Paid</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${agent.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                                    }`}>
                                                    {agent.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="relative flex justify-end dropdown-trigger">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === agent._id ? null : agent._id)}
                                                        className="p-2 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {activeDropdown === agent._id && (
                                                        <div className="absolute right-0 mt-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                            <PermissionGate resource="agents" action="edit">
                                                                <button
                                                                    onClick={() => {
                                                                        openModal(agent);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                                    Edit Details
                                                                </button>
                                                            </PermissionGate>
                                                            <div className="h-px bg-gray-100 my-1" />
                                                            <PermissionGate resource="agents" action="delete">
                                                                <button
                                                                    onClick={() => {
                                                                        handleDelete(agent._id);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete Agent
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
                            Showing <span className="text-gray-900">{agents.length}</span> of <span className="text-gray-900">{pagination.total}</span> agents
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

            {/* Agent Modal */}
            <Modal isOpen={!!listingsAgent} onClose={() => setListingsAgent(null)} title={`${listingsAgent?.name || "Agent"} — Listings`} size="lg">
                {listingsLoading ? (
                    <p role="status" className="py-8 text-center text-gray-600">Loading listings...</p>
                ) : listingsError ? (
                    <div role="alert" className="space-y-3 py-4">
                        <p className="text-red-600">{listingsError}</p>
                        <button type="button" onClick={() => listingsAgent && openListings({ ...listingsAgent })} className="font-semibold text-blue-900 hover:underline">Try again</button>
                    </div>
                ) : agentListings.length === 0 ? (
                    <p className="py-8 text-center text-gray-600">No properties assigned to this agent.</p>
                ) : (
                    <div className="space-y-4">
                        {agentListings.map(property => (
                            <div key={property._id} className="rounded-lg border border-gray-200 p-4">
                                <Link href={`/properties/${property._id}`} className="font-semibold text-blue-900 hover:underline">{property.title}</Link>
                                <p className="mt-1 text-sm text-gray-600">{[property.location?.address, property.location?.city].filter(Boolean).join(", ")}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                                    <span>{property.propertyType} · {property.purpose}</span>
                                    <span className="font-semibold">{formatCurrency(property.price)}</span>
                                    <span className="rounded bg-gray-100 px-2 py-1 text-gray-700">{property.status}</span>
                                </div>
                            </div>
                        ))}
                        {listingsPages > 1 && (
                            <div className="flex items-center justify-between gap-3">
                                <button type="button" disabled={listingsPage === 1} onClick={() => setListingsPage(p => p - 1)} className="text-blue-900 disabled:opacity-40">Previous</button>
                                <span className="text-sm text-gray-600">Page {listingsPage} of {listingsPages}</span>
                                <button type="button" disabled={listingsPage >= listingsPages} onClick={() => setListingsPage(p => p + 1)} className="text-blue-900 disabled:opacity-40">Next</button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAgent ? "Edit Agent Profile" : "Register New Agent"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-900" />
                            Personal Information
                        </h4>
                        <FormInput
                            label="Full Name"
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
                                disabled={!!editingAgent}
                                value={formData.email}
                                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                            <FormInput
                                label="Phone Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 234 567 890"
                            />
                        </div>

                        {!editingAgent && (
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-4">
                                <FormInput
                                    label="System Login Password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Set a secure password for agent login"
                                />
                                <p className="text-[10px] text-blue-600 mt-1 font-medium">
                                    Agent will use their email and this password to access the portal.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100/50 space-y-4">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Professional Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                label="Commission Type"
                                value={formData.agentDetails.commissionType}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    agentDetails: { ...formData.agentDetails, commissionType: e.target.value as any }
                                })}
                                options={[
                                    { value: 'percentage', label: 'Percentage (%)' },
                                    { value: 'fixed', label: 'Fixed Amount ($)' }
                                ]}
                            />
                            <FormInput
                                label="Commission Value"
                                type="number"
                                value={formData.agentDetails.commissionValue}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    agentDetails: { ...formData.agentDetails, commissionValue: parseFloat(e.target.value) }
                                })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="Experience (Years)"
                                type="number"
                                value={formData.agentDetails.experience}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    agentDetails: { ...formData.agentDetails, experience: parseInt(e.target.value) }
                                })}
                            />
                            <FormSelect
                                label="Account Status"
                                value={formData.status}
                                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Inactive', label: 'Inactive' },
                                    { value: 'Pending', label: 'Pending' }
                                ]}
                            />
                        </div>
                        <FormInput
                            label="Specialization (comma separated)"
                            value={formData.agentDetails.specialization}
                            onChange={(e: any) => setFormData({
                                ...formData,
                                agentDetails: { ...formData.agentDetails, specialization: e.target.value }
                            })}
                            placeholder="Residential, Commercial, Luxury Rentals"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <FormButton type="submit" loading={submitting} className="!w-auto px-8 !bg-blue-900 shadow-sm">
                            {editingAgent ? "Update Account" : "Create Account"}
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
