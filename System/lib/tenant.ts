/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Role from '@/models/Role';
import mongoose from 'mongoose';

export interface TenantContext {
    session: any;
    user: any;
    isSuperAdmin: boolean;
    organizationId: string | null;
    organization: any;
}

/**
 * Extract tenant context from authenticated session
 */
export async function getTenantContext(request?: NextRequest): Promise<TenantContext> {
    const session: any = await auth();

    if (!session || !session.user) {
        return {
            session: null,
            user: null,
            isSuperAdmin: false,
            organizationId: null,
            organization: null,
        };
    }

    const user = session.user;
    const isSuperAdmin = Boolean(user.isSuperAdmin || user.role === 'Super Admin' || user.role === 'SuperAdmin');
    const organizationId = user.organizationId || (user.organization?._id ? user.organization._id.toString() : user.organization?.id) || null;

    return {
        session,
        user,
        isSuperAdmin,
        organizationId,
        organization: user.organization || null,
    };
}

/**
 * Apply tenant filter to a MongoDB query
 * - If SuperAdmin: query runs globally unless an explicit organization filter is provided
 * - If Org Member: query is strictly scoped to the user's organization
 */
export function applyTenantFilter(sessionOrContext: any, baseQuery: any = {}): any {
    if (!sessionOrContext) return { ...baseQuery, _id: null }; // Deny by default if unauthenticated

    const isSuperAdmin = sessionOrContext.isSuperAdmin ?? Boolean(sessionOrContext.user?.isSuperAdmin || sessionOrContext.user?.role === 'Super Admin');
    const organizationId = sessionOrContext.organizationId ?? sessionOrContext.user?.organizationId ?? (sessionOrContext.user?.organization?._id || sessionOrContext.user?.organization?.id);

    if (isSuperAdmin) {
        // Superadmin can query all or filter by specific organization if specified
        return { ...baseQuery };
    }

    if (organizationId) {
        return {
            ...baseQuery,
            organization: new mongoose.Types.ObjectId(organizationId.toString()),
        };
    }

    // Regular user without organization has no tenant scope
    return { ...baseQuery, organization: null };
}

/**
 * Inject tenant (organization ID) into payload for newly created documents
 */
export function injectTenant(sessionOrContext: any, payload: any): any {
    const organizationId = sessionOrContext?.organizationId ?? sessionOrContext?.user?.organizationId ?? (sessionOrContext?.user?.organization?._id || sessionOrContext?.user?.organization?.id);

    if (!organizationId) {
        return { ...payload };
    }

    return {
        ...payload,
        organization: new mongoose.Types.ObjectId(organizationId.toString()),
    };
}

/**
 * Helper to initialize the 3 default roles for a newly created organization:
 * 1. Admin Role (Full organization permissions)
 * 2. Agent Role (Assigned properties, bookings, maintenance, inquiries)
 * 3. Customer Role (Browse listings, make bookings/inquiries, view contracts & payments)
 */
