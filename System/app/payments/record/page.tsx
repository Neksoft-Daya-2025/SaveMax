
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CreditCard,
    ChevronLeft,
    Save,
    User,
    Home,
    DollarSign,
    Calendar,
    FileText,
    Receipt
} from "lucide-react";
import Link from "next/link";
import FormInput, { FormSelect, FormButton, FormTextArea } from "@/components/dashboard/FormInput";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function RecordPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("id");
    const isEditMode = !!paymentId;

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
        totalAmount: 0,
        paymentType: "Rent",
        paymentMethod: "Cash",
        status: "Completed",
        billingMonth: new Date().toLocaleString('default', { month: 'long' }),
        billingYear: new Date().getFullYear(),
        notes: ""
    });

    const { formatCurrency } = useSettings();

    useEffect(() => {
        fetchProperties();
        fetchCustomers();
        fetchContracts();
        if (isEditMode) {
            fetchPaymentData();
        }
    }, []);

    const fetchPaymentData = async () => {
        try {
            const res = await fetch(`/api/payments/${paymentId}`);
            const data = await res.json();
            if (data.success) {
                const payment = data.data;
                setFormData({
                    property: payment.property?._id || "",
                    unit: payment.unit?._id || "",
                    contract: payment.contract?._id || "",
                    client: payment.client?._id || "",
                    amount: payment.amount || 0,
                    receivedAmount: payment.receivedAmount || 0,
                    totalAmount: payment.totalAmount || 0,
                    paymentType: payment.paymentType || "Rent",
                    paymentMethod: payment.paymentMethod || "Cash",
                    status: payment.status || "Completed",
                    billingMonth: payment.billingMonth || new Date().toLocaleString('default', { month: 'long' }),
                    billingYear: payment.billingYear || new Date().getFullYear(),
                    notes: payment.notes || ""
                });

                if (payment.property?._id) {
                    fetchUnits(payment.property._id);
                }
            } else {
                alert("Payment not found");
                router.push("/payments");
            }
        } catch (error) {
            console.error("Error fetching payment:", error);
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

    const handleUnitChange = (unitId: string) => {
        const selectedUnit: any = units.find((u: any) => u._id === unitId);
        if (selectedUnit && selectedUnit.price) {
            setFormData({
                ...formData,
                unit: unitId,
                amount: selectedUnit.price,
                receivedAmount: selectedUnit.price,
                totalAmount: selectedUnit.price
            });
        } else {
            setFormData({ ...formData, unit: unitId });
        }
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
                amount: contract.details?.amount || 0,
                receivedAmount: contract.details?.amount || 0,
                totalAmount: contract.details?.amount || 0,
                paymentType: contract.type === 'Sale' ? 'Sale Installment' : 'Rent'
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
            const url = isEditMode ? `/api/payments/${paymentId}` : "/api/payments";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/payments");
            } else {
                alert(data.error || `Error ${isEditMode ? 'updating' : 'recording'} payment`);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'recording'} payment:`, error);
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
                    <Link href="/payments" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? "Edit Payment Record" : "Record Property Payment"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEditMode ? "Update payment details" : "Log collections from tenants and buyers"}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Transaction Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-black">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <Receipt className="w-5 h-5 text-blue-900" />
                            Source of Funds
                        </h3>

                        <div className="space-y-6">
                            <FormSelect
                                label="Link to Contract (Recommended)"
                                value={formData.contract}
                                onChange={(e: any) => handleContractChange(e.target.value)}
                                options={[
                                    { label: "Select an active contract...", value: "" },
                                    ...contracts.map((c: any) => ({
                                        label: `${c.property?.title} - ${c.parties?.client?.name} (${formatCurrency(c.details?.amount || 0)})`,
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
                                    onChange={(e: any) => handleUnitChange(e.target.value)}
                                    options={[
                                        { label: "Select unit...", value: "" },
                                        ...units.map((u: any) => ({
                                            label: `Unit ${u.unitNumber} (${u.floor ? 'Floor ' + u.floor : 'G'})`,
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
                                label="Payment Type"
                                required
                                value={formData.paymentType}
                                onChange={(e: any) => setFormData({ ...formData, paymentType: e.target.value as any })}
                                options={[
                                    { label: "Monthly Rent", value: "Rent" },
                                    { label: "Security Deposit", value: "Security Deposit" },
                                    { label: "Sale Installment", value: "Sale Installment" },
                                    { label: "Recurring Service", value: "Recurring" },
                                    { label: "Other", value: "Other" }
                                ]}
                            />
                            <FormSelect
                                label="Payment Method"
                                required
                                value={formData.paymentMethod}
                                onChange={(e: any) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                options={[
                                    { label: "Cash", value: "Cash" },
                                    { label: "Bank Transfer", value: "Bank Transfer" },
                                    { label: "Credit/Debit Card", value: "Card" },
                                    { label: "Online Payment", value: "Online" },
                                    { label: "Cheque", value: "Cheque" }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-black">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-blue-900" />
                            Billing Cycle (Optional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="Billing Month"
                                value={formData.billingMonth}
                                onChange={(e: any) => setFormData({ ...formData, billingMonth: e.target.value })}
                                options={[
                                    "January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"
                                ].map(m => ({ label: m, value: m }))}
                            />
                            <FormInput
                                label="Billing Year"
                                type="number"
                                value={formData.billingYear}
                                onChange={(e: any) => setFormData({ ...formData, billingYear: Number(e.target.value) })}
                            />
                        </div>

                        <FormTextArea
                            label="Internal Notes"
                            rows={3}
                            placeholder="Add payment verification codes or agent notes..."
                            value={formData.notes}
                            onChange={(e: any) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>

                {/* Right Column: Calculations */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden text-black">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <DollarSign className="w-24 h-24 text-blue-900" />
                        </div>
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900">
                            <DollarSign className="w-5 h-5 text-blue-900" />
                            Collection Summary
                        </h3>

                        <div className="space-y-6 relative">
                            <FormInput
                                label="Base Amount"
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    amount: Number(e.target.value),
                                    totalAmount: Number(e.target.value)
                                })}
                            />

                            <FormInput
                                label="Received Amount"
                                type="number"
                                required
                                value={formData.receivedAmount}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    receivedAmount: Number(e.target.value)
                                })}
                            />

                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total to Collect</p>
                                <div className="text-4xl font-black text-gray-900">
                                    {formatCurrency(formData.totalAmount)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <FormButton
                                type="submit"
                                loading={loading}
                                className="w-full h-14 !bg-blue-900 !text-white !font-black text-lg hover:scale-[1.02]"
                                icon={<Save className="w-6 h-6" />}
                            >
                                {isEditMode ? "Update Payment" : "Submit Payment"}
                            </FormButton>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Invoice Policy</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Submitting this form will generate a unique digital invoice and notify the property owner.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
