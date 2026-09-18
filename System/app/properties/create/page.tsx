/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Save,
    Home,
    MapPin,
    Image as ImageIcon,
    CheckCircle2,
    X,
    Tag,
    Globe,
    Info
} from "lucide-react";
import FormInput, { FormTextArea, FormSelect, FormButton } from "@/components/dashboard/FormInput";
import ImageUpload from "@/components/property/ImageUpload";

export default function CreatePropertyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [agents, setAgents] = useState([]);
    const [owners, setOwners] = useState([]);
    const [amenitiesList, setAmenitiesList] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        propertyType: "Apartment",
        purpose: "Sale",
        status: "Available",
        price: "",
        isNegotiable: false,
        areaSize: "",
        areaUnit: "sqft",
        bedrooms: "",
        bathrooms: "",
        parking: "",
        age: "",
        amenities: [] as string[],
        location: {
            address: "",
            city: "",
            state: "",
            country: "USA",
            zipCode: "",
            coordinates: { lat: 0, lng: 0 }
        },
        images: [] as any[],
        videos: [] as any[],
        documents: [] as any[],
        isFeatured: false,
        isHot: false,
        agent: "",
        owner: "",
        seo: {
            metaTitle: "",
            metaDescription: "",
            keywords: ""
        }
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch Agents - using the same endpoint as agents page
            const agentRes = await fetch("/api/agents?limit=1000");
            const agentData = await agentRes.json();
            if (agentData.success) {
                setAgents(agentData.data || []);
            }

            // Fetch Owners - using the same endpoint as owners page
            const ownerRes = await fetch("/api/owners?limit=1000");
            const ownerData = await ownerRes.json();
            if (ownerData.success) {
                setOwners(ownerData.data || []);
            }

            // Fetch Amenities
            const amenityRes = await fetch("/api/amenities?status=Active");
            const amenityData = await amenityRes.json();
            if (amenityData.success) {
                setAmenitiesList(amenityData.data || []);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            setErrorMsg("");
            const payload = {
                ...formData,
                price: formData.price ? Number(formData.price) : undefined,
                areaSize: formData.areaSize ? Number(formData.areaSize) : undefined,
                bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
                bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
                parking: formData.parking ? Number(formData.parking) : undefined,
                age: formData.age ? Number(formData.age) : undefined,
                agent: formData.agent || undefined,
                owner: formData.owner || undefined,
                seo: {
                    ...formData.seo,
                    keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(k => k !== "")
                }
            };

            const res = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/properties");
            } else {
                setErrorMsg(data.error || "Failed to create property");
            }
        } catch (error: any) {
            console.error("Error creating property:", error);
            setErrorMsg(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData((prev: any) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a: any) => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 text-gray-900">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-blue-955 tracking-tight">Add New Property</h1>
                <p className="text-sm text-gray-500 font-semibold mt-1">List a new property in the system by filling out the details below</p>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <X className="w-5 h-5 bg-red-100 rounded-full p-1 cursor-pointer" onClick={() => setErrorMsg("")} />
                    <p className="font-medium">{errorMsg}</p>
                </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Basic Information */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-gray-950 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Home className="w-5 h-5 text-blue-650" /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormInput
                                label="Property Title"
                                placeholder="e.g. Modern Villa with Sea View"
                                value={formData.title}
                                onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <FormTextArea
                                label="Description"
                                placeholder="Detailed description of the property..."
                                rows={5}
                                value={formData.description}
                                onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                        <FormSelect
                            label="Property Type"
                            value={formData.propertyType}
                            onChange={(e: any) => setFormData({ ...formData, propertyType: e.target.value })}
                            options={[
                                { value: "Apartment", label: "Apartment" },
                                { value: "House", label: "House" },
                                { value: "Villa", label: "Villa" },
                                { value: "Land", label: "Land" },
                                { value: "Commercial", label: "Commercial" },
                                { value: "Office", label: "Office" },
                                { value: "Shop", label: "Shop" }
                            ]}
                        />
                        <FormSelect
                            label="Purpose"
                            value={formData.purpose}
                            onChange={(e: any) => setFormData({ ...formData, purpose: e.target.value })}
                            options={[
                                { value: "Sale", label: "For Sale" },
                                { value: "Rent", label: "For Rent" },
                                { value: "Lease", label: "For Lease" }
                            ]}
                        />
                        <FormInput
                            label="Price ($)"
                            type="number"
                            placeholder="Enter amount"
                            value={formData.price}
                            onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <FormSelect
                            label="Status"
                            value={formData.status}
                            onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                            options={[
                                { value: "Available", label: "Available" },
                                { value: "Sold", label: "Sold" },
                                { value: "Rented", label: "Rented" },
                                { value: "Booked", label: "Booked" },
                                { value: "Pending", label: "Pending" }
                            ]}
                        />
                    </div>
                </div>

                {/* 2. Specs & Amenities */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-gray-955 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Tag className="w-5 h-5 text-blue-650" /> Specs & Amenities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput
                            label="Area Size"
                            type="number"
                            placeholder="e.g. 1500"
                            value={formData.areaSize}
                            onChange={(e: any) => setFormData({ ...formData, areaSize: e.target.value })}
                            required
                        />
                        <FormSelect
                            label="Area Unit"
                            value={formData.areaUnit}
                            onChange={(e: any) => setFormData({ ...formData, areaUnit: e.target.value })}
                            options={[
                                { value: "sqft", label: "Sq Ft" },
                                { value: "sqm", label: "Sq M" }
                            ]}
                        />
                        <FormInput
                            label="Bedrooms"
                            type="number"
                            placeholder="Count"
                            value={formData.bedrooms}
                            onChange={(e: any) => setFormData({ ...formData, bedrooms: e.target.value })}
                        />
                        <FormInput
                            label="Bathrooms"
                            type="number"
                            placeholder="Count"
                            value={formData.bathrooms}
                            onChange={(e: any) => setFormData({ ...formData, bathrooms: e.target.value })}
                        />
                        <FormInput
                            label="Parking"
                            type="number"
                            placeholder="Spots"
                            value={formData.parking}
                            onChange={(e: any) => setFormData({ ...formData, parking: e.target.value })}
                        />
                        <FormInput
                            label="Property Age"
                            type="number"
                            placeholder="Years"
                            value={formData.age}
                            onChange={(e: any) => setFormData({ ...formData, age: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-950 mb-4">Amenities</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {amenitiesList.length === 0 && (
                                <p className="col-span-full text-sm text-gray-500 italic py-4 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
                                    No active amenities found. <Link href="/amenities" className="text-blue-600 font-bold hover:underline">Add some here.</Link>
                                </p>
                            )}
                            {amenitiesList.map((amenity: any) => (
                                <label
                                    key={amenity._id}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.amenities.includes(amenity.name)
                                            ? "border-blue-900 bg-blue-50 text-blue-900"
                                            : "border-gray-100 hover:border-gray-300 text-gray-600"}
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.amenities.includes(amenity.name)}
                                        onChange={() => toggleAmenity(amenity.name)}
                                    />
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${formData.amenities.includes(amenity.name) ? "bg-blue-900 border-blue-900" : "border-gray-300"}`}>
                                        {formData.amenities.includes(amenity.name) && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className="text-sm font-semibold">{amenity.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Location Details */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-gray-955 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <MapPin className="w-5 h-5 text-blue-650" /> Location Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <FormInput
                                label="Address"
                                placeholder="Full street address"
                                value={formData.location.address}
                                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                                required
                            />
                        </div>
                        <FormInput
                            label="City"
                            placeholder="e.g. New York"
                            value={formData.location.city}
                            onChange={(e: any) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                            required
                        />
                        <FormInput
                            label="State / Province"
                            placeholder="e.g. NY"
                            value={formData.location.state}
                            onChange={(e: any) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                        />
                        <FormInput
                            label="ZIP Code"
                            placeholder="e.g. 10001"
                            value={formData.location.zipCode}
                            onChange={(e: any) => setFormData({ ...formData, location: { ...formData.location, zipCode: e.target.value } })}
                        />
                        <FormInput
                            label="Country"
                            value={formData.location.country}
                            onChange={(e: any) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                        />
                    </div>
                </div>

                {/* 4. Media & Assignment */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-gray-955 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <ImageIcon className="w-5 h-5 text-blue-650" /> Media & Assignment
                    </h3>
                    
                    {/* Assign People */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                        <div>
                            <FormSelect
                                label="Assign Agent (Optional)"
                                value={formData.agent}
                                onChange={(e: any) => setFormData({ ...formData, agent: e.target.value })}
                                options={[
                                    { value: "", label: "-- No Agent --" },
                                    ...agents.map((a: any) => ({
                                        value: a._id,
                                        label: a.name || a.email
                                    }))
                                ]}
                            />
                            {agents.length === 0 && (
                                <p className="mt-2 text-xs text-slate-500 font-semibold">
                                    No agents available. <Link href="/agents" className="text-blue-650 font-bold hover:underline">Create an agent</Link> first.
                                </p>
                            )}
                        </div>
                        <div>
                            <FormSelect
                                label="Property Owner (Optional)"
                                value={formData.owner}
                                onChange={(e: any) => setFormData({ ...formData, owner: e.target.value })}
                                options={[
                                    { value: "", label: "-- No Owner --" },
                                    ...owners.map((o: any) => ({
                                        value: o._id,
                                        label: o.name || o.email
                                    }))
                                ]}
                            />
                            {owners.length === 0 && (
                                <p className="mt-2 text-xs text-slate-500 font-semibold">
                                    No owners available. <Link href="/owners" className="text-blue-650 font-bold hover:underline">Create an owner</Link> first.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-4 uppercase tracking-tight">Property Gallery</label>
                        <ImageUpload
                            images={formData.images}
                            onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                        />
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap gap-4 pt-6">
                        <label className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-50/50 border border-yellow-250 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 cursor-pointer"
                                checked={formData.isFeatured}
                                onChange={(e: any) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            />
                            <span className="text-sm font-bold text-yellow-900">Mark as Featured</span>
                        </label>
                        <label className="flex items-center gap-3 p-4 rounded-2xl bg-red-50/50 border border-red-250 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-red-500 rounded focus:ring-red-500 cursor-pointer"
                                checked={formData.isHot}
                                onChange={(e: any) => setFormData({ ...formData, isHot: e.target.checked })}
                            />
                            <span className="text-sm font-bold text-red-900">Mark as Hot Property</span>
                        </label>
                    </div>
                </div>

                {/* 5. SEO Optimization */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-gray-955 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Globe className="w-5 h-5 text-blue-650" /> SEO Optimization
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                        <FormInput
                            label="Meta Title (Max 60 chars)"
                            placeholder="e.g. Luxury 3BHK Apartment for Sale in Downtown NYC"
                            value={formData.seo.metaTitle}
                            onChange={(e) => setFormData({
                                ...formData,
                                seo: { ...formData.seo, metaTitle: e.target.value }
                            })}
                        />

                        <FormTextArea
                            label="Meta Description (Max 160 chars)"
                            rows={3}
                            placeholder="Detailed overview for search engine result pages..."
                            value={formData.seo.metaDescription}
                            onChange={(e) => setFormData({
                                ...formData,
                                seo: { ...formData.seo, metaDescription: e.target.value }
                            })}
                        />

                        <FormInput
                            label="Target Keywords (Comma separated)"
                            placeholder="apartment nyc, luxury living, buy property usa..."
                            value={formData.seo.keywords}
                            onChange={(e) => setFormData({
                                ...formData,
                                seo: { ...formData.seo, keywords: e.target.value }
                            })}
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <Link
                        href="/properties"
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
                    >
                        Cancel
                    </Link>
                    <FormButton
                        type="submit"
                        loading={loading}
                        icon={<Save className="w-5 h-5" />}
                    >
                        Save Property
                    </FormButton>
                </div>
            </form>
        </div>
    );
}