export async function createDefaultOrganizationRoles(orgId: mongoose.Types.ObjectId | string) {
    const organizationObjectId = new mongoose.Types.ObjectId(orgId.toString());

    const standardResources = [
        'dashboard',
        'properties',
        'units',
        'amenities',
        'bookings',
        'inquiries',
        'maintenance',
        'payroll',
        'rent',
        'contracts',
        'propertyAssistant',
        'agents',
        'owners',
        'customers',
        'expenses',
        'payments',
        'dueCollection',
        'staff',
        'users',
        'roles',
        'cms',
        'aiReports',
        'settings',
        'financialReports',
        'deposits',
        'suppliers'
    ];

    // 1. Admin Role (Full Access inside organization)
    const adminPermissions: any = {
        dashboard: { view: true },
        settings: { view: true, edit: true },
        aiReports: { view: true },
        propertyAssistant: { view: true },
    };
    standardResources.forEach(res => {
        adminPermissions[res] = {
            view: 'all',
            create: true,
            edit: true,
            delete: true,
        };
    });

    const adminRole = await Role.create({
        name: 'Admin',
        description: 'Organization Administrator with full access to organization data',
        organization: organizationObjectId,
        isSystem: true,
        permissions: adminPermissions,
    });

    // 2. Agent Role
    const agentPermissions: any = {
        dashboard: { view: false },
        properties: { view: 'all', create: false, edit: false, delete: false },
        units: { view: 'all', create: false, edit: false, delete: false },
        bookings: { view: 'own', create: true, edit: true, delete: false },
        inquiries: { view: 'all', create: true, edit: true, delete: false },
        maintenance: { view: 'own', create: true, edit: true, delete: false },
        customers: { view: 'own', create: true, edit: false, delete: false },
        agents: { view: 'all', create: false, edit: false, delete: false },
        owners: { view: 'all', create: false, edit: false, delete: false },
        contracts: { view: 'own', create: false, edit: false, delete: false },
        payments: { view: 'none', create: false, edit: false, delete: false },
        dueCollection: { view: 'none', create: false, edit: false, delete: false },
        payroll: { view: 'none', create: false, edit: false, delete: false },
        expenses: { view: 'none', create: false, edit: false, delete: false },
        staff: { view: 'none', create: false, edit: false, delete: false },
        users: { view: 'none', create: false, edit: false, delete: false },
        roles: { view: 'all', create: false, edit: false, delete: false },
        cms: { view: 'none', create: false, edit: false, delete: false },
        aiReports: { view: false },
        propertyAssistant: { view: true },
        settings: { view: false, edit: false },
        financialReports: { view: 'none', create: false, edit: false, delete: false },
        amenities: { view: 'all', create: false, edit: false, delete: false },
        suppliers: { view: 'none', create: false, edit: false, delete: false },
    };

    const agentRole = await Role.create({
        name: 'Agent',
        description: 'Real Estate Agent with access to assigned properties, bookings, and inquiries',
        organization: organizationObjectId,
        isSystem: true,
        permissions: agentPermissions,
    });

    // 3. Customer Role
    const customerPermissions: any = {
        dashboard: { view: false },
        settings: { view: false, edit: false },
        aiReports: { view: false },
        propertyAssistant: { view: false },
    };
    standardResources.forEach(res => {
        if (['properties', 'units', 'agents', 'amenities'].includes(res)) {
            customerPermissions[res] = { view: 'all', create: false, edit: false, delete: false };
        } else if (['bookings', 'inquiries', 'maintenance'].includes(res)) {
            customerPermissions[res] = { view: 'own', create: true, edit: false, delete: false };
        } else if (['contracts', 'payments'].includes(res)) {
            customerPermissions[res] = { view: 'own', create: false, edit: false, delete: false };
        } else {
            customerPermissions[res] = { view: 'none', create: false, edit: false, delete: false };
        }
    });

    const customerRole = await Role.create({
        name: 'Customer',
        description: 'Tenant or client with self-service portal access',
        organization: organizationObjectId,
        isSystem: true,
        permissions: customerPermissions,
    });

    // 4. Owner Role
    const ownerPermissions: any = {
        dashboard: { view: false },
        settings: { view: false, edit: false },
        aiReports: { view: false },
        propertyAssistant: { view: false },
    };
    standardResources.forEach(res => {
        if (['properties', 'units'].includes(res)) {
            ownerPermissions[res] = { view: 'own', create: false, edit: false, delete: false };
        } else if (['contracts', 'payments', 'financialReports'].includes(res)) {
            ownerPermissions[res] = { view: 'own', create: false, edit: false, delete: false };
        } else {
            ownerPermissions[res] = { view: 'none', create: false, edit: false, delete: false };
        }
    });

    const ownerRole = await Role.create({
        name: 'Owner',
        description: 'Property Owner with access to owned properties, contracts, and financial reports',
        organization: organizationObjectId,
        isSystem: true,
        permissions: ownerPermissions,
    });

    return {
        adminRole,
        agentRole,
        customerRole,
        ownerRole,
    };
}

/**
 * Resolves the active timezone for a given session or context:
 * - If SuperAdmin: returns the global SaaSSettings.timezone
 * - If Organization User: returns Organization.settings.timezone or Settings.timezone
 */
export async function getTenantTimezone(sessionOrContext?: any): Promise<string> {
    try {
        const isSuperAdmin = sessionOrContext?.isSuperAdmin ?? Boolean(sessionOrContext?.user?.isSuperAdmin || sessionOrContext?.user?.role === 'Super Admin' || sessionOrContext?.user?.role === 'SuperAdmin');
        
        if (isSuperAdmin) {
            const { SaaSSettings } = await import('@/lib/initModels');
            const saasSettings = await SaaSSettings.findOne().select('timezone').lean();
            if ((saasSettings as any)?.timezone) {
                return (saasSettings as any).timezone;
            }
        }

        const organizationId = sessionOrContext?.organizationId ?? sessionOrContext?.user?.organizationId ?? (sessionOrContext?.user?.organization?._id || sessionOrContext?.user?.organization?.id);
        
        if (organizationId) {
            const Organization = (await import('@/models/Organization')).default;
            const org = await Organization.findById(organizationId).select('settings').lean();
            if ((org as any)?.settings?.timezone) {
                return (org as any).settings.timezone;
            }
        }

        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne().select('timezone').lean();
        if ((settings as any)?.timezone) {
            return (settings as any).timezone;
        }
    } catch (err) {
        console.error('Error resolving tenant timezone:', err);
    }
    return 'UTC';
}

