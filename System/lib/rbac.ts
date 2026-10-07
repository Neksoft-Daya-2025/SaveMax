import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

type Action = 'view' | 'create' | 'edit' | 'delete';

export async function checkPermission(
    request: NextRequest,
    resource: string,
    action: Action
): Promise<NextResponse | null> {
    const session: any = await auth();

    if (!session || !session.user) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { permissions } = session.user;

    // Admin override or fallback?
    // If no permission object, assume restricted
    if (!permissions) {
        return NextResponse.json(
            { success: false, error: "Access Denied: No permissions found" },
            { status: 403 }
        );
    }

    const resourcePerms = permissions[resource];
    if (!resourcePerms) {
        return NextResponse.json(
            { success: false, error: "Access Denied: Resource restricted" },
            { status: 403 }
        );
    }

    let allowed = false;
    if (action === 'view') {
        allowed = resourcePerms.view !== 'none';
    } else {
        allowed = !!resourcePerms[action];
    }

    if (!allowed) {
        return NextResponse.json(
            { success: false, error: `Access Denied: Cannot ${action} ${resource}` },
            { status: 403 }
        );
    }

    return null; // Null means pass/allowed
}

// Helper to get view scope for filtering data
export async function getViewScope(resource: string): Promise<'all' | 'own' | 'none'> {
    const session: any = await auth();
    if (!session?.user?.permissions) return 'none';
    return session.user.permissions[resource]?.view || 'none';
}

// Logic for finding the first route a user can access
export async function getFirstAccessiblePath(): Promise<string> {
    const session: any = await auth();
    if (!session?.user?.permissions) return '/profile';

    const permissions = session.user.permissions;

    // dashboard check
    if (permissions.dashboard?.view === true) return '/dashboard';

    const routes = [
        { path: '/properties', resource: 'properties' },
        { path: '/units', resource: 'properties' },
        { path: '/contracts', resource: 'contracts' },
        { path: '/bookings', resource: 'bookings' },
        { path: '/inquiries', resource: 'inquiries' },
        { path: '/customers', resource: 'customers' },
        { path: '/agents', resource: 'agents' },
        { path: '/owners', resource: 'owners' },
        { path: '/staff', resource: 'staff' },
        { path: '/payments', resource: 'payments' },
        { path: '/users', resource: 'users' },
        { path: '/roles', resource: 'roles' },
        { path: '/amenities', resource: 'amenities' },
        { path: '/settings', resource: 'settings' },
    ];

    for (const route of routes) {
        const p = permissions[route.resource];
        if (p) {
            if (typeof p.view === 'string' && (p.view === 'all' || p.view === 'own')) return route.path;
            if (p.view === true) return route.path;
        }
    }

    return '/profile';
}
