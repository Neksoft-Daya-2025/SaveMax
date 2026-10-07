
"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import FormInput, { FormTextArea, FormButton } from "@/components/dashboard/FormInput";

interface InquiryFormProps {
    propertyId: string;
    agentId?: string;
}

export default function InquiryForm({ propertyId, agentId }: InquiryFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    property: propertyId,
                    agent: agentId,
                    ...formData
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error("Error sending inquiry:", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-green-50 p-8 rounded-2xl border border-green-100 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">Message Sent!</h4>
                <p className="text-green-700 text-sm">Thank you for your interest. Our agent will contact you shortly.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm font-bold text-green-900 hover:underline"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Interested in this property?</h3>
            <p className="text-gray-500 text-sm mb-6">Fill out the form below and we'll get back to you.</p>

            <FormInput
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <FormInput
                    label="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>
            <FormTextArea
                label="Message"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />

            <FormButton
                type="submit"
                loading={loading}
                className="w-full h-14 text-lg"
                icon={<Send className="w-5 h-5" />}
            >
                Send Message
            </FormButton>
        </form>
    );
}
