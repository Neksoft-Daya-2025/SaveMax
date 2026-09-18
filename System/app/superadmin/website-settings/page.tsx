/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect, useRef } from "react";
import {
    Globe,
    HelpCircle,
    Star,
    Save,
    Plus,
    Edit,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Layers,
    Sparkles,
    Eye,
    EyeOff,
    Check,
    MessageSquare,
    DollarSign,
    Zap,
    Briefcase,
    Building2,
    ExternalLink,
    Search,
    ChevronDown,
    ChevronUp,
    Upload,
    Image as ImageIcon,
    X
} from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import FormInput, { FormButton } from "@/components/dashboard/FormInput";

interface FAQItem {
    _id: string;
    question: string;
    answer: string;
    category?: string;
    order: number;
    isActive: boolean;
    createdAt?: string;
}

interface ReviewItem {
    _id: string;
    author: string;
    role: string;
    company?: string;
    units?: string;
    content: string;
    rating: number;
    avatarUrl?: string;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    createdAt?: string;
}

export default function WebsiteSettingsPage() {
    const [activeTab, setActiveTab] = useState<"sections" | "faqs" | "reviews">("sections");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Section Content State
    const [landingPage, setLandingPage] = useState({
        // Brand & Header Identity
        logoUrl: "",
        brandTitle: "SaveMAX",
        brandBadge: "CLOUD",
        brandSubtitle: "All-in-One Multi-Tenant PMS",

        // Hero
        badgeText: "Next-Generation Multi-Tenant SaaS Property Management",
        heroTitle: "Manage Properties, Leases & Teams in One Cloud Workspace",
        heroSubtitle: "The all-in-one multi-tenant SaaS operating system built for real estate enterprises, property managers, agents, and landlords. Complete with automated rent collection, lease tracking, maintenance dispatch, and dynamic role delegation.",
        primaryCtaText: "Start Free Trial (14-Day Free Trial)",
        secondaryCtaText: "Explore Plans",

        // Metrics
        metrics: [
            { val: "99.99%", label: "Cloud SLA & Uptime Guarantee" },
            { val: "500+", label: "Organizations Powered" },
            { val: "50,000+", label: "Units & Leases Managed" },
            { val: "$120M+", label: "Annual Rent Facilitated" },
        ],

        // Features
        featuresBadge: "Enterprise Grade Architecture",
        featuresTitle: "Everything Your Organization Needs to Scale",
        featuresSubtitle: "Engineered with multi-tenant isolation, automated financial ledgers, and intelligent maintenance dispatch.",

        // Modules
        modulesBadge: "Feature Spectrum",
        modulesTitle: "Complete Suite of Real Estate Tools",
        modulesSubtitle: "No third-party plugins needed. Everything you need is integrated directly into your organization dashboard.",

        // Pricing
        pricingBadge: "Transparent SaaS Pricing",
        pricingTitle: "Simple, Predictable Subscription Plans",
        pricingSubtitle: "Start with a 14-day free trial. Scale seamlessly as your property portfolio expands.",

        // Registration
        registrationBadge: "Instant Multi-Tenant Workspace Provisioning",
        registrationTitle: "Create Your Organization Workspace",
        registrationSubtitle: "Get started with your 14-day free trial. No credit card required. Isolated tenant database, custom branding, and automatic 3-tier roles setup.",

        // Testimonials
        testimonialsBadge: "Client Endorsements",
        testimonialsTitle: "Trusted by Forward-Thinking Property Leaders",
        testimonialsSubtitle: "See how real estate organizations streamline their daily operations with SaveMAX.",

        // FAQ
        faqBadge: "Got Questions?",
        faqTitle: "Frequently Asked Questions",
        faqSubtitle: "Everything you need to know about the platform, onboarding, and multi-tenancy.",

        // CTA Banner
        ctaBannerTitle: "Ready to Supercharge Your Real Estate Organization?",
        ctaBannerSubtitle: "Join hundreds of property management leaders. Set up your organization in minutes.",
        ctaBannerButtonText: "Start Free Trial (Free Trial)",

        // Footer
        footerDescription: "The next-generation multi-tenant cloud operating system for real estate enterprises, property managers, agents, and landlords worldwide.",
        footerCopyright: "SaveMAX Platform. All rights reserved.",
    });

    // FAQs State
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
    const [faqForm, setFaqForm] = useState({
        question: "",
        answer: "",
        category: "General",
        order: 0,
        isActive: true,
    });

    // Reviews State
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
    const [reviewForm, setReviewForm] = useState({
        author: "",
        role: "",
        company: "",
        units: "",
        content: "",
        rating: 5,
        avatarUrl: "",
        order: 0,
        isActive: true,
        isFeatured: true,
    });

    // Initial Load
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [settingsRes, faqsRes, reviewsRes] = await Promise.all([
                fetch("/api/superadmin/website-settings"),
                fetch("/api/superadmin/faqs"),
                fetch("/api/superadmin/reviews"),
            ]);

            const settingsData = await settingsRes.json();
            const faqsData = await faqsRes.json();
            const reviewsData = await reviewsRes.json();

            if (settingsData.success && settingsData.data?.landingPage) {
                setLandingPage((prev) => ({
                    ...prev,
                    ...settingsData.data.landingPage,
                    metrics: settingsData.data.landingPage.metrics || prev.metrics,
                }));
            }

            if (faqsData.success) {
                setFaqs(faqsData.data || []);
            }

            if (reviewsData.success) {
                setReviews(reviewsData.data || []);
            }
        } catch (err: any) {
            console.error("Error loading website settings:", err);
            setErrorMsg("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    // Logo Upload State & Handlers
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const [logoUploadError, setLogoUploadError] = useState("");

    const processLogoFile = (file: File) => {
        setLogoUploadError("");
        if (!file.type.startsWith("image/")) {
            setLogoUploadError("Please upload a valid image file (PNG, SVG, JPG, or WebP).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setLogoUploadError("Logo file size exceeds 5MB limit. Please choose a smaller image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setLandingPage((prev) => ({ ...prev, logoUrl: base64 }));
        };
        reader.onerror = () => {
            setLogoUploadError("Failed to read the image file.");
        };
        reader.readAsDataURL(file);
    };

    const handleLogoDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingLogo(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processLogoFile(file);
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processLogoFile(file);
        if (e.target) e.target.value = "";
    };

    const handleRemoveLogo = () => {
        setLandingPage((prev) => ({ ...prev, logoUrl: "" }));
        setLogoUploadError("");
        if (logoInputRef.current) logoInputRef.current.value = "";
    };

    // Save Section Titles & Content
    const handleSaveSections = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            const res = await fetch("/api/superadmin/website-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ landingPage }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccessMsg("Landing page sections updated successfully!");
                setTimeout(() => setSuccessMsg(""), 4000);
            } else {
                setErrorMsg(data.error || "Failed to update landing page sections.");
            }
        } catch (err: any) {
            setErrorMsg("Network error saving website settings.");
        } finally {
            setSaving(false);
        }
    };

    // FAQ Handlers
    const openCreateFaq = () => {
        setEditingFaq(null);
        setFaqForm({
            question: "",
            answer: "",
            category: "General",
            order: faqs.length,
            isActive: true,
        });
        setIsFaqModalOpen(true);
    };

    const openEditFaq = (faq: FAQItem) => {
        setEditingFaq(faq);
        setFaqForm({
            question: faq.question,
            answer: faq.answer,
            category: faq.category || "General",
            order: faq.order || 0,
            isActive: faq.isActive,
        });
        setIsFaqModalOpen(true);
    };

    const handleSaveFaq = async () => {
        if (!faqForm.question.trim() || !faqForm.answer.trim()) {
            alert("Question and Answer are required.");
            return;
        }

        try {
            const url = editingFaq ? `/api/superadmin/faqs/${editingFaq._id}` : "/api/superadmin/faqs";
            const method = editingFaq ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(faqForm),
            });

            const data = await res.json();
            if (data.success) {
                setIsFaqModalOpen(false);
                setEditingFaq(null);
                const faqsRes = await fetch("/api/superadmin/faqs");
                const faqsData = await faqsRes.json();
                if (faqsData.success) setFaqs(faqsData.data);
            } else {
                alert(data.error || "Failed to save FAQ");
            }
        } catch (err) {
            alert("Error saving FAQ");
        }
    };

    const handleDeleteFaq = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ item?")) return;

        try {
            const res = await fetch(`/api/superadmin/faqs/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setFaqs(faqs.filter((f) => f._id !== id));
            } else {
                alert(data.error || "Failed to delete FAQ");
            }
        } catch (err) {
            alert("Error deleting FAQ");
        }
    };

    const handleToggleFaqStatus = async (faq: FAQItem) => {
        try {
            const res = await fetch(`/api/superadmin/faqs/${faq._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !faq.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                setFaqs(faqs.map((f) => (f._id === faq._id ? { ...f, isActive: !f.isActive } : f)));
            }
        } catch (err) {
            console.error("Error toggling FAQ status:", err);
        }
    };

    // Review Handlers
    const openCreateReview = () => {
        setEditingReview(null);
        setReviewForm({
            author: "",
            role: "",
            company: "",
            units: "",
            content: "",
            rating: 5,
            avatarUrl: "",
            order: reviews.length,
            isActive: true,
            isFeatured: true,
        });
        setIsReviewModalOpen(true);
    };

    const openEditReview = (review: ReviewItem) => {
        setEditingReview(review);
        setReviewForm({
            author: review.author,
            role: review.role,
            company: review.company || "",
            units: review.units || "",
            content: review.content,
            rating: review.rating || 5,
            avatarUrl: review.avatarUrl || "",
            order: review.order || 0,
            isActive: review.isActive,
            isFeatured: review.isFeatured !== false,
        });
        setIsReviewModalOpen(true);
    };

    const handleSaveReview = async () => {
        if (!reviewForm.author.trim() || !reviewForm.role.trim() || !reviewForm.content.trim()) {
            alert("Author name, role, and review content are required.");
            return;
        }

        try {
            const url = editingReview ? `/api/superadmin/reviews/${editingReview._id}` : "/api/superadmin/reviews";
            const method = editingReview ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewForm),
            });

            const data = await res.json();
            if (data.success) {
                setIsReviewModalOpen(false);
                setEditingReview(null);
                const reviewsRes = await fetch("/api/superadmin/reviews");
                const reviewsData = await reviewsRes.json();
                if (reviewsData.success) setReviews(reviewsData.data);
            } else {
                alert(data.error || "Failed to save Review");
            }
        } catch (err) {
            alert("Error saving review");
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer review?")) return;

        try {
            const res = await fetch(`/api/superadmin/reviews/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setReviews(reviews.filter((r) => r._id !== id));
            } else {
                alert(data.error || "Failed to delete review");
            }
        } catch (err) {
            alert("Error deleting review");
        }
    };

    const handleToggleReviewStatus = async (review: ReviewItem) => {
        try {
            const res = await fetch(`/api/superadmin/reviews/${review._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !review.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                setReviews(reviews.map((r) => (r._id === review._id ? { ...r, isActive: !r.isActive } : r)));
            }
        } catch (err) {
            console.error("Error toggling review status:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-indigo-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm font-medium text-slate-500">Loading website & CMS settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
                        <Globe className="w-4 h-4" />
                        <span>Public Content Management</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        Website & Landing Page Settings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage section titles, subtitles, FAQ questions, and customer testimonials for the SaaS landing page.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold shadow-sm transition-all"
                    >
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                        <span>View Live Landing Page</span>
                    </a>
                </div>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-medium">{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="font-medium">{errorMsg}</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
                <button
                    type="button"
                    onClick={() => setActiveTab("sections")}
                    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold border-b-2 transition-all ${
                        activeTab === "sections"
                            ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Section Titles & Subtitles</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("faqs")}
                    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold border-b-2 transition-all ${
                        activeTab === "faqs"
                            ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                    <HelpCircle className="w-4 h-4" />
                    <span>FAQ Module ({faqs.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("reviews")}
                    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold border-b-2 transition-all ${
                        activeTab === "reviews"
                            ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                            : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                    <Star className="w-4 h-4" />
                    <span>Reviews & Testimonials ({reviews.length})</span>
                </button>
            </div>

            {/* ================= TAB 1: SECTION TITLES & CONTENT ================= */}
            {activeTab === "sections" && (
                <form onSubmit={handleSaveSections} className="space-y-8">
                    {/* Brand & Header Identity Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Brand Logo, Title & Header Subtitle</h2>
                                <p className="text-xs text-gray-500">Configure the top navigation brand identity and footer branding displayed on the SaaS landing page.</p>
                            </div>
                        </div>

                        {/* Live Preview Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Live Header Preview</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Matches Live Navbar</span>
                            </div>
                            <div className="pt-2 flex items-center gap-3">
                                {landingPage.logoUrl ? (
                                    <img
                                        src={landingPage.logoUrl}
                                        alt={landingPage.brandTitle || "Brand Logo"}
                                        className="w-11 h-11 object-contain rounded-xl shadow-lg shadow-indigo-500/25 bg-slate-900 border border-slate-700"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-white tracking-tight">
                                            {landingPage.brandTitle || "SaveMAX"}
                                        </span>
                                        {landingPage.brandBadge && (
                                            <span className="text-[11px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/25 text-indigo-300 border border-indigo-500/40">
                                                {landingPage.brandBadge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">
                                        {landingPage.brandSubtitle || "All-in-One Multi-Tenant PMS"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Brand Title / Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. SaveMAX"
                                    value={landingPage.brandTitle}
                                    onChange={(e) => setLandingPage({ ...landingPage, brandTitle: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none font-semibold text-gray-900"
                                />
                                <span className="text-[11px] text-gray-400 mt-1 block">The main brand text in the top navbar and footer.</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Badge Text</label>
                                <input
                                    type="text"
                                    placeholder="e.g. CLOUD or SAAS"
                                    value={landingPage.brandBadge}
                                    onChange={(e) => setLandingPage({ ...landingPage, brandBadge: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none font-bold uppercase text-indigo-600"
                                />
                                <span className="text-[11px] text-gray-400 mt-1 block">Badge next to the brand name (e.g. CLOUD, PRO, ENTERPRISE).</span>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subtitle / Tagline</label>
                                <input
                                    type="text"
                                    placeholder="e.g. All-in-One Multi-Tenant PMS"
                                    value={landingPage.brandSubtitle}
                                    onChange={(e) => setLandingPage({ ...landingPage, brandSubtitle: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none text-gray-700"
                                />
                                <span className="text-[11px] text-gray-400 mt-1 block">Sub-headline displayed directly under the brand name.</span>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Brand Logo Upload
                                </label>
                                
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                                    onChange={handleLogoSelect}
                                    className="hidden"
                                />

                                {landingPage.logoUrl ? (
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-sm">
                                                <img
                                                    src={landingPage.logoUrl}
                                                    alt="Brand Logo"
                                                    className="w-full h-full object-contain rounded-lg"
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">Custom Logo Active</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        Ready & Live
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    This custom logo is displayed on the landing page header, footer, and emails.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current?.click()}
                                                className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                <Upload className="w-3.5 h-3.5 text-gray-500" />
                                                <span>Change Logo</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                                <span>Remove & Use Default Icon</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                                        onDragLeave={() => setIsDraggingLogo(false)}
                                        onDrop={handleLogoDrop}
                                        onClick={() => logoInputRef.current?.click()}
                                        className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                            isDraggingLogo
                                                ? "border-indigo-600 bg-indigo-50/60"
                                                : "border-gray-200 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/20"
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-sm">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-800">
                                                Click to upload or drag & drop brand logo
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Supports PNG, SVG, JPG, or WebP (Max 5MB • Transparent PNG recommended)
                                            </p>
                                            <p className="text-[11px] text-indigo-600 font-medium pt-1">
                                                If left empty, the built-in modern gradient Building2 icon is displayed automatically.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {logoUploadError && (
                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{logoUploadError}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hero Section Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Hero Header Section</h2>
                                <p className="text-xs text-gray-500">Main headline, badge, and call-to-action text at the top of the landing page.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Badge Text</label>
                                <input
                                    type="text"
                                    value={landingPage.badgeText}
                                    onChange={(e) => setLandingPage({ ...landingPage, badgeText: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Hero Main Title (H1)</label>
                                <input
                                    type="text"
                                    value={landingPage.heroTitle}
                                    onChange={(e) => setLandingPage({ ...landingPage, heroTitle: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none font-semibold text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Hero Subtitle Description</label>
                                <textarea
                                    rows={3}
                                    value={landingPage.heroSubtitle}
                                    onChange={(e) => setLandingPage({ ...landingPage, heroSubtitle: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none text-gray-700 leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Primary CTA Button</label>
                                    <input
                                        type="text"
                                        value={landingPage.primaryCtaText}
                                        onChange={(e) => setLandingPage({ ...landingPage, primaryCtaText: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Secondary CTA Button</label>
                                    <input
                                        type="text"
                                        value={landingPage.secondaryCtaText}
                                        onChange={(e) => setLandingPage({ ...landingPage, secondaryCtaText: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Metrics (4 KPIs) */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Platform Metrics & Social Proof</h2>
                                <p className="text-xs text-gray-500">Key metrics shown in the metrics bar below the hero preview.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {landingPage.metrics?.map((metric, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                                    <span className="text-xs font-bold text-indigo-600">Metric #{idx + 1}</span>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Display Value</label>
                                        <input
                                            type="text"
                                            value={metric.val}
                                            onChange={(e) => {
                                                const updated = [...landingPage.metrics];
                                                updated[idx].val = e.target.value;
                                                setLandingPage({ ...landingPage, metrics: updated });
                                            }}
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Metric Label</label>
                                        <input
                                            type="text"
                                            value={metric.label}
                                            onChange={(e) => {
                                                const updated = [...landingPage.metrics];
                                                updated[idx].label = e.target.value;
                                                setLandingPage({ ...landingPage, metrics: updated });
                                            }}
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features & Modules Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Features */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-gray-900">Features Section</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
                                    <input
                                        type="text"
                                        value={landingPage.featuresBadge}
                                        onChange={(e) => setLandingPage({ ...landingPage, featuresBadge: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={landingPage.featuresTitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, featuresTitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
                                    <textarea
                                        rows={2}
                                        value={landingPage.featuresSubtitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, featuresSubtitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modules */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-gray-900">Modules Spectrum Section</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
                                    <input
                                        type="text"
                                        value={landingPage.modulesBadge}
                                        onChange={(e) => setLandingPage({ ...landingPage, modulesBadge: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={landingPage.modulesTitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, modulesTitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
                                    <textarea
                                        rows={2}
                                        value={landingPage.modulesSubtitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, modulesSubtitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Registration Sections */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pricing */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-gray-900">Pricing Section Header</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
                                    <input
                                        type="text"
                                        value={landingPage.pricingBadge}
                                        onChange={(e) => setLandingPage({ ...landingPage, pricingBadge: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={landingPage.pricingTitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, pricingTitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
                                    <textarea
                                        rows={2}
                                        value={landingPage.pricingSubtitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, pricingSubtitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Registration Form Header */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-gray-900">Organization Registration Section</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
                                    <input
                                        type="text"
                                        value={landingPage.registrationBadge}
                                        onChange={(e) => setLandingPage({ ...landingPage, registrationBadge: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={landingPage.registrationTitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, registrationTitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
                                    <textarea
                                        rows={2}
                                        value={landingPage.registrationSubtitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, registrationSubtitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonials & FAQ Section Headers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Testimonials Header */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Star className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-gray-900">Testimonials Section Header</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
                                    <input
                                        type="text"
                                        value={landingPage.testimonialsBadge}
                                        onChange={(e) => setLandingPage({ ...landingPage, testimonialsBadge: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={landingPage.testimonialsTitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, testimonialsTitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
                                    <textarea
                                        rows={2}
                                        value={landingPage.testimonialsSubtitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, testimonialsSubtitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FAQ Header */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-gray-900">FAQ Section Header</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Badge</label>
                                    <input
                                        type="text"
                                        value={landingPage.faqBadge}
                                        onChange={(e) => setLandingPage({ ...landingPage, faqBadge: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        value={landingPage.faqTitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, faqTitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Subtitle</label>
                                    <textarea
                                        rows={2}
                                        value={landingPage.faqSubtitle}
                                        onChange={(e) => setLandingPage({ ...landingPage, faqSubtitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Banner & Footer */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Bottom CTA Banner & Footer</h2>
                                <p className="text-xs text-gray-500">Closing call-to-action banner and global footer text.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">CTA Banner Title</label>
                                <input
                                    type="text"
                                    value={landingPage.ctaBannerTitle}
                                    onChange={(e) => setLandingPage({ ...landingPage, ctaBannerTitle: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">CTA Banner Button Text</label>
                                <input
                                    type="text"
                                    value={landingPage.ctaBannerButtonText}
                                    onChange={(e) => setLandingPage({ ...landingPage, ctaBannerButtonText: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">CTA Banner Subtitle</label>
                                <input
                                    type="text"
                                    value={landingPage.ctaBannerSubtitle}
                                    onChange={(e) => setLandingPage({ ...landingPage, ctaBannerSubtitle: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Footer Brand Tagline/Description</label>
                                <input
                                    type="text"
                                    value={landingPage.footerDescription}
                                    onChange={(e) => setLandingPage({ ...landingPage, footerDescription: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Footer Copyright Text</label>
                                <input
                                    type="text"
                                    value={landingPage.footerCopyright}
                                    onChange={(e) => setLandingPage({ ...landingPage, footerCopyright: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="sticky bottom-6 z-20 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{saving ? "Saving Changes..." : "Save All Section Settings"}</span>
                        </button>
                    </div>
                </form>
            )}

            {/* ================= TAB 2: FAQ MANAGEMENT MODULE ================= */}
            {activeTab === "faqs" && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
                            <p className="text-xs text-gray-500">Manage accordion items displayed on the landing page FAQ section.</p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateFaq}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New FAQ</span>
                        </button>
                    </div>

                    {faqs.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-white border border-gray-200 text-gray-500 space-y-3">
                            <HelpCircle className="w-10 h-10 mx-auto text-gray-400" />
                            <p className="text-base font-semibold text-gray-700">No FAQ questions created yet.</p>
                            <p className="text-xs text-gray-400">Add your first question to populate the landing page FAQ accordion.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <div
                                    key={faq._id}
                                    className={`p-5 rounded-2xl bg-white border transition-all ${
                                        faq.isActive ? "border-gray-200 shadow-sm" : "border-gray-200 opacity-60 bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    #{faq.order !== undefined ? faq.order : index + 1} • {faq.category || "General"}
                                                </span>
                                                {!faq.isActive && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                                                        Inactive (Hidden)
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900">{faq.question}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFaqStatus(faq)}
                                                className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                                                    faq.isActive
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                                title={faq.isActive ? "Click to disable" : "Click to enable"}
                                            >
                                                {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openEditFaq(faq)}
                                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all"
                                                title="Edit FAQ"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteFaq(faq._id)}
                                                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                title="Delete FAQ"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ================= TAB 3: REVIEWS & TESTIMONIALS MODULE ================= */}
            {activeTab === "reviews" && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Customer Reviews & Endorsements</h2>
                            <p className="text-xs text-gray-500">Manage customer testimonials and star ratings displayed on the landing page.</p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateReview}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Testimonial</span>
                        </button>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="p-12 text-center rounded-2xl bg-white border border-gray-200 text-gray-500 space-y-3">
                            <Star className="w-10 h-10 mx-auto text-gray-400" />
                            <p className="text-base font-semibold text-gray-700">No testimonials added yet.</p>
                            <p className="text-xs text-gray-400">Add client quotes and endorsements to display on the SaaS landing page.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((rev) => (
                                <div
                                    key={rev._id}
                                    className={`p-6 rounded-2xl bg-white border flex flex-col justify-between space-y-5 transition-all ${
                                        rev.isActive ? "border-gray-200 shadow-sm" : "border-gray-200 opacity-60 bg-gray-50"
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1 text-amber-400">
                                                {[...Array(rev.rating || 5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {!rev.isActive && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                                                        Hidden
                                                    </span>
                                                )}
                                                {rev.units && (
                                                    <span className="text-[11px] font-bold text-indigo-600 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                                                        {rev.units}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-700 italic leading-relaxed">
                                            "{rev.content}"
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">{rev.author}</h4>
                                            <p className="text-xs text-gray-500">{rev.role}{rev.company ? ` • ${rev.company}` : ""}</p>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleReviewStatus(rev)}
                                                className={`p-1.5 rounded-lg border text-xs transition-all ${
                                                    rev.isActive
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                        : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                                title={rev.isActive ? "Disable" : "Enable"}
                                            >
                                                {rev.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openEditReview(rev)}
                                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteReview(rev._id)}
                                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ================= FAQ MODAL ================= */}
            <Modal
                isOpen={isFaqModalOpen}
                onClose={() => setIsFaqModalOpen(false)}
                title={editingFaq ? "Edit FAQ Item" : "Add New FAQ Item"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Question <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. How does multi-tenancy work?"
                            value={faqForm.question}
                            onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Answer <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            required
                            placeholder="Provide a clear, helpful response..."
                            value={faqForm.answer}
                            onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 leading-relaxed"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Category</label>
                            <input
                                type="text"
                                placeholder="General, Billing, etc."
                                value={faqForm.category}
                                onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Display Order</label>
                            <input
                                type="number"
                                value={faqForm.order}
                                onChange={(e) => setFaqForm({ ...faqForm, order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="faqIsActive"
                            checked={faqForm.isActive}
                            onChange={(e) => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <label htmlFor="faqIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                            Active (Show on live landing page)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsFaqModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <FormButton onClick={handleSaveFaq}>
                            {editingFaq ? "Save Changes" : "Create FAQ"}
                        </FormButton>
                    </div>
                </div>
            </Modal>

            {/* ================= REVIEW MODAL ================= */}
            <Modal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                title={editingReview ? "Edit Testimonial" : "Add New Testimonial"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Author Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Marcus Vance"
                                value={reviewForm.author}
                                onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Role / Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Managing Director"
                                value={reviewForm.role}
                                onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Company Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Vance & Co Properties"
                                value={reviewForm.company}
                                onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Units / Portfolio Badge</label>
                            <input
                                type="text"
                                placeholder="e.g. 320 Units"
                                value={reviewForm.units}
                                onChange={(e) => setReviewForm({ ...reviewForm, units: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Star Rating (1-5)
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                                >
                                    <Star
                                        className={`w-6 h-6 ${
                                            star <= reviewForm.rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="text-xs font-bold text-gray-600 ml-2">{reviewForm.rating} Stars</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Testimonial Quote <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Quote describing how the platform helped their real estate operations..."
                            value={reviewForm.content}
                            onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="reviewIsActive"
                            checked={reviewForm.isActive}
                            onChange={(e) => setReviewForm({ ...reviewForm, isActive: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <label htmlFor="reviewIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                            Active (Show on live landing page)
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setIsReviewModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <FormButton onClick={handleSaveReview}>
                            {editingReview ? "Save Changes" : "Create Testimonial"}
                        </FormButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
