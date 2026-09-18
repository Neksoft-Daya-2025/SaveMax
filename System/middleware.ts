/* Developed by RUDRA via NEKLLM */
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    const user = req.auth?.user as any;
    const isSuperAdmin = Boolean(
        user?.isSuperAdmin || 
        user?.role === 'Super Admin' || 
        user?.role === 'SuperAdmin'
    );
    const permissions = user?.permissions;

    // Helper: create a NextResponse.next() with x-pathname injected as request header
    const nextWithPathname = () => {
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-pathname", pathname);
        return NextResponse.next({ request: { headers: requestHeaders } });
    };

    // Public routes that anyone can view
    const isPublicRoute =
        pathname === '/' ||
        pathname === '/create-organization' || pathname.startsWith('/create-organization/') ||
        pathname === '/property' || pathname.startsWith('/property/') ||
        pathname === '/unit' || pathname.startsWith('/unit/');

    if (isPublicRoute) {
        return nextWithPathname();
    }

    // Auth & Setup Routes
    const authRoutes = ['/login', '/register', '/setup'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // SuperAdmin routes
    const isSuperAdminRoute = pathname.startsWith('/superadmin');

    // Protected Organization & User Routes
    const protectedRoutes = [
        '/dashboard', '/properties', '/contracts', '/payments', '/units', 
        '/customers', '/agents', '/owners', '/staff', '/due-collection', 
        '/deposits', '/expenses', '/payroll', '/users', '/roles', '/settings', 
        '/profile', '/inquiries', '/bookings', '/maintenance', '/ai-reports', 
        '/property-assistant', '/reports', '/amenities', '/suppliers', '/blogs', 
        '/customer-dashboard', '/my-contracts'
    ];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // 1. Unauthenticated users trying to access protected or superadmin areas
    if ((isProtectedRoute || isSuperAdminRoute) && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // 2. SuperAdmin access control
    if (isLoggedIn && isSuperAdmin) {
        // SuperAdmin on auth routes or standard org dashboard should go to superadmin panel
        if (isAuthRoute || pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/superadmin', req.url));
        }
        return nextWithPathname();
    }

    // 3. Non-SuperAdmin trying to access superadmin panel
    if (isLoggedIn && !isSuperAdmin && isSuperAdminRoute) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // 4. Role-based redirection logic for standard logged-in users
    const getFirstAccessibleRoute = () => {
        if (!permissions) return '/profile';

        // Customers land on their dedicated dashboard
        if (user?.role === 'Customer') return '/customer-dashboard';

        // Check dashboard first
        if (permissions.dashboard?.view) return '/dashboard';

        // Order of preference for redirection
        const routes = [
            { path: '/properties', resource: 'properties' },
            { path: '/units', resource: 'units' },
            { path: '/contracts', resource: 'contracts' },
            { path: '/bookings', resource: 'bookings' },
            { path: '/inquiries', resource: 'inquiries' },
            { path: '/customers', resource: 'customers' },
            { path: '/agents', resource: 'agents' },
            { path: '/owners', resource: 'owners' },
            { path: '/staff', resource: 'staff' },
            { path: '/payments', resource: 'payments' },
            { path: '/due-collection', resource: 'dueCollection' },
            { path: '/payroll', resource: 'payroll' },
            { path: '/expenses', resource: 'expenses' },
            { path: '/users', resource: 'users' },
            { path: '/roles', resource: 'roles' },
            { path: '/settings', resource: 'settings' },
            { path: '/ai-reports', resource: 'aiReports' },
        ];

        for (const route of routes) {
            const p = permissions[route.resource];
            if (p) {
                if (typeof p.view === 'string' && (p.view === 'all' || p.view === 'own')) return route.path;
                if (p.view === true) return route.path;
            }
        }

        return '/profile';
    };

    // Redirect if authenticated but accessing auth routes OR if on dashboard without permission
    if (isLoggedIn && !isSuperAdmin) {
        const firstRoute = getFirstAccessibleRoute();

        if (isAuthRoute) {
            return NextResponse.redirect(new URL(firstRoute, req.url));
        }

        if (pathname === '/dashboard' && !permissions?.dashboard?.view) {
            return NextResponse.redirect(new URL(firstRoute, req.url));
        }
    }

    // Pass through with pathname header injected
    return nextWithPathname();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// Force Node.js runtime to support bcrypt and other Node.js modules
export const runtime = 'nodejs';
