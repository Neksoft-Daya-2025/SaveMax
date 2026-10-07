"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrencySymbol } from "@/lib/currency";
import {
    formatDate as formatWithTz,
    formatDateTime as formatDateTimeWithTz,
    formatTime as formatTimeWithTz,
    getDateInTimezone,
    clearCachedTimezone
} from "@/lib/dateUtils";

interface Settings {
    storeName: string;
    currency: string;
    timezone: string;
    [key: string]: any;
}

interface SettingsContextType {
    settings: Settings | null;
    isLoading: boolean;
    timezone: string;
    formatCurrency: (amount: number) => string;
    formatDate: (date: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
    formatDateTime: (date: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
    formatTime: (date: string | Date | number | null | undefined, includeSeconds?: boolean) => string;
    getCurrentDate: () => string;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    isLoading: true,
    timezone: "UTC",
    formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
    formatDate: (date) => formatWithTz(date, "UTC"),
    formatDateTime: (date) => formatDateTimeWithTz(date, "UTC"),
    formatTime: (date) => formatTimeWithTz(date, "UTC"),
    getCurrentDate: () => getDateInTimezone(new Date(), "UTC"),
    refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export default function SettingsProvider({
    children,
    initialSettings,
}: {
    children: React.ReactNode;
    initialSettings?: Settings | null;
}) {
    const [settings, setSettings] = useState<Settings | null>(initialSettings || null);
    const [isLoading, setIsLoading] = useState(!initialSettings);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    setSettings(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialSettings) {
            fetchSettings();
        }

        const handleSettingsUpdate = () => {
            clearCachedTimezone();
            fetchSettings();
        };

        window.addEventListener("settings-updated", handleSettingsUpdate);
        return () => {
            window.removeEventListener("settings-updated", handleSettingsUpdate);
        };
    }, [initialSettings, fetchSettings]);

    const activeTimezone = settings?.timezone || "UTC";

    const formatCurrency = useCallback((amount: number) => {
        const symbol = getCurrencySymbol(settings?.currency || "USD");
        return `${symbol}${(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }, [settings?.currency]);

    const formatDate = useCallback((date: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions) => {
        return formatWithTz(date, activeTimezone, options);
    }, [activeTimezone]);

    const formatDateTime = useCallback((date: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions) => {
        return formatDateTimeWithTz(date, activeTimezone, options);
    }, [activeTimezone]);

    const formatTime = useCallback((date: string | Date | number | null | undefined, includeSeconds?: boolean) => {
        return formatTimeWithTz(date, activeTimezone, includeSeconds);
    }, [activeTimezone]);

    const getCurrentDate = useCallback(() => {
        return getDateInTimezone(new Date(), activeTimezone);
    }, [activeTimezone]);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                isLoading,
                timezone: activeTimezone,
                formatCurrency,
                formatDate,
                formatDateTime,
                formatTime,
                getCurrentDate,
                refreshSettings: fetchSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
