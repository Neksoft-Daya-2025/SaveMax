/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FilePlus,
    ChevronLeft,
    Save,
    Home,
    User,
    DollarSign,
    Calendar,
    Clock
} from "lucide-react";
import Link from "next/link";
import FormInput, { FormSelect, FormButton, FormTextArea } from "@/components/dashboard/FormInput";
import DocumentUpload from "@/components/contract/DocumentUpload";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function CreateContractPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [units, setUnits] = useState([]);
    const { formatCurrency } = useSettings();

    const [formData, setFormData] = useState({
        property: "",
        unit: "",
        type: "Rent",
        parties: {
            client: "",
        },
        details: {
            startDate: "",
            endDate: "",
            amount: 0,
            billingCycle: "Monthly",
            securityDeposit: 0,
            lateFee: 0
        },
        status: "Draft",
        notes: "",
        documents: [] as { name: string, url: string }[]
    });

    useEffect(() => {
        fetchProperties();
        fetchCustomers();
    }, []);

    const fetchProperties = async () => {
        const res = await fetch("/api/properties?status=Available");
        const data = await res.json();
        if (data.success) setProperties(data.data);
    };

    const fetchUnits = async (propertyId: string) => {
        if (!propertyId) {
            setUnits([]);
            return;
        }
        try {
            const res = await fetch(`/api/units?propertyId=${propertyId}&status=Available`);
            const data = await res.json();
            if (data.success) {
                setUnits(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching units:", error);
        }
    };

    const handlePropertyChange = (propertyId: string) => {
        setFormData({ ...formData, property: propertyId, unit: "" });
        fetchUnits(propertyId);
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/customers?limit=1000");
            const data = await res.json();
            console.log("Customers API Response:", data);
            if (data.success) {
                setCustomers(data.data || []);
                console.log("Customers loaded:", data.data?.length || 0);
            } else {
                console.warn("Failed to fetch customers:", data.error);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/contracts");
            } else {
                alert(data.error || "Error creating contract");
            }
        } catch (error) {
            console.error("Error creating contract:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/contracts" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Draft New Contract</h1>
                        <p className="text-sm text-gray-500">Legalize property agreements and rentals</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Selection */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <Home className="w-5 h-5 text-blue-900" />
                            Agreement Basics
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormSelect
                                label="Select Property"
                                required
                                value={formData.property}
                                onChange={(e: any) => handlePropertyChange(e.target.value)}
                                options={[
                                    { label: "-- Select Property --", value: "" },
                                    ...properties.map((p: any) => ({
                                        label: `${p.title} (${formatCurrency(p.price)})`,
                                        value: p._id
                                    }))
                                ]}
                            />
                            <FormSelect
                                label="Select Unit (Optional)"
                                value={formData.unit}
                                onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                                options={[
                                    { label: "-- Select Unit --", value: "" },
                                    ...units.map((u: any) => ({
                                        label: `Unit ${u.unitNumber} (${u.floor ? 'Floor ' + u.floor : 'G'}) - ${formatCurrency(u.price)}`,
                                        value: u._id
                                    }))
                                ]}
                                disabled={!formData.property || units.length === 0}
                            />
                            <FormSelect
                                label="Contract Type"
                                required
                                value={formData.type}
                                onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                                options={[
                                    { label: "Rental Agreement", value: "Rent" },
                                    { label: "Lease Agreement", value: "Lease" },
                                    { label: "Sales Contract", value: "Sale" }
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormSelect
                                    label="Select Client (Tenant/Buyer)"
                                    required
                                    value={formData.parties.client}
                                    onChange={(e: any) => setFormData({
                                        ...formData,
                                        parties: { ...formData.parties, client: e.target.value }
                                    })}
                                    options={[
                                        { label: "-- Select Customer --", value: "" },
                                        ...customers.map((c: any) => ({
                                            label: c.name || c.email,
                                            value: c._id
                                        }))
                                    ]}
                                />
                                {customers.length === 0 && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        No customers available. <Link href="/customers" className="text-blue-600 font-semibold underline">Create a customer</Link> first.
                                    </p>
                                )}
                            </div>
                            <FormSelect
                                label="Initial Status"
                                required
                                value={formData.status}
                                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { label: "Draft", value: "Draft" },
                                    { label: "Active (Sign Now)", value: "Active" }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-900" />
                            Timeline & Terms
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Start Date"
                                type="date"
                                required
                                value={formData.details.startDate}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    details: { ...formData.details, startDate: e.target.value }
                                })}
                            />
                            <FormInput
                                label="End Date (Optional)"
                                type="date"
                                value={formData.details.endDate}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    details: { ...formData.details, endDate: e.target.value }
                                })}
                            />
                        </div>

                        <FormTextArea
                            label="Additional Notes & Special Clauses"
                            rows={4}
                            placeholder="Enter any custom legal terms or property conditions..."
                            value={formData.notes}
                            onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <FilePlus className="w-5 h-5 text-blue-900" />
                            Attachments & Proofs
                        </h3>
                        <DocumentUpload
                            documents={formData.documents}
                            onChange={(docs) => setFormData({ ...formData, documents: docs })}
                        />
                    </div>
                </div>

                {/* Right Column: Financials */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <DollarSign className="w-24 h-24 text-blue-900" />
                        </div>
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900">
                            Financial Terms
                        </h3>

                        <div className="space-y-6 relative">
                            <FormInput
                                label="Contract Amount / Rent"
                                type="number"
                                required
                                value={formData.details.amount}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    details: { ...formData.details, amount: Number(e.target.value) }
                                })}
                            />

                            {formData.type === 'Rent' && (
                                <FormSelect
                                    label="Billing Cycle"
                                    required
                                    value={formData.details.billingCycle}
                                    onChange={(e: any) => setFormData({
                                        ...formData,
                                        details: { ...formData.details, billingCycle: e.target.value }
                                    })}
                                    options={[
                                        { label: "Monthly", value: "Monthly" },
                                        { label: "Quarterly", value: "Quarterly" },
                                        { label: "Yearly", value: "Yearly" }
                                    ]}
                                />
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                <FormInput
                                    label="Security Deposit"
                                    type="number"
                                    value={formData.details.securityDeposit}
                                    onChange={(e: any) => setFormData({
                                        ...formData,
                                        details: { ...formData.details, securityDeposit: Number(e.target.value) }
                                    })}
                                />
                                <FormInput
                                    label="Late Fee (Penalty)"
                                    type="number"
                                    value={formData.details.lateFee}
                                    onChange={(e: any) => setFormData({
                                        ...formData,
                                        details: { ...formData.details, lateFee: Number(e.target.value) }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <FormButton
                                type="submit"
                                loading={loading}
                                className="w-full h-14 !bg-blue-900 !text-white !font-black text-lg hover:scale-[1.02] shadow-xl shadow-blue-900/10"
                                icon={<Save className="w-6 h-6" />}
                            >
                                Generate Contract
                            </FormButton>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                        <FilePlus className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-xs text-gray-500 font-medium">Digital signatures and PDF generation will be available after saving the draft.</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
