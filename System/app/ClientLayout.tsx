"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import NavigationLoader from "@/components/NavigationLoader";

const NON_DASHBOARD_ROUTES = ["/site", "/login", "/register", "/setup", "/property", "/unit", "/superadmin", "/create-organization"];

function isNonDashboardRoute(pathname: string): boolean {
    if (pathname === "/") return true;
    return NON_DASHBOARD_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export default function DashboardLayout({
    children,
    user
}: {
    children: React.ReactNode;
    user?: { name?: string | null; email?: string | null };
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop state

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    // If on landing, auth, or superadmin routes, render children directly without dashboard sidebar/header
    if (isNonDashboardRoute(pathname)) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Navigation Loading Overlay */}
            <NavigationLoader />

            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
                    }`}
            >
                <Header
                    toggleSidebar={toggleSidebar}
                    toggleCollapse={toggleCollapse}
                    isSidebarCollapsed={isSidebarCollapsed}
                    user={user}
                />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>

                <Footer />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
