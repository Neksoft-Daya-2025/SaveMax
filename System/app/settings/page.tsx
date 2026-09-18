/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, Store, Mail, Phone, MapPin, DollarSign, Percent, Image as ImageIcon, Globe, FileText, CreditCard, MessageSquare, Send, Bell, Sparkles, Database, Clock } from "lucide-react";
import FormInput, { FormSelect, FormButton } from "@/components/dashboard/FormInput";
import { getAllCurrencies } from "@/lib/currency";
import { getAllTimezones } from "@/lib/timezones";
import SearchableSelect from "@/components/dashboard/SearchableSelect";
import PermissionGate from "@/components/PermissionGate";

interface Settings {
    storeName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    currency: string;
    timezone: string;
    taxRate: number;
    logoUrl: string;
    businessHours: string;
    receiptFooter: string;
    termsAndConditions: string;

    // SMS Settings
    smsEnabled: boolean;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioPhoneNumber: string;
    // Email Settings
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPassword: string;
    smtpFrom: string;
    // AI Settings
    aiEnabled: boolean;
    openaiApiKey: string;
    openaiModel: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        storeName: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        taxId: "",
        currency: "USD",
        timezone: "UTC",
        taxRate: 0,
        logoUrl: "",
        businessHours: "Mon-Fri: 9:00 AM - 6:00 PM",
        receiptFooter: "Thank you for your business!",
        termsAndConditions: "",
        // SMS Settings
        smsEnabled: false,
        twilioAccountSid: "",
        twilioAuthToken: "",
        twilioPhoneNumber: "",
        // Email Settings
        emailEnabled: false,
        smtpHost: "",
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: "",
        smtpPassword: "",
        smtpFrom: "",
        // AI Settings
        aiEnabled: false,
        openaiApiKey: "",
        openaiModel: "gpt-4o"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });


    const currencies = useMemo(() => getAllCurrencies(), []);
    const timezones = useMemo(() => getAllTimezones(), []);

    const currencyOptions = useMemo(() => {
        return currencies.map((c) => ({
            value: c.code,
            label: `${c.code} - ${c.name}`,
            subLabel: `Symbol: ${c.symbol} (${c.symbolNative || c.symbol})`,
            badge: c.symbol,
        }));
    }, [currencies]);

    const timezoneOptions = useMemo(() => {
        return timezones.map((tz) => ({
            value: tz.value,
            label: tz.label,
            subLabel: `Region: ${tz.region} • Offset: GMT${tz.offset}`,
            badge: `GMT${tz.offset}`,
        }));
    }, [timezones]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.success) {
                // Merge fetched data with defaults to ensure all fields exist
                setSettings({
                    storeName: data.data.storeName || "",
                    address: data.data.address || "",
                    phone: data.data.phone || "",
                    email: data.data.email || "",
                    website: data.data.website || "",
                    taxId: data.data.taxId || "",
                    currency: data.data.currency || "USD",
                    timezone: data.data.timezone || "UTC",
                    taxRate: data.data.taxRate || 0,
                    logoUrl: data.data.logoUrl || "",
                    businessHours: data.data.businessHours || "Mon-Fri: 9:00 AM - 6:00 PM",
                    receiptFooter: data.data.receiptFooter || "Thank you for your business!",
                    termsAndConditions: data.data.termsAndConditions || "",

                    // SMS Settings
                    smsEnabled: data.data.smsEnabled || false,
                    twilioAccountSid: data.data.twilioAccountSid || "",
                    twilioAuthToken: data.data.twilioAuthToken || "",
                    twilioPhoneNumber: data.data.twilioPhoneNumber || "",
                    // Email Settings
                    emailEnabled: data.data.emailEnabled || false,
                    smtpHost: data.data.smtpHost || "",
                    smtpPort: data.data.smtpPort || 587,
                    smtpSecure: data.data.smtpSecure || false,
                    smtpUser: data.data.smtpUser || "",
                    smtpPassword: data.data.smtpPassword || "",
                    smtpFrom: data.data.smtpFrom || "",
                    // AI Settings
                    aiEnabled: data.data.aiEnabled || false,
                    openaiApiKey: data.data.openaiApiKey || "",
                    openaiModel: data.data.openaiModel || "gpt-4o"
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ type: "error", text: "Failed to load settings" });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadBackup = () => {
        try {
            setMessage({ type: "", text: "" });
            // Let the browser handle the download in a new tab/window,
            // so the current page doesn't show any loading state.
            window.open("/api/settings/backup", "_blank");
        } catch (error) {
            console.error("Error opening backup download:", error);
            setMessage({ type: "error", text: "Failed to start database backup download" });
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
                setMessage({ type: "success", text: "Settings saved successfully!" });
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("settings-updated", { detail: data.data }));
                }
            } else {
                setMessage({ type: "error", text: data.error || "Failed to save settings" });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ type: "error", text: "Failed to save settings" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
                <p className="text-gray-500">Manage your store details and configuration</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-900" />
                        General Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        <FormInput
                            label="Store Name"
                            value={settings.storeName}
                            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                            required
                            placeholder="e.g. SaveMAX"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Store Logo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setSettings({ ...settings, logoUrl: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        {settings.logoUrl && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Preview</label>
                                <div className="flex items-center gap-4">
                                    <img src={settings.logoUrl} alt="Store Logo" className="h-20 object-contain border rounded p-2" />
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, logoUrl: "" })}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove Logo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-900" />
                        Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Phone Number"
                            value={settings.phone}
                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                            placeholder="+1 234 567 890"
                        />
                        <FormInput
                            label="Email Address"
                            value={settings.email}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            type="email"
                            placeholder="contact@store.com"
                        />
                        <FormInput
                            label="Website"
                            value={settings.website}
                            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                            placeholder="https://www.yourstore.com"
                        />
                        <FormInput
                            label="Business Hours"
                            value={settings.businessHours}
                            onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                            placeholder="Mon-Fri: 9:00 AM - 6:00 PM"
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                label="Address"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-900" />
                        Business Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        <FormInput
                            label="Tax ID / Registration Number"
                            value={settings.taxId}
                            onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                            placeholder="e.g. 123-456-789"
                        />
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-900" />
                        Financial Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableSelect
                            label="Currency"
                            value={settings.currency || "USD"}
                            onChange={(val) => setSettings({ ...settings, currency: val })}
                            options={currencyOptions}
                            placeholder="Search & select currency..."
                            searchPlaceholder="Type currency code, name, or symbol..."
                            icon={<DollarSign className="w-4 h-4" />}
                        />

                        <SearchableSelect
                            label="Timezone"
                            value={settings.timezone || "UTC"}
                            onChange={(val) => setSettings({ ...settings, timezone: val })}
                            options={timezoneOptions}
                            placeholder="Search & select timezone..."
                            searchPlaceholder="Type city, country, or GMT offset..."
                            icon={<Clock className="w-4 h-4" />}
                        />
                        <FormInput
                            label="Default Tax Rate (%)"
                            value={settings.taxRate.toString()}
                            onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                            type="number"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Receipt Customization */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-900" />
                        Receipt Customization
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Receipt Footer Message
                            </label>
                            <input
                                type="text"
                                value={settings.receiptFooter}
                                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                placeholder="Thank you for your business!"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Terms and Conditions
                            </label>
                            <textarea
                                value={settings.termsAndConditions}
                                onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                placeholder="Enter your terms and conditions..."
                            />
                        </div>
                    </div>
                </div>

                {/* SMS Settings (Twilio) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-900" />
                        SMS Settings (Twilio)
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <input
                                type="checkbox"
                                id="smsEnabled"
                                checked={settings.smsEnabled}
                                onChange={(e) => setSettings({ ...settings, smsEnabled: e.target.checked })}
                                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900"
                            />
                            <label htmlFor="smsEnabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Enable SMS Notifications
                            </label>
                        </div>
                        {settings.smsEnabled && (
                            <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-blue-200">
                                <FormInput
                                    label="Twilio Account SID"
                                    value={settings.twilioAccountSid}
                                    onChange={(e) => setSettings({ ...settings, twilioAccountSid: e.target.value })}
                                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                />
                                <FormInput
                                    label="Twilio Auth Token"
                                    type="password"
                                    value={settings.twilioAuthToken}
                                    onChange={(e) => setSettings({ ...settings, twilioAuthToken: e.target.value })}
                                    placeholder="Your Twilio Auth Token"
                                />
                                <FormInput
                                    label="Twilio Phone Number"
                                    value={settings.twilioPhoneNumber}
                                    onChange={(e) => setSettings({ ...settings, twilioPhoneNumber: e.target.value })}
                                    placeholder="+1234567890"
                                />
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800">
                                        <strong>Note:</strong> Get your Twilio credentials from <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="underline">Twilio Console</a>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Settings (SMTP) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-900" />
                        Email Settings (SMTP)
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                            <input
                                type="checkbox"
                                id="emailEnabled"
                                checked={settings.emailEnabled}
                                onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900"
                            />
                            <label htmlFor="emailEnabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Enable Email Notifications
                            </label>
                        </div>
                        {settings.emailEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-green-200">
                                <FormInput
                                    label="SMTP Host"
                                    value={settings.smtpHost}
                                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                    placeholder="smtp.gmail.com"
                                />
                                <FormInput
                                    label="SMTP Port"
                                    type="number"
                                    value={settings.smtpPort.toString()}
                                    onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                                    placeholder="587"
                                />
                                <FormInput
                                    label="SMTP Username"
                                    value={settings.smtpUser}
                                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                                    placeholder="your_email@gmail.com"
                                />
                                <FormInput
                                    label="SMTP Password"
                                    type="password"
                                    value={settings.smtpPassword}
                                    onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                                    placeholder="Your app password"
                                />
                                <div className="md:col-span-2">
                                    <FormInput
                                        label="From Email Address"
                                        value={settings.smtpFrom}
                                        onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                                        placeholder='"Your Property" <noreply@yourproperty.com>'
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="smtpSecure"
                                        checked={settings.smtpSecure}
                                        onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                                        className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900"
                                    />
                                    <label htmlFor="smtpSecure" className="text-sm text-gray-700 cursor-pointer">
                                        Use SSL/TLS (Enable for port 465, disable for port 587)
                                    </label>
                                </div>
                                <div className="md:col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800">
                                        <strong>Gmail Users:</strong> Use port 587, enable 2FA, and generate an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline">App Password</a>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-900" />
                        AI Power Reporting Settings
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <input
                                type="checkbox"
                                id="aiEnabled"
                                checked={settings.aiEnabled}
                                onChange={(e) => setSettings({ ...settings, aiEnabled: e.target.checked })}
                                className="w-4 h-4 text-blue-900 rounded focus:ring-blue-900"
                            />
                            <label htmlFor="aiEnabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Enable AI Powered Insights & Reporting
                            </label>
                        </div>
                        {settings.aiEnabled && (
                            <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-purple-200">
                                <FormInput
                                    label="OpenAI API Key"
                                    type="password"
                                    value={settings.openaiApiKey}
                                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                                    placeholder="sk-..."
                                />
                                <FormSelect
                                    label="OpenAI Model"
                                    value={settings.openaiModel}
                                    onChange={(e: any) => setSettings({ ...settings, openaiModel: e.target.value })}
                                    options={[
                                        { value: "gpt-4o", label: "GPT-4o (Recommended)" },
                                        { value: "gpt-4o-mini", label: "GPT-4o Mini (Faster/Cheaper)" },
                                        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
                                        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
                                    ]}
                                />
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800">
                                        <strong>Note:</strong> Your API key is stored securely. Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Dashboard</a>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Database Backup */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-900" />
                        Database Backup
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Download a JSON backup of your entire database. Keep this file safe and do not share it publicly.
                    </p>
                    <PermissionGate resource="settings" action="edit">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDownloadBackup();
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
                        >
                            <Database className="w-4 h-4" />
                            Download Backup
                        </button>
                    </PermissionGate>
                </div>

                <div className="flex justify-end">
                    <PermissionGate resource="settings" action="edit">
                        <FormButton
                            type="submit"
                            loading={saving}
                            icon={<Save className="w-5 h-5" />}
                        >
                            Save Settings
                        </FormButton>
                    </PermissionGate>
                </div>
            </form>
        </div>
    );
}
