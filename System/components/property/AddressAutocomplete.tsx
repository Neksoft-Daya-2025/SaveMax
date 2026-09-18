/* Developed by RUDRA via NEKLLM */

"use client";

import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { useState, useRef } from "react";
import FormInput from "@/components/dashboard/FormInput";

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string, lat: number, lng: number, city: string, state: string, zip: string, country: string) => void;
}

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function AddressAutocomplete({ value, onChange }: AddressAutocompleteProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: libraries
    });

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();

            const address = place.formatted_address || "";
            const lat = place.geometry?.location?.lat() || 0;
            const lng = place.geometry?.location?.lng() || 0;

            let city = "";
            let state = "";
            let zip = "";
            let country = "";

            place.address_components?.forEach(component => {
                const types = component.types;
                if (types.includes("locality")) city = component.long_name;
                if (types.includes("administrative_area_level_1")) state = component.short_name;
                if (types.includes("postal_code")) zip = component.long_name;
                if (types.includes("country")) country = component.long_name;
            });

            onChange(address, lat, lng, city, state, zip, country);
        }
    };

    return (
        <div className="w-full">
            {isLoaded ? (
                <Autocomplete
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                >
                    <FormInput
                        label="Address (Google Search)"
                        placeholder="Search for an address..."
                        value={value}
                        onChange={(e: any) => onChange(e.target.value, 0, 0, "", "", "", "")}
                        required
                    />
                </Autocomplete>
            ) : (
                <FormInput
                    label="Address"
                    placeholder="Enter street address"
                    value={value}
                    onChange={(e: any) => onChange(e.target.value, 0, 0, "", "", "", "")}
                    required
                />
            )}
        </div>
    );
}
