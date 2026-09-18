/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Wallet,
    ChevronLeft,
    Save,
    User,
    Home,
    DollarSign,
    Calendar,
    FileText,
    Receipt,
    AlertCircle,
    Info
} from "lucide-react";
import Link from "next/link";
import FormInput, { FormSelect, FormButton, FormTextArea } from "@/components/dashboard/FormInput";

export default function RecordDepositPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const depositId = searchParams.get("id");
    const isEditMode = !!depositId;

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(isEditMode);
    const [properties, setProperties] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [units, setUnits] = useState([]);

    const [formData, setFormData] = useState({
        property: "",
        unit: "",
        contract: "",
        client: "",
        amount: 0,
        receivedAmount: 0,
        type: "Security",
        paymentMethod: "Cash",
        status: "Received",
        notes: ""
    });

    useEffect(() => {
        fetchProperties();
        fetchCustomers();
        fetchContracts();
        if (isEditMode) {
            fetchDepositData();
        }
    }, []);

    const fetchDepositData = async () => {
        try {
            const res = await fetch(`/api/deposits/${depositId}`);
            const data = await res.json();
            if (data.success) {
                const deposit = data.data;
                setFormData({
                    property: deposit.property?._id || "",
                    unit: deposit.unit?._id || "",
                    contract: deposit.contract?._id || "",
                    client: deposit.client?._id || "",
                    amount: deposit.amount || 0,
                    receivedAmount: deposit.receivedAmount || 0,
                    type: deposit.type || "Security",
                    paymentMethod: deposit.paymentMethod || "Cash",
                    status: deposit.status || "Received",
                    notes: deposit.notes || ""
                });

                if (deposit.property?._id) {
                    fetchUnits(deposit.property._id);
                }
            } else {
                alert("Deposit record not found");
                router.push("/deposits");
            }
        } catch (error) {
            console.error("Error fetching deposit:", error);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchProperties = async () => {
        const res = await fetch("/api/properties");
        const data = await res.json();
        if (data.success) setProperties(data.data);
    };

    const fetchCustomers = async () => {
        const res = await fetch("/api/customers?limit=100");
        const data = await res.json();
        if (data.success) setCustomers(data.data);
    };

    const fetchContracts = async () => {
        const res = await fetch("/api/contracts?status=Active");
        const data = await res.json();
        if (data.success) setContracts(data.data);
    };

    const fetchUnits = async (propertyId: string) => {
        if (!propertyId) {
            setUnits([]);
            return;
        }
        const res = await fetch(`/api/units?propertyId=${propertyId}`);
        const data = await res.json();
        if (data.success) setUnits(data.data);
    };

    const handlePropertyChange = (propertyId: string) => {
        setFormData({ ...formData, property: propertyId, unit: "" });
        fetchUnits(propertyId);
    };

    const handleContractChange = (contractId: string) => {
        const contract: any = contracts.find((c: any) => c._id === contractId);
        if (contract) {
            setFormData({
                ...formData,
                contract: contractId,
                property: contract.property?._id || "",
                unit: contract.unit?._id || contract.unit || "",
                client: contract.parties?.client?._id || "",
                // Deposits are usually defined in contracts, but let's default to 0 if not sure
                amount: contract.details?.securityDeposit || 0,
                receivedAmount: contract.details?.securityDeposit || 0,
            });
            if (contract.property?._id) {
                fetchUnits(contract.property._id);
            }
        } else {
            setFormData({ ...formData, contract: contractId });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = isEditMode ? `/api/deposits/${depositId}` : "/api/deposits";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/deposits");
            } else {
                alert(data.error || `Error ${isEditMode ? 'updating' : 'recording'} deposit`);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'recording'} deposit:`, error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/deposits" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? "Edit Deposit Record" : "Record New Deposit"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditMode ? "Update security or holding deposit details" : "Log new security deposits or holding fees"}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <Receipt className="w-5 h-5 text-blue-900" />
                            Entity Association
                        </h3>

                        <div className="space-y-6">
                            <FormSelect
                                label="Link to Contract"
                                value={formData.contract}
                                onChange={(e: any) => handleContractChange(e.target.value)}
                                options={[
                                    { label: "Select an active contract...", value: "" },
                                    ...contracts.map((c: any) => ({
                                        label: `${c.property?.title} - ${c.parties?.client?.name}`,
                                        value: c._id
                                    }))
                                ]}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormSelect
                                    label="Property"
                                    required
                                    value={formData.property}
                                    onChange={(e: any) => handlePropertyChange(e.target.value)}
                                    options={[
                                        { label: "Select property...", value: "" },
                                        ...properties.map((p: any) => ({ label: p.title, value: p._id }))
                                    ]}
                                />
                                <FormSelect
                                    label="Unit (Optional)"
                                    value={formData.unit}
                                    onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                                    options={[
                                        { label: "Select unit...", value: "" },
                                        ...units.map((u: any) => ({
                                            label: `Unit ${u.unitNumber}`,
                                            value: u._id
                                        }))
                                    ]}
                                    disabled={!formData.property}
                                />
                                <FormSelect
                                    label="Client"
                                    required
                                    value={formData.client}
                                    onChange={(e: any) => setFormData({ ...formData, client: e.target.value })}
                                    options={[
                                        { label: "Select client...", value: "" },
                                        ...customers.map((c: any) => ({ label: c.name, value: c._id }))
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                            <FormSelect
                                label="Deposit Type"
                                required
                                value={formData.type}
                                onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                                options={[
                                    { label: "Security Deposit", value: "Security" },
                                    { label: "Holding Fee", value: "Holding" },
                                    { label: "Advanced Rent", value: "Advanced" },
                                    { label: "Other", value: "Other" }
                                ]}
                            />
                            <FormSelect
                                label="Payment Method"
                                required
                                value={formData.paymentMethod}
                                onChange={(e: any) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                options={[
                                    { label: "Cash", value: "Cash" },
                                    { label: "Bank Transfer", value: "Bank Transfer" },
                                    { label: "Card", value: "Card" },
                                    { label: "Online", value: "Online" },
                                    { label: "Cheque", value: "Cheque" }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <Info className="w-5 h-5 text-blue-900" />
                            Additional Context
                        </h3>
                        <FormTextArea
                            label="Notes / Conditions"
                            rows={3}
                            placeholder="Specify refund conditions or special terms..."
                            value={formData.notes}
                            onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Wallet className="w-24 h-24 text-blue-900" />
                        </div>
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900">
                            <DollarSign className="w-5 h-5 text-blue-900" />
                            Financials
                        </h3>

                        <div className="space-y-6 relative">
                            <FormInput
                                label="Agreed Amount"
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e: any) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            />
                            <FormInput
                                label="Received Amount"
                                type="number"
                                required
                                value={formData.receivedAmount}
                                onChange={(e: any) => setFormData({ ...formData, receivedAmount: Number(e.target.value) })}
                            />

                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <FormSelect
                                    label="Status"
                                    required
                                    value={formData.status}
                                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                                    options={[
                                        { label: "Pending", value: "Pending" },
                                        { label: "Received", value: "Received" },
                                        { label: "Consumed", value: "Consumed" },
                                        { label: "Refunded", value: "Refunded" }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <FormButton
                                type="submit"
                                loading={loading}
                                className="w-full h-14 !bg-blue-900 !text-white !font-black text-lg hover:scale-[1.02]"
                            >
                                {isEditMode ? "Update Deposit" : "Record Deposit"}
                            </FormButton>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900 text-sm">Security Notice</h4>
                            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                Deposits are held separately from revenue. They do not count towards monthly profit until they are marked as "Consumed".
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
