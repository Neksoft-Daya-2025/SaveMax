/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Building2,
    ArrowLeft,
    Shield,
    CreditCard,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Save,
    Trash2,
    Key,
    Layers,
    Users,
    FileText,
    Wrench,
} from "lucide-react";

export default function OrganizationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [organization, setOrganization] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
        plan: "monthly",
        subscriptionStatus: "active",
        endDate: "",
        newAdminPassword: "",
    });

    useEffect(() => {
        if (id) fetchOrganization();
    }, [id]);

    const fetchOrganization = async () => {
        try {
            const res = await fetch(`/api/superadmin/organizations/${id}`);
            const data = await res.json();
            if (data.success) {
                setOrganization(data.data);
                setFormData({
                    name: data.data.name || "",
                    email: data.data.email || "",
                    phone: data.data.phone || "",
                    address: data.data.address || "",
                    status: data.data.status || "active",
                    plan: data.data.subscription?.plan || "monthly",
                    subscriptionStatus: data.data.subscription?.status || "active",
                    endDate: data.data.subscription?.endDate
                        ? new Date(data.data.subscription.endDate).toISOString().split("T")[0]
                        : "",
                    newAdminPassword: "",
                });
            } else {
                setError(data.error || "Failed to load organization.");
            }
        } catch (err: any) {
            console.error("Error loading organization details:", err);
            setError("Failed to load organization details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const res = await fetch(`/api/superadmin/organizations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage("Organization and subscription updated successfully.");
                fetchOrganization();
            } else {
                setError(data.error || "Failed to update organization.");
            }
        } catch (err: any) {
            console.error("Error saving organization:", err);
            setError("An error occurred while saving organization.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to permanently delete "${organization?.name}" and all tenant data? This cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/superadmin/organizations/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                router.push("/superadmin/organizations");
            } else {
                setError(data.error || "Failed to delete organization.");
            }
        } catch (err) {
            console.error("Error deleting organization:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-900 animate-spin mb-3" />
                <p className="text-xs text-gray-500">Loading organization details...</p>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-xs p-8 max-w-lg mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900">Organization not found</h2>
                <Link href="/superadmin/organizations" className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
                    Return to Organizations directory
                </Link>
            </div>
        );
    }

    const stats = organization.stats || {};
    const isYearly = organization.subscription?.plan === "yearly";

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/superadmin/organizations"
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Organizations</span>
                </Link>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Tenant</span>
                </button>
            </div>

            {/* Org Header Banner */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 font-extrabold text-xl shadow-xs">
                        {organization.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{organization.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                organization.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                                {organization.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Tenant Slug: <code className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono">/{organization.slug}</code> • Created on {new Date(organization.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        isYearly
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-blue-50 text-blue-900 border border-blue-200"
                    }`}>
                        {organization.subscription?.plan === "yearly" ? "Enterprise Yearly" : "Professional Monthly"}
                    </span>
                </div>
            </div>

            {/* Tenant Usage KPI Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold mb-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" /> Properties
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.propertiesCount || 0}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold mb-1">
                        <Layers className="w-3.5 h-3.5 text-purple-600" /> Units
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.unitsCount || 0}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold mb-1">
                        <Users className="w-3.5 h-3.5 text-blue-700" /> Tenants
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.tenantsCount || 0}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold mb-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Contracts
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.contractsCount || 0}</p>
                </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSave} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organization Details */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                            Organization Information
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Business Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Account Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended (Access blocked)</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Subscription & Admin Security */}
                    <div className="space-y-6">
                        {/* Subscription Tier Settings */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                                Subscription Plan Management
                            </h3>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Subscription Tier</label>
                                <select
                                    value={formData.plan}
                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                                >
                                    <option value="monthly">Professional Monthly ($49 / mo)</option>
                                    <option value="yearly">Enterprise Annual ($490 / yr)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Subscription Status</label>
                                <select
                                    value={formData.subscriptionStatus}
                                    onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value="active">Active</option>
                                    <option value="trial">Trial</option>
                                    <option value="past_due">Past Due</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Subscription Expiry / Renewal Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Admin Security */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                                Administrator Credentials
                            </h3>

                            <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p><span className="text-gray-400 font-medium">Admin Name:</span> <span className="font-semibold text-gray-900">{organization.adminUser?.name || "N/A"}</span></p>
                                <p><span className="text-gray-400 font-medium">Admin Email:</span> <code className="text-blue-700 font-mono font-semibold">{organization.adminUser?.email || "N/A"}</code></p>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Reset Admin Password (Leave blank to keep existing)
                                </label>
                                <div className="relative">
                                    <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password"
                                        value={formData.newAdminPassword}
                                        onChange={(e) => setFormData({ ...formData, newAdminPassword: e.target.value })}
                                        placeholder="Enter new password"
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Organization Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
