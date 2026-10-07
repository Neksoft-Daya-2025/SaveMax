
"use client";

import { useState } from "react";
import { Upload, X, FileText, Download, Eye } from "lucide-react";

interface DocumentUploadProps {
    documents: { name: string; url: string }[];
    onChange: (documents: { name: string; url: string }[]) => void;
}

export default function DocumentUpload({ documents, onChange }: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            // Prevent duplicates by URL
            if (documents.some(doc => doc.url === base64)) return;

            onChange([...documents, { name: file.name, url: base64 }]);
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

    const removeDocument = (index: number) => {
        const newDocs = documents.filter((_, i) => i !== index);
        onChange(newDocs);
    };

    return (
        <div className="space-y-4">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`
                    relative border-2 border-dashed transition-all duration-300 min-h-[150px] flex flex-col items-center justify-center p-6 rounded-2xl
                    ${isDragging ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-gray-50"}
                `}
            >
                <input
                    type="file"
                    multiple
                    onChange={onFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="text-center">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-1">
                        Upload Contract Documents
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        PDF, DOCX, Images (Max 10MB)
                    </p>
                </div>
            </div>

            {documents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]" title={doc.name}>
                                    {doc.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => removeDocument(index)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
