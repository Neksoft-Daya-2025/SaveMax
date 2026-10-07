// Timezone-aware date utilities for NextProperty SaaS (Admin & SuperAdmin)
import { getTimezoneInfo } from "./timezones";

let cachedAdminTimezone: string | null = null;
let cachedSuperAdminTimezone: string | null = null;

/**
 * Fetch active timezone in client-side components
 */
export const getTimezone = async (isSuperAdmin: boolean = false): Promise<string> => {
    if (isSuperAdmin) {
        if (cachedSuperAdminTimezone) return cachedSuperAdminTimezone;
        try {
            const res = await fetch('/api/superadmin/settings');
            const data = await res.json();
            if (data.success && data.data?.timezone) {
                cachedSuperAdminTimezone = data.data.timezone;
                return data.data.timezone;
            }
        } catch (error) {
            console.error("Failed to fetch superadmin timezone:", error);
        }
        return 'UTC';
    } else {
        if (cachedAdminTimezone) return cachedAdminTimezone;
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success && data.data?.timezone) {
                cachedAdminTimezone = data.data.timezone;
                return data.data.timezone;
            }
        } catch (error) {
            console.error("Failed to fetch admin timezone:", error);
        }
        return 'UTC';
    }
};

/**
 * Invalidate cached timezone when settings are updated
 */
export const clearCachedTimezone = () => {
    cachedAdminTimezone = null;
    cachedSuperAdminTimezone = null;
};

/**
 * Format a Date or timestamp as YYYY-MM-DD in the target timezone (suitable for HTML <input type="date">)
 */
export const getDateInTimezone = (date: string | Date | number = new Date(), timezone: string = 'UTC'): string => {
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone || 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return formatter.format(d); // Outputs YYYY-MM-DD
    } catch {
        const d = new Date(date);
        return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    }
};

/**
 * Get date string formatted as YYYYMMDD in target timezone (useful for invoice / receipt / identifier generation)
 */
export const getDateCodeInTimezone = (date: string | Date | number = new Date(), timezone: string = 'UTC'): string => {
    const ymd = getDateInTimezone(date, timezone);
    return ymd.replace(/-/g, '');
};

/**
 * Format human-readable date e.g. "Oct 24, 2026"
 */
export const formatDate = (
    date: string | Date | number | null | undefined,
    timezone: string = 'UTC',
    options?: Intl.DateTimeFormatOptions
): string => {
    if (!date) return '-';
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone || 'UTC',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options,
        }).format(d);
    } catch (e) {
        return String(date);
    }
};

/**
 * Format human-readable date and time e.g. "Oct 24, 2026, 03:45 PM"
 */
export const formatDateTime = (
    date: string | Date | number | null | undefined,
    timezone: string = 'UTC',
    options?: Intl.DateTimeFormatOptions
): string => {
    if (!date) return '-';
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone || 'UTC',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            ...options,
        }).format(d);
    } catch (e) {
        return String(date);
    }
};

/**
 * Format time e.g. "03:45:00 PM"
 */
export const formatTime = (
    date: string | Date | number | null | undefined,
    timezone: string = 'UTC',
    includeSeconds: boolean = false
): string => {
    if (!date) return '-';
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (isNaN(d.getTime())) return String(date);
        return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone || 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            second: includeSeconds ? '2-digit' : undefined,
            hour12: true,
        }).format(d);
    } catch (e) {
        return String(date);
    }
};

/**
 * Get current year in target timezone
 */
export const getYearInTimezone = (date: string | Date | number = new Date(), timezone: string = 'UTC'): number => {
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        const yearStr = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone || 'UTC',
            year: 'numeric',
        }).format(d);
        return parseInt(yearStr, 10);
    } catch {
        return new Date().getFullYear();
    }
};
