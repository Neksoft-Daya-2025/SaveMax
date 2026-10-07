
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    User,
    Mail,
    Phone,
    Home,
    DollarSign,
    CheckCircle2,
    Clock,
    Award,
    ChevronLeft,
    TrendingUp,
    Calendar,
    Briefcase,
    Shield,
    MapPin,
    ArrowUpRight,
    Star
} from "lucide-react";
import Link from "next/link";

export default function AgentDetailPage() {
    const params = useParams();
    const { id } = params;
    const [agent, setAgent] = useState<any>(null);
    const [listings, setListings] = useState([]);
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchAgentData();
    }, [id]);

    const fetchAgentData = async () => {
        try {
            // Fetch Agent Profile
            const agentRes = await fetch(`/api/users/${id}`);
            const agentData = await agentRes.json();
            if (agentData.success) setAgent(agentData.data);

            // Fetch Agent's commissions
            const commRes = await fetch(`/api/commissions?agent=${id}`);
            const commData = await commRes.json();
            if (commData.success) setCommissions(commData.data);

            // Fetch Agent's properties
            const propRes = await fetch(`/api/properties?agent=${id}`);
            const propData = await propRes.json();
            if (propData.success) setListings(propData.data);

        } catch (error) {
            console.error("Error fetching agent data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;
    if (!agent) return <div className="p-8 text-center text-red-500">Agent not found</div>;

    return (
        <div className="space-y-8 pb-12">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link href="/agents" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
                    <p className="text-sm text-gray-500">Member since {new Date(agent.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Bio & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center">
                        <div className="w-32 h-32 rounded-3xl bg-blue-900 mx-auto mb-6 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-900/40">
                            {agent.name?.[0]}
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">{agent.name}</h2>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">
                            {agent.agentDetails?.specialization?.[0] || 'Senior Broker'}
                        </p>

                        <div className="flex justify-center gap-1 mt-4">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-left">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{agent.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-left">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm font-bold text-gray-900">{agent.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Career Stats
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Total Sales Volume", value: "$4.2M", icon: DollarSign },
                                { label: "Closure Rate", value: "92%", icon: Award },
                                { label: "Client Satisf.", value: "4.8/5", icon: Star },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-xl">
                                            <stat.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm text-blue-100 font-medium">{stat.label}</span>
                                    </div>
                                    <span className="text-lg font-black">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Listings & Commissions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                    <Home className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-1 rounded">Active</span>
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Current Listings</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">{listings.length}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">Total Earnings</span>
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Paid Commissions</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-1">
                                ${commissions.filter((c: any) => c.status === 'Paid').reduce((acc, curr: any) => acc + curr.amount, 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>

                    {/* Commissions Table */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Earning History</h3>
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                        <th className="px-6 py-4">Transaction / Property</th>
                                        <th className="px-6 py-4">Rate</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {commissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm italic">No commission records found</td>
                                        </tr>
                                    ) : commissions.map((comm: any) => (
                                        <tr key={comm._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900">{comm.property?.title}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">{comm.type}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-blue-600">{comm.rate}%</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-gray-900">${comm.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${comm.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        comm.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {comm.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">
                                                {new Date(comm.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
