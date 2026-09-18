/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Building2, Home, Image as ImageIcon } from "lucide-react";
import FormInput, { FormSelect, FormButton } from "@/components/dashboard/FormInput";
import ImageUpload from "@/components/property/ImageUpload";

export default function CreateUnitPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [amenitiesList, setAmenitiesList] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    const [formData, setFormData] = useState({
        property: "",
        unitNumber: "",
        block: "",
        floor: "",
        type: "Apartment",
        price: "",
        areaSize: "",
        bedrooms: "",
        bathrooms: "",
        windows: "",
        status: "Available",
        features: [] as string[],
        images: [] as { url: string; isFeatured: boolean }[]
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/properties?limit=1000"); // Fetch all for dropdown
            const data = await res.json();
            if (data.success) {
                setProperties(data.data.map((p: any) => ({
                    value: p._id,
                    label: `${p.title} (${p.location?.city || 'No City'})`
                })));
            }

            // Fetch Amenities
            const amenityRes = await fetch("/api/amenities?status=Active");
            const amenityData = await amenityRes.json();
            if (amenityData.success) {
                setAmenitiesList(amenityData.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        }
    };

    const toggleAmenity = (name: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(name)
                ? prev.features.filter(f => f !== name)
                : [...prev.features, name]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            const res = await fetch("/api/units", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    areaSize: Number(formData.areaSize),
                    bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
                    bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
                    windows: formData.windows ? Number(formData.windows) : undefined
                }),
            });

            const data = await res.json();
            if (data.success) {
                router.push("/units");
            } else {
                setErrorMsg(data.error || "Failed to create unit");
            }
        } catch (error: any) {
            setErrorMsg(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="mb-6">
                <Link href="/units" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-2 text-sm font-medium">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Inventory
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Unit</h1>
                <p className="text-gray-500">Add an individual unit to an existing property/building.</p>
            </div>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="font-bold">Error:</span> {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                <div className="space-y-6">
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Parent Property
                        </h3>
                        <FormSelect
                            label="Select Building / Project"
                            value={formData.property}
                            onChange={(e: any) => setFormData({ ...formData, property: e.target.value })}
                            options={[
                                { value: "", label: "-- Select Property --" },
                                ...properties
                            ]}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            The unit will be associated with this main property/project.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput
                            label="Block / Tower"
                            placeholder="e.g. A"
                            value={formData.block}
                            onChange={(e: any) => setFormData({ ...formData, block: e.target.value })}
                        />
                        <FormInput
                            label="Floor Level"
                            placeholder="e.g. 5"
                            value={formData.floor}
                            onChange={(e: any) => setFormData({ ...formData, floor: e.target.value })}
                        />
                        <FormInput
                            label="Unit Number *"
                            placeholder="e.g. 101"
                            value={formData.unitNumber}
                            onChange={(e: any) => setFormData({ ...formData, unitNumber: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Unit Type"
                            value={formData.type}
                            onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { value: "Apartment", label: "Apartment" },
                                { value: "Studio", label: "Studio" },
                                { value: "Penthouse", label: "Penthouse" },
                                { value: "Villa", label: "Villa" },
                                { value: "Office", label: "Office" },
                                { value: "Shop", label: "Shop" }
                            ]}
                        />
                        <FormSelect
                            label="Current Status"
                            value={formData.status}
                            onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                            options={[
                                { value: "Available", label: "Available" },
                                { value: "Sold", label: "Sold" },
                                { value: "Rented", label: "Rented" },
                                { value: "Booked", label: "Booked" },
                                { value: "Reserved", label: "Reserved" }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Price ($) *"
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Area Size *"
                            type="number"
                            placeholder="sqft"
                            value={formData.areaSize}
                            onChange={(e: any) => setFormData({ ...formData, areaSize: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Bedrooms"
                            type="number"
                            placeholder="0"
                            value={formData.bedrooms}
                            onChange={(e: any) => setFormData({ ...formData, bedrooms: e.target.value })}
                        />
                        <FormInput
                            label="Bathrooms"
                            type="number"
                            placeholder="0"
                            value={formData.bathrooms}
                            onChange={(e: any) => setFormData({ ...formData, bathrooms: e.target.value })}
                        />
                        <FormInput
                            label="Windows"
                            type="number"
                            placeholder="0"
                            value={formData.windows}
                            onChange={(e: any) => setFormData({ ...formData, windows: e.target.value })}
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                            <Home className="w-4 h-4 text-blue-900" />
                            Unit Amenities
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                        ${formData.features.includes(amenity.name)
                                            ? "border-blue-900 bg-blue-50 text-blue-900"
                                            : "border-gray-100 hover:border-gray-300 text-gray-600"}
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.features.includes(amenity.name)}
                                        onChange={() => toggleAmenity(amenity.name)}
                                    />
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.features.includes(amenity.name) ? "bg-blue-900 border-blue-900" : "border-gray-300"}`}>
                                        {formData.features.includes(amenity.name) && <span className="text-[10px] text-white">✓</span>}
                                    </div>
                                    <span className="text-sm font-medium">{amenity.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-blue-900" />
                            Unit Gallery
                        </label>
                        <ImageUpload
                            images={formData.images}
                            onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                        />
                    </div>
                </div>


                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <FormButton
                        type="submit"
                        loading={loading}
                        icon={<Save className="w-5 h-5" />}
                    >
                        Save Unit Details
                    </FormButton>
                </div>
            </form >
        </div >
    );
}
