/* Developed by RUDRA via NEKLLM */
"use client";

import { useState } from "react";
import {
  Calendar, Clock, User, Mail, Phone, MessageSquare,
  CheckCircle2, AlertCircle, Loader2, Send, Sparkles, Building2
} from "lucide-react";

interface BookingFormProps {
  propertyId: string;
  propertyTitle: string;
  units?: { _id: string; unitNumber: string; type?: string; floor?: number; price?: number }[];
  defaultUnitId?: string;
}

export default function BookingForm({ propertyId, propertyTitle, units = [], defaultUnitId = "" }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    visitDate: "",
    visitTime: "",
    unitId: defaultUnitId,
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          unitId: formData.unitId || undefined,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          visitDate: formData.visitDate,
          visitTime: formData.visitTime,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", visitDate: "", visitTime: "", unitId: defaultUnitId, message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  // Get tomorrow's date as the minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (status === "success") {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h4 className="text-xl font-black">Booking Confirmed!</h4>
          <p className="text-indigo-200 text-sm font-medium leading-relaxed">
            Your visit request has been submitted successfully. We&apos;ll confirm the details via email shortly.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all backdrop-blur-sm border border-white/10"
          >
            Book Another Visit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Schedule a Visit</span>
          </div>
          <h4 className="text-lg font-black text-white">Book a Property Tour</h4>
          <p className="text-xs text-indigo-200 font-medium mt-1">
            Fill in your details and we&apos;ll arrange a viewing for you.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Error Message */}
        {status === "error" && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Name */}
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 8900"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Visit Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="date"
                name="visitDate"
                required
                min={minDate}
                value={formData.visitDate}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Visit Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <input
                type="time"
                name="visitTime"
                required
                value={formData.visitTime}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Unit Selection (if units exist) */}
        {units.length > 0 && (
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Preferred Unit
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
              <select
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 focus:bg-white transition-all appearance-none"
              >
                <option value="">Any available unit</option>
                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    Unit {unit.unitNumber} {unit.type ? `· ${unit.type}` : ""} {unit.floor ? `· Floor ${unit.floor}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Message
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-300" />
            <textarea
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Any special requests or questions..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-900/20 focus:border-indigo-900 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full py-4 rounded-xl bg-indigo-900 text-white font-black text-sm hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Book Your Visit
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-300 text-center font-medium leading-relaxed">
          By submitting, you agree to be contacted regarding this property.
          We&apos;ll never share your information with third parties.
        </p>
      </form>
    </div>
  );
}
