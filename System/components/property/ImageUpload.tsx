
"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";

interface ImageUploadProps {
    images: { url: string; isFeatured: boolean }[];
    onChange: (images: { url: string; isFeatured: boolean }[]) => void;
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            // Prevent duplicates
            if (images.some(img => img.url === base64)) return;

            onChange([...images, { url: base64, isFeatured: images.length === 0 }]);
        };
        reader.readAsDataURL(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        files.forEach(handleFile);
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach(handleFile);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        // If removed image was featured, make the first one featured
        if (images[index].isFeatured && newImages.length > 0) {
            newImages[0].isFeatured = true;
        }
        onChange(newImages);
    };

    const setFeatured = (index: number) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isFeatured: i === index
        }));
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`
                    relative border-2 border-dashed transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center p-8
                    ${isDragging ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-slate-50"}
                `}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={onFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="text-center">
                    <div className="w-12 h-12 bg-white flex items-center justify-center shadow-sm mx-auto mb-4">
                        <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">
                        Click or drag images here
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        Supports JPG, PNG, WEBP (Max 5MB each)
                    </p>
                </div>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="group relative aspect-square bg-slate-100 border border-slate-200 overflow-hidden">
                            <img src={img.url} alt={`Property ${index}`} className="w-full h-full object-cover" />

                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setFeatured(index)}
                                    className={`p-2 bg-white text-blue-600 transition-transform hover:scale-110 ${img.isFeatured ? "ring-2 ring-blue-600" : ""}`}
                                    title="Set as featured"
                                >
                                    <CheckCircle2 className={`w-4 h-4 ${img.isFeatured ? "fill-blue-600 text-white" : ""}`} />
                                </button>
                                <button
                                    onClick={() => removeImage(index)}
                                    className="p-2 bg-white text-red-600 transition-transform hover:scale-110"
                                    title="Remove image"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {img.isFeatured && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest">
                                    Main
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
