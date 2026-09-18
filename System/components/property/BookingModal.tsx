/* Developed by RUDRA via NEKLLM */
"use client";

import { useState } from "react";
import { X, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import FormInput, { FormTextArea, FormButton } from "@/components/dashboard/FormInput";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    propertyTitle: string;
}

export default function BookingModal({ isOpen, onClose, propertyId, propertyTitle }: BookingModalProps) {
    const [formData, setFormData] = useState({
        visitDate: "",
        visitTime: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    property: propertyId,
                    ...formData
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.error || "Failed to create booking. Please try again.");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            setError("Something went wrong. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-900 text-white">
                    <div>
                        <h3 className="text-xl font-bold">Schedule Inspection</h3>
                        <p className="text-blue-200 text-xs mt-1 truncate max-w-[300px]">{propertyTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h4>
                            <p className="text-gray-500">We'll confirm your visit time via email shortly.</p>
                            <button
                                onClick={onClose}
                                className="mt-8 w-full py-4 bg-blue-900 text-white rounded-2xl font-bold hover:scale-[1.02] transition-all"
                            >
                                Close Window
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                                    <X className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Preferred Date"
                                    type="date"
                                    required
                                    value={formData.visitDate}
                                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                />
                                <FormInput
                                    label="Preferred Time"
                                    type="time"
                                    required
                                    value={formData.visitTime}
                                    onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                                />
                            </div>
                            <FormTextArea
                                label="Special Requirements (Optional)"
                                placeholder="Any specific details you'd like to mention..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg text-blue-900">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    Inspectors are available Mon-Sat, 9AM to 6PM. Requests outside these hours may be rescheduled.
                                </p>
                            </div>
                            <FormButton
                                type="submit"
                                loading={loading}
                                className="w-full h-14 text-lg"
                                icon={<CalendarIcon className="w-5 h-5" />}
                            >
                                Confirm Request
                            </FormButton>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
