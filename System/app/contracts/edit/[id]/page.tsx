/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    Save,
    Home,
    DollarSign,
    Clock
} from "lucide-react";
import Link from "next/link";
import FormInput, { FormSelect, FormButton, FormTextArea } from "@/components/dashboard/FormInput";
import DocumentUpload from "@/components/contract/DocumentUpload";
import { FilePlus } from "lucide-react";

export default function EditContractPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [properties, setProperties] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [units, setUnits] = useState([]);

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
        if (id) {
            fetchContract();
        }
        fetchProperties();
        fetchCustomers();
    }, [id]);

    const fetchContract = async () => {
        try {
            const res = await fetch(`/api/contracts/${id}`);
            const data = await res.json();
            if (data.success) {
                const c = data.data;
                const propertyId = c.property?._id || c.property || "";

                setFormData({
                    property: propertyId,
                    unit: c.unit?._id || c.unit || "",
                    type: c.type || "Rent",
                    parties: {
                        client: c.parties?.client?._id || c.parties?.client || "",
                    },
                    details: {
                        startDate: c.details?.startDate ? new Date(c.details.startDate).toISOString().split('T')[0] : "",
                        endDate: c.details?.endDate ? new Date(c.details.endDate).toISOString().split('T')[0] : "",
                        amount: c.details?.amount || 0,
                        billingCycle: c.details?.billingCycle || "Monthly",
                        securityDeposit: c.details?.securityDeposit || 0,
                        lateFee: c.details?.lateFee || 0
                    },
                    status: c.status || "Draft",
                    notes: c.notes || "",
                    documents: c.documents || []
                });

                if (propertyId) {
                    fetchUnits(propertyId);
                }
            }
        } catch (error) {
            console.error("Error fetching contract:", error);
        } finally {
            setFetching(false);
        }
    };

    const fetchProperties = async () => {
        const res = await fetch("/api/properties");
        const data = await res.json();
        if (data.success) setProperties(data.data);
    };

    const fetchUnits = async (propertyId: string) => {
        try {
            const res = await fetch(`/api/units?propertyId=${propertyId}`);
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
            if (data.success) {
                setCustomers(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/contracts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/contracts");
            } else {
                alert(data.error || "Error updating contract");
            }
        } catch (error) {
            console.error("Error updating contract:", error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-gray-500 font-bold">Loading contract details...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/contracts" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Contract</h1>
                        <p className="text-sm text-gray-500">Updating legal agreement details</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8 text-black">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2 uppercase tracking-wider">
                            Agreement Basics
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormSelect
                                label="Property"
                                required
                                value={formData.property}
                                onChange={(e: any) => handlePropertyChange(e.target.value)}
                                options={[
                                    { label: "-- Select Property --", value: "" },
                                    ...properties.map((p: any) => ({ label: p.title, value: p._id }))
                                ]}
                            />
                            <FormSelect
                                label="Unit (Optional)"
                                value={formData.unit}
                                onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                                options={[
                                    { label: "-- Select Unit --", value: "" },
                                    ...units.map((u: any) => ({
                                        label: `Unit ${u.unitNumber} (${u.floor ? 'Floor ' + u.floor : 'G'})`,
                                        value: u._id
                                    }))
                                ]}
                                disabled={!formData.property}
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
                                    label="Client (Tenant/Buyer)"
                                    required
                                    value={formData.parties.client}
                                    onChange={(e: any) => setFormData({
                                        ...formData,
                                        parties: { ...formData.parties, client: e.target.value }
                                    })}
                                    options={[
                                        { label: "-- Select Customer --", value: "" },
                                        ...customers.map((c: any) => ({ label: c.name || c.email, value: c._id }))
                                    ]}
                                />
                            </div>
                            <FormSelect
                                label="Contract Status"
                                required
                                value={formData.status}
                                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { label: "Draft", value: "Draft" },
                                    { label: "Active", value: "Active" },
                                    { label: "Expired", value: "Expired" },
                                    { label: "Terminated", value: "Terminated" }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2 uppercase tracking-wider">
                            Timeline
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
                                label="End Date"
                                type="date"
                                value={formData.details.endDate}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    details: { ...formData.details, endDate: e.target.value }
                                })}
                            />
                        </div>

                        <FormTextArea
                            label="Notes"
                            rows={4}
                            value={formData.notes}
                            onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2 uppercase tracking-wider">
                            <FilePlus className="w-5 h-5 text-blue-900" />
                            Attachments & Proofs
                        </h3>
                        <DocumentUpload
                            documents={formData.documents}
                            onChange={(docs) => setFormData({ ...formData, documents: docs })}
                        />
                    </div>
                </div>

                <div className="space-y-8 text-black">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <h3 className="text-xl font-bold mb-8 text-gray-900 uppercase tracking-widest">
                            Financial Terms
                        </h3>

                        <div className="space-y-6 relative">
                            <FormInput
                                label="Amount"
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
                                label="Late Fee"
                                type="number"
                                value={formData.details.lateFee}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    details: { ...formData.details, lateFee: Number(e.target.value) }
                                })}
                            />
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <FormButton
                                type="submit"
                                loading={loading}
                                className="w-full h-14 !bg-blue-900 !text-white !font-black text-lg hover:scale-[1.02]"
                            >
                                Update Contract
                            </FormButton>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
