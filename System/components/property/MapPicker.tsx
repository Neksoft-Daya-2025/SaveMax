
"use client";

import { useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

interface MapPickerProps {
    coordinates: { lat: number; lng: number };
    onChange: (lat: number, lng: number) => void;
    address: string;
}

const mapContainerStyle = {
    width: "100%",
    height: "350px",
};

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060,
};

export default function MapPicker({ coordinates, onChange, address }: MapPickerProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: ['places']
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            onChange(e.latLng.lat(), e.latLng.lng());
        }
    }, [onChange]);

    const onLoad = useCallback(function callback(m: google.maps.Map) {
        setMap(m);
    }, []);

    const onUnmount = useCallback(function callback(m: google.maps.Map) {
        setMap(null);
    }, []);

    if (!apiKey) {
        return (
            <div className="bg-slate-50 border border-slate-200 p-8 text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Google Maps API Key Missing</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter max-w-xs mx-auto">
                    Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file to enable interactive map selection.
                </p>
                <div className="mt-6 p-4 bg-white border border-slate-100 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Coords</p>
                    <p className="text-xs font-bold text-slate-900">Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="h-[350px] bg-red-50 flex flex-col items-center justify-center text-red-600 p-4">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-sm font-bold">Error loading Google Maps</p>
            </div>
        );
    }

    return isLoaded ? (
        <div className="relative">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={coordinates.lat && coordinates.lng ? coordinates : defaultCenter}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onMapClick}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >
                {coordinates.lat && coordinates.lng && (
                    <Marker position={coordinates} />
                )}
            </GoogleMap>
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 shadow-lg flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Selected Location</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{address || "Click map to set point"}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Coords</p>
                    <p className="text-[10px] font-bold text-slate-900">{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</p>
                </div>
            </div>
        </div>
    ) : (
        <div className="h-[350px] bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );
}
