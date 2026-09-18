/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
    User, 
    Mail, 
    Lock, 
    Shield, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    KeyRound, 
    ShieldCheck, 
    Eye,
    EyeOff
} from "lucide-react";

interface UserProfile {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
}

export default function SuperAdminProfilePage() {
    const { data: session, update } = useSession();
    const [profile, setProfile] = useState<UserProfile>({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (data.success && data.data) {
                setProfile(prev => ({
                    ...prev,
                    name: data.data.name || "",
                    email: data.data.email || ""
                }));
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setMessage({ type: "error", text: "Failed to load superadmin profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        if (profile.password) {
            if (profile.password.length < 6) {
                setMessage({ type: "error", text: "New password must be at least 6 characters long." });
                setSaving(false);
                return;
            }
            if (profile.password !== profile.confirmPassword) {
                setMessage({ type: "error", text: "Passwords do not match." });
                setSaving(false);
                return;
            }
        }

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            const data = await res.json();
            if (data.success) {
                setProfile(prev => ({
                    ...prev,
                    name: data.data.name,
                    email: data.data.email,
                    password: "",
                    confirmPassword: ""
                }));
                await update({});
                setMessage({ type: "success", text: "SuperAdmin profile updated successfully!" });
            } else {
                setMessage({ type: "error", text: data.error || "Failed to update profile." });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: "error", text: "Network error while saving profile." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                        <Shield className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">SuperAdmin Profile</h1>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-900 uppercase tracking-widest border border-blue-200">
                                Root Desk
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Manage your super administrator identity, security credentials, and access preferences.</p>
                    </div>
                </div>
            </div>

            {/* Notification Alert */}
            {message.text && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in ${
                    message.type === "success" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-rose-50 border-rose-200 text-rose-800"
                }`}>
                    {message.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Account Info & Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                                <User className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-gray-900">Identity Overview</h2>
                        </div>

                        <div className="flex flex-col items-center text-center p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-900/10 mb-3">
                                {profile.name ? profile.name.charAt(0).toUpperCase() : "S"}
                            </div>
                            <h3 className="text-base font-bold text-gray-900">{profile.name || "Super Admin"}</h3>
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{profile.email}</p>
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                                <span>Root SuperAdmin</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                <span className="text-gray-500 font-medium">Access Tier</span>
                                <span className="font-bold text-gray-900">Global System Root</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                <span className="text-gray-500 font-medium">Tenant Isolation</span>
                                <span className="font-bold text-blue-900">Bypass / All Tenants</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                <span className="text-gray-500 font-medium">Account Status</span>
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Profile & Password Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
                                <p className="text-xs text-gray-500">Update your SuperAdmin display name and login email.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all font-medium"
                                        placeholder="Super Administrator"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Login Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all font-medium"
                                        placeholder="superadmin@propertynext.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Security Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                                <KeyRound className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Security & Password</h2>
                                <p className="text-xs text-gray-500">Leave blank if you do not wish to change your current password.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={profile.password}
                                        onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all font-medium"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={profile.confirmPassword}
                                        onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all font-medium"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/15 hover:shadow-blue-900/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Profile Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
