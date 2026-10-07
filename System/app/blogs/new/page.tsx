
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    ChevronLeft,
    Save,
    Globe,
    Search,
    Tag,
    Image as ImageIcon,
    Layout,
    Eye,
    Type,
    Settings
} from "lucide-react";
import Link from "next/link";
import FormInput, { FormSelect, FormButton, FormTextArea } from "@/components/dashboard/FormInput";

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('content'); // 'content' | 'seo'

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "Market Insights",
        content: "",
        excerpt: "",
        thumbnail: "",
        status: "Draft",
        isFeatured: false,
        seo: {
            metaTitle: "",
            metaDescription: "",
            keywords: ""
        }
    });

    const handleTitleChange = (title: string) => {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData({ ...formData, title, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Split keywords string to array
            const payload = {
                ...formData,
                seo: {
                    ...formData.seo,
                    keywords: formData.seo.keywords.split(',').map(k => k.trim())
                }
            };

            const res = await fetch("/api/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/blogs");
            } else {
                alert(data.error || "Error creating blog post");
            }
        } catch (error) {
            console.error("Error creating blog post:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/blogs" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Article</h1>
                        <p className="text-sm text-gray-500">Publish property guides and company news</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-100 mb-8 p-1 bg-gray-50 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4" />
                        Editor
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'seo' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        SEO & Meta
                    </div>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'content' ? (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <FormInput
                                label="Article Title"
                                placeholder="e.g. 5 Tips for First-Time Home Buyers in 2026"
                                required
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Custom Slug"
                                    placeholder="auto-generated-slug"
                                    value={formData.slug}
                                    onChange={(e: any) => setFormData({ ...formData, slug: e.target.value })}
                                />
                                <FormSelect
                                    label="Category"
                                    value={formData.category}
                                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                                    options={[
                                        { label: "Market Insights", value: "Market Insights" },
                                        { label: "Buying Guide", value: "Buying Guide" },
                                        { label: "Selling Guide", value: "Selling Guide" },
                                        { label: "Company News", value: "Company News" },
                                        { label: "Local Community", value: "Local Community" }
                                    ]}
                                />
                            </div>

                            <FormTextArea
                                label="Post Content (Markdown supported)"
                                rows={15}
                                required
                                placeholder="Start writing your masterpiece..."
                                value={formData.content}
                                onChange={(e: any) => setFormData({ ...formData, content: e.target.value })}
                            />

                            <FormTextArea
                                label="Excerpt / Summary"
                                rows={3}
                                placeholder="Brief overview for the listing page..."
                                value={formData.excerpt}
                                onChange={(e: any) => setFormData({ ...formData, excerpt: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                                <Globe className="w-5 h-5 text-blue-900" />
                                Search Engine Optimization
                            </h3>

                            <FormInput
                                label="Meta Title (Max 60 chars)"
                                placeholder="Highly relevant SEO title..."
                                value={formData.seo.metaTitle}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    seo: { ...formData.seo, metaTitle: e.target.value }
                                })}
                            />

                            <FormTextArea
                                label="Meta Description (Max 160 chars)"
                                rows={3}
                                placeholder="What will show up in Google search results..."
                                value={formData.seo.metaDescription}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    seo: { ...formData.seo, metaDescription: e.target.value }
                                })}
                            />

                            <FormInput
                                label="Keywords (Comma separated)"
                                placeholder="real estate, buying tips, 2026 market..."
                                value={formData.seo.keywords}
                                onChange={(e: any) => setFormData({
                                    ...formData,
                                    seo: { ...formData.seo, keywords: e.target.value }
                                })}
                            />

                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                                <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">Google Preview</p>
                                <h4 className="text-xl font-black text-[#1a0dab] line-clamp-1">
                                    {formData.seo.metaTitle || formData.title || "Your Meta Title Here"}
                                </h4>
                                <p className="text-sm text-[#006621] line-clamp-1">https://property-next.com/blog/{formData.slug}</p>
                                <p className="text-xs text-[#545454] line-clamp-2">
                                    {formData.seo.metaDescription || formData.excerpt || "Your meta description will appear here to provide users a summary of the page content."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Publishing</h3>

                        <FormSelect
                            label="Post Status"
                            value={formData.status}
                            onChange={(e: any) => setFormData({ ...formData, status: e.target.value as any })}
                            options={[
                                { label: "Draft", value: "Draft" },
                                { label: "Published", value: "Published" },
                                { label: "Archived", value: "Archived" }
                            ]}
                        />

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-bold text-gray-700">Featured Post</span>
                            </div>
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded-lg border-gray-200 text-blue-900"
                                checked={formData.isFeatured}
                                onChange={(e: any) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                        </div>

                        <FormButton
                            type="submit"
                            loading={loading}
                            className="w-full h-14 !rounded-2xl shadow-xl shadow-blue-900/10"
                            icon={<Save className="w-5 h-5" />}
                        >
                            Save Article
                        </FormButton>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Thumbnail</h3>

                        <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center">
                            {formData.thumbnail ? (
                                <img src={formData.thumbnail} className="w-full h-full object-cover rounded-xl" alt="" />
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 opacity-20" />
                                    <p className="text-[10px] font-bold">Image URL Required</p>
                                </>
                            )}
                        </div>

                        <FormInput
                            label="Upload Image URL"
                            placeholder="https://images.unsplash.com/..."
                            value={formData.thumbnail}
                            onChange={(e: any) => setFormData({ ...formData, thumbnail: e.target.value })}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
