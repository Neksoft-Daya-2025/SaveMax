/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    Save,
    Home,
    MapPin,
    Image as ImageIcon,
    CheckCircle2,
    X,
    Upload,
    DollarSign,
    Tag,
    Globe,
    Search
} from "lucide-react";
import FormInput, { FormTextArea, FormSelect, FormButton } from "@/components/dashboard/FormInput";
import MapPicker from "@/components/property/MapPicker";
import AddressAutocomplete from "@/components/property/AddressAutocomplete";
import ImageUpload from "@/components/property/ImageUpload";
import Link from "next/link";

const STEPS = [
    { id: 1, title: "Basic Information", icon: Home },
    { id: 2, title: "Specs & Amenities", icon: Tag },
    { id: 3, title: "Location Details", icon: MapPin },
    { id: 4, title: "Media & Documents", icon: ImageIcon },
    { id: 5, title: "SEO Optimization", icon: Globe },
];

export default function EditPropertyPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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
        if (id) {
            fetchProperty();
            fetchUsers();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            const res = await fetch(`/api/properties/${id}`);
            const data = await res.json();
            if (data.success) {
                const p = data.data;
                setFormData({
                    title: p.title || "",
                    description: p.description || "",
                    propertyType: p.propertyType || "Apartment",
                    purpose: p.purpose || "Sale",
                    status: p.status || "Available",
                    price: p.price?.toString() || "",
                    isNegotiable: !!p.isNegotiable,
                    areaSize: p.areaSize?.toString() || "",
                    areaUnit: p.areaUnit || "sqft",
                    bedrooms: p.bedrooms?.toString() || "",
                    bathrooms: p.bathrooms?.toString() || "",
                    parking: p.parking?.toString() || "",
                    age: p.age?.toString() || "",
                    amenities: p.amenities || [],
                    location: {
                        address: p.location?.address || "",
                        city: p.location?.city || "",
                        state: p.location?.state || "",
                        country: p.location?.country || "USA",
                        zipCode: p.location?.zipCode || "",
                        coordinates: p.location?.coordinates || { lat: 0, lng: 0 }
                    },
                    images: p.images || [],
                    videos: p.videos || [],
                    documents: p.documents || [],
                    isFeatured: !!p.isFeatured,
                    isHot: !!p.isHot,
                    agent: p.agent?._id || p.agent || "",
                    owner: p.owner?._id || p.owner || "",
                    seo: {
                        metaTitle: p.seo?.metaTitle || "",
                        metaDescription: p.seo?.metaDescription || "",
                        keywords: p.seo?.keywords?.join(", ") || ""
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching property:", error);
        } finally {
            setFetching(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const agentRes = await fetch("/api/agents?limit=1000");
            const agentData = await agentRes.json();
            if (agentData.success) setAgents(agentData.data);

            const ownerRes = await fetch("/api/owners?limit=1000");
            const ownerData = await ownerRes.json();
            if (ownerData.success) setOwners(ownerData.data);

            const amenityRes = await fetch("/api/amenities?status=Active");
            const amenityData = await amenityRes.json();
            if (amenityData.success) setAmenitiesList(amenityData.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                seo: {
                    ...formData.seo,
                    keywords: formData.seo.keywords.split(',').map(k => k.trim()).filter(k => k !== "")
                }
            };



            const res = await fetch(`/api/properties/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/properties");
            }
        } catch (error) {
            console.error("Error updating property:", error);
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

    const commonAmenities = ["Swimming Pool", "Gym", "Security", "Parking", "Elevator", "Garden", "WiFi", "Air Conditioning"];

    if (fetching) return <div className="p-8 text-center text-gray-500">Loading property details...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                <p className="text-gray-500">Update property listing information</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="flex items-center gap-3 flex-1 last:flex-none">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                ${isActive ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20" :
                                    isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}
                            `}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <div className="hidden lg:block">
                                <p className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-blue-900" : "text-gray-400"}`}>
                                    Step {step.id}
                                </p>
                                <p className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                                    {step.title}
                                </p>
                            </div>
                            {step.id < STEPS.length && (
                                <div className="hidden md:block flex-1 h-[2px] bg-gray-100 mx-4" />
                            )}
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-black">
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
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-black">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-4">Amenities</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {amenitiesList.length === 0 && (
                                        <p className="col-span-full text-sm text-gray-500 italic py-4 bg-gray-50 rounded-xl text-center border border-dashed">
                                            No active amenities found.
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
                                            <span className="text-sm font-medium">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-black">
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
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-black">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                                <FormSelect
                                    label="Assign Agent"
                                    value={formData.agent}
                                    onChange={(e: any) => setFormData({ ...formData, agent: e.target.value })}
                                    options={[
                                        { value: "", label: "-- No Agent --" },
                                        ...agents.map((a: any) => ({ value: a._id, label: a.name || a.email }))
                                    ]}
                                />
                                <FormSelect
                                    label="Property Owner"
                                    value={formData.owner}
                                    onChange={(e: any) => setFormData({ ...formData, owner: e.target.value })}
                                    options={[
                                        { value: "", label: "-- No Owner --" },
                                        ...owners.map((o: any) => ({ value: o._id, label: o.name || o.email }))
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-tight">Property Gallery</label>
                                <ImageUpload
                                    images={formData.images}
                                    onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                                />
                            </div>

                            <div className="flex flex-wrap gap-4 pt-6 text-black">
                                <label className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-50 border border-yellow-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                                        checked={formData.isFeatured}
                                        onChange={(e: any) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-yellow-900">Mark as Featured</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                                        checked={formData.isHot}
                                        onChange={(e: any) => setFormData({ ...formData, isHot: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-red-900">Mark as Hot Property</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-black">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                                <Globe className="w-5 h-5 text-blue-900" />
                                Search Engine Optimization
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
                    )}
                </div>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`
                            flex items-center px-6 py-2.5 rounded-xl font-bold transition-all
                            ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}
                        `}
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>

                    {currentStep < STEPS.length ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="bg-blue-900 text-white px-8 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-all"
                        >
                            Next Step
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                    ) : (
                        <FormButton
                            type="submit"
                            loading={loading}
                            icon={<Save className="w-5 h-5" />}
                        >
                            Update Property
                        </FormButton>
                    )}
                </div>
            </form >
        </div >
    );
}
