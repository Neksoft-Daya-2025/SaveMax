/* Developed by RUDRA via NEKLLM */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    Users,
    Settings,
    LogOut,
    Sparkles,
    Shield,
    ExternalLink,
    Menu,
    X,
    ChevronRight,
    ChevronLeft,
    Clock,
    User as UserIcon,
    Plus,
    Globe
} from "lucide-react";
import { getTimezoneInfo } from "@/lib/timezones";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");
    const [timezone, setTimezone] = useState("UTC");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch platform timezone from SaaS settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/superadmin/settings");
                const data = await res.json();
                if (data.success && data.data?.timezone) {
                    setTimezone(data.data.timezone);
                }
            } catch (err) {
                console.error("Failed to fetch superadmin timezone:", err);
            }
        };

        fetchSettings();

        // Listen for real-time updates when settings are saved
        const handleSettingsUpdate = (e: any) => {
            if (e.detail?.timezone) {
                setTimezone(e.detail.timezone);
            } else {
                fetchSettings();
            }
        };

        window.addEventListener("saas-settings-updated", handleSettingsUpdate);
        return () => {
            window.removeEventListener("saas-settings-updated", handleSettingsUpdate);
        };
    }, []);

    // Update live clock based on selected timezone
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            try {
                const timeString = new Intl.DateTimeFormat("en-US", {
                    timeZone: timezone || "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                }).format(now);
                setCurrentTime(timeString);
            } catch {
                const fallbackTimeString = new Intl.DateTimeFormat("en-US", {
                    timeZone: "UTC",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                }).format(now);
                setCurrentTime(fallbackTimeString);
            }
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [timezone]);

    // Handle outside click for dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const menuSections = [
        {
            title: "Main",
            items: [
                {
                    name: "Overview",
                    href: "/superadmin",
                    icon: LayoutDashboard,
                    exact: true,
                },
            ]
        },
        {
            title: "Platform Management",
            items: [
                {
                    name: "Organizations",
                    href: "/superadmin/organizations",
                    icon: Building2,
                },
                {
                    name: "Subscriptions",
                    href: "/superadmin/subscriptions",
                    icon: CreditCard,
                },
                {
                    name: "Global Users",
                    href: "/superadmin/users",
                    icon: Users,
                },
            ]
        },
        {
            title: "Configuration",
            items: [
                {
                    name: "SaaS Settings & Plans",
                    href: "/superadmin/settings",
                    icon: Settings,
                },
                {
                    name: "Website Settings",
                    href: "/superadmin/website-settings",
                    icon: Globe,
                },
            ]
        },
        {
            title: "Account",
            items: [
                {
                    name: "My Profile",
                    href: "/superadmin/profile",
                    icon: UserIcon,
                },
            ]
        },
        {
            title: "Public",
            items: [
                {
                    name: "View Landing Page",
                    href: "/",
                    icon: ExternalLink,
                    target: "_blank"
                }
            ]
        }
    ];

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Matching Admin Panel Sidebar Design) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 transform flex flex-col shadow-xl print:hidden
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 
                ${isSidebarCollapsed ? "w-20" : "w-64"}`}
            >
                {/* Premium Header */}
                <div className={`relative h-20 border-b border-gray-100 ${isSidebarCollapsed ? "px-2" : "px-5"}`}>
                    <div className={`relative h-full flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
                        {!isSidebarCollapsed ? (
                            <Link href="/superadmin" className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-base font-bold text-gray-900 tracking-tight truncate">SaveMAX</h1>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">SuperAdmin</span>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-900 uppercase tracking-wider">
                                            Platform
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <Link href="/superadmin" className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Shield className="w-5 h-5 text-white" />
                            </Link>
                        )}

                        {/* Mobile Close Button */}
                        <button
                            onClick={toggleSidebar}
                            className="md:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                    {menuSections.map((section, sectionIdx) => (
                        <div key={section.title} className={sectionIdx > 0 ? "pt-2" : ""}>
                            {!isSidebarCollapsed && (
                                <div className="px-3 mb-2">
                                    <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        {section.title}
                                    </h2>
                                </div>
                            )}
                            {isSidebarCollapsed && sectionIdx > 0 && (
                                <div className="my-2 mx-2 border-t border-gray-200"></div>
                            )}

                            <ul className="space-y-1">
                                {section.items.map((item) => {
                                    const active = isActive(item.href, (item as any).exact);
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                target={(item as any).target}
                                                title={isSidebarCollapsed ? item.name : ""}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                                                    active
                                                        ? "bg-[#eff6ff] text-blue-900 shadow-md shadow-blue-900/10 border border-blue-100/60 font-bold"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                } ${isSidebarCollapsed ? "justify-center" : ""}`}
                                            >
                                                <Icon
                                                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                                        active ? "text-blue-900" : "text-gray-400 group-hover:text-blue-900"
                                                    } ${isSidebarCollapsed ? "" : "mr-3"}`}
                                                />
                                                {!isSidebarCollapsed && (
                                                    <span className="truncate">{item.name}</span>
                                                )}
                                                {active && !isSidebarCollapsed && (
                                                    <div className="ml-auto w-1.5 h-1.5 bg-blue-900 rounded-full"></div>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Bottom User Info & Logout */}
                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 ${
                            isSidebarCollapsed ? "justify-center" : ""
                        }`}
                        title={isSidebarCollapsed ? "Logout" : ""}
                    >
                        <LogOut className={`w-5 h-5 ${isSidebarCollapsed ? "" : "mr-3"}`} />
                        {!isSidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Wrapper Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${
                    isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
                }`}
            >
                {/* Header (Matching Admin Header Design) */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
                    <div className="flex items-center">
                        {/* Mobile Menu Trigger */}
                        <button
                            onClick={toggleSidebar}
                            className="p-2 mr-4 text-gray-600 rounded-lg md:hidden hover:bg-gray-100"
                        >
                            <span className="sr-only">Open menu</span>
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Desktop Collapse Button */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden md:flex p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Selected Timezone & Clock Display */}
                        {(() => {
                            const tzInfo = getTimezoneInfo(timezone);
                            return (
                                <div
                                    className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-blue-50/90 hover:bg-blue-50 rounded-xl border border-blue-100 transition-colors shadow-2xs"
                                    title={`Selected Platform Timezone: ${tzInfo.label}`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-900 shrink-0">
                                        <Clock className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-bold text-blue-900 leading-tight">
                                            {currentTime || "12:00:00 PM"}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-blue-700 font-semibold truncate max-w-[130px]" title={timezone}>
                                                {timezone}
                                            </span>
                                            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-blue-200/70 text-blue-900 shrink-0">
                                                {tzInfo.offset ? `GMT${tzInfo.offset}` : "UTC"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Provision New Org Button */}
                        <Link
                            href="/superadmin/organizations/create"
                            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Organization</span>
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                                    {session?.user?.name || "Super Admin"}
                                </span>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 z-20 w-56 mt-2 origin-top-right bg-white border border-gray-200 rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-bold text-gray-900 truncate">{session?.user?.name || "Super Admin"}</p>
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-900 uppercase tracking-wider shrink-0">
                                                SuperAdmin
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{session?.user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/superadmin/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-900 transition-colors"
                                        >
                                            <UserIcon className="w-4 h-4 mr-2.5 text-blue-900" />
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/superadmin/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-2.5 text-gray-400" />
                                            Platform Settings
                                        </Link>
                                        <Link
                                            href="/superadmin/website-settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        >
                                            <Globe className="w-4 h-4 mr-2.5 text-gray-400" />
                                            Website Settings
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/login" })}
                                            className="flex w-full items-center px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4 mr-2.5" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content View */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {children}
                </main>

                {/* Footer (Matching Admin Footer Design) */}
                <footer className="py-4 px-6 bg-white border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
                        <p>© {new Date().getFullYear()} SaveMAX Platform. SuperAdmin Control Center.</p>
                        <p className="text-gray-400 font-medium">Developed by Neksoft Global Service Pvt. Ltd.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
