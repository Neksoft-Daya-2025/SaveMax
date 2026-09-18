/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import Select from "react-select";
import FormInput, { FormSelect, FormButton } from "@/components/dashboard/FormInput";
import { useSession } from "next-auth/react";

export default function AddCustomerPage() {
    const router = useRouter();
    const { data: session }: any = useSession();

    const [roles, setRoles] = useState<{ value: string, label: string }[]>([]);
    const [allAgents, setAllAgents] = useState<{ value: string, label: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        status: "Active",
        role: "",
        password: "",
        assignedAgents: [] as string[]
    });

    useEffect(() => {
        fetchRoles();
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await fetch("/api/agents?limit=100");
            const data = await res.json();
            if (data.success) {
                const agentsList = Array.isArray(data.data) ? data.data : [];
                let mappedAgents = agentsList.map((a: any) => ({
                    value: a._id,
                    label: a.name
                }));

                if (session?.user?.role === "Agent") {
                    mappedAgents = mappedAgents.filter((a: any) => a.value === session.user.id);
                }

                setAllAgents(mappedAgents);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch("/api/roles?limit=100");
            const data = await res.json();
            if (data.success) {
                const mappedRoles = data.data
                    .map((r: any) => ({ value: r._id, label: r.name }))
                    .filter((r: any) => r.label === 'Customer');
                setRoles(mappedRoles);

                // Default role to Customer
                const customerRole = mappedRoles.find((r: any) => r.label === 'Customer');
                if (customerRole) {
                    setFormData(prev => ({ ...prev, role: customerRole.value }));
                }
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/customers");
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Section */}
                <div>
                    <Link
                        href="/customers"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-900 font-medium mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Customers
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
                    <p className="text-sm text-gray-500">Add a new customer to your database</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-black">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormInput
                            label="Customer Name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter customer name"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="customer@example.com"
                            />
                            <FormInput
                                label="Password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Enter phone number"
                            />
                            <FormSelect
                                label="System Role"
                                required
                                value={formData.role}
                                onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                                options={roles}
                            />
                        </div>
                        <FormInput
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Enter address"
                        />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                placeholder="Additional notes"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-sm resize-none"
                            />
                        </div>
                        <FormSelect
                            label="Status"
                            required
                            value={formData.status}
                            onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                            options={[
                                { value: "Active", label: "Active" },
                                { value: "Inactive", label: "Inactive" }
                            ]}
                        />

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-900" />
                                Assigned Agents
                            </label>
                            <Select
                                isMulti
                                options={allAgents}
                                value={allAgents.filter(a => formData.assignedAgents.includes(a.value))}
                                onChange={(selected: any) => setFormData({
                                    ...formData,
                                    assignedAgents: selected ? selected.map((s: any) => s.value) : []
                                })}
                                placeholder="Select agents..."
                                className="text-sm"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: '0.5rem',
                                        borderColor: '#d1d5db',
                                        padding: '2px',
                                        '&:hover': { borderColor: '#1e3a8a' }
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: '#eff6ff',
                                        borderRadius: '0.375rem',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: '#1e40af',
                                        fontWeight: '600',
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: '#1e40af',
                                        '&:hover': { backgroundColor: '#dbeafe', color: '#1e3a8a' }
                                    })
                                }}
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Assign one or more agents to manage this customer.</p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Link
                                href="/customers"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </Link>
                            <FormButton type="submit" loading={submitting}>
                                Create Customer
                            </FormButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
