/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Calendar,
    User,
    Tag,
    Globe,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";
import PermissionGate from "@/components/PermissionGate";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/blogs");
            const data = await res.json();
            if (data.success) {
                setBlogs(data.data);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-700';
            case 'Draft': return 'bg-yellow-100 text-yellow-700';
            case 'Archived': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                    <p className="text-gray-500">Manage property guides, news, and market insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <PermissionGate resource="cms" action="create">
                        <Link
                            href="/blogs/new"
                            className="inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/10 font-bold"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Blog Post
                        </Link>
                    </PermissionGate>
                </div>
            </div>

            {/* Content Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Posts", value: blogs.length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Published", value: blogs.filter((b: any) => b.status === 'Published').length, icon: Globe, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Drafts", value: blogs.filter((b: any) => b.status === 'Draft').length, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
                    { label: "Featured", value: blogs.filter((b: any) => b.isFeatured).length, icon: Tag, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <div className={`p-2 ${stat.bg} ${stat.color} rounded-lg`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Blogs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, category or author..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto text-black">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-[0.1em]">
                                <th className="px-6 py-4">Article</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Author</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">
                                        No blog posts found
                                    </td>
                                </tr>
                            ) : blogs.map((blog: any) => (
                                <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {blog.thumbnail ? (
                                                <img src={blog.thumbnail} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{blog.title}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{blog.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                                            {blog.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-3 h-3" />
                                            </div>
                                            {blog.author?.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(blog.status)}`}>
                                            {blog.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <PermissionGate resource="cms" action="edit">
                                                <Link href={`/blogs/edit/${blog._id}`} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </PermissionGate>
                                            <PermissionGate resource="cms" action="delete">
                                                <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-red-600 shadow-sm transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </PermissionGate>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
