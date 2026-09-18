/* Developed by RUDRA via NEKLLM */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    X,
    LogOut,
    Truck,
    DollarSign,
    Clock,
    Shield,
    Sparkles,
    UserCircle,
    Home,
    MessageSquare,
    Calendar,
    FileText,
    Building2,
    Wallet,
    BarChart3,
    Wrench,
    Bot,
    ChevronRight
} from "lucide-react";
import { usePermission } from "@/hooks/usePermission";
import { signOut } from "next-auth/react";

interface SidebarProps {
    isSidebarOpen: boolean;
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

// Organized menu structure with sections
const menuSections = [
    {
        title: "Main",
        items: [
            { name: "My Dashboard", href: "/customer-dashboard", icon: LayoutDashboard, customerOnly: true },
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        title: "Real Estate",
        items: [
            { name: "My Contracts", href: "/my-contracts", icon: FileText, customerOnly: true },
            {
                name: "Properties",
                icon: Home,
                subItems: [
                    { name: "All Properties", href: "/properties" },
                    { name: "Add Property", href: "/properties/create" },
                    { name: "All Units", href: "/units" },
                    { name: "Add Unit", href: "/units/create" },
                ]
            },
            {
                name: "Contracts",
                icon: FileText,
                subItems: [
                    { name: "All Contracts", href: "/contracts" },
                    { name: "Add Contract", href: "/contracts/create" },
                    { name: "Active Contract", href: "/contracts/active" },
                    { name: "Expiry Soon", href: "/contracts/expiring" },
                ]
            },
            {
                name: "Tenants",
                icon: Users,
                subItems: [
                    { name: "All Tenants", href: "/customers" },
                    { name: "Add Tenant", href: "/customers/create" },
                    { name: "Active Tenants", href: "/customers/active" },
                ]
            },
            {
                name: "People",
                icon: UserCircle,
                subItems: [
                    { name: "Agents", href: "/agents" },
                    { name: "Owners", href: "/owners" },
                    { name: "Staff", href: "/staff" },
                ]
            },
            { name: "Inquiries", href: "/inquiries", icon: MessageSquare },
            { name: "Bookings", href: "/bookings", icon: Calendar },
            {
                name: "Maintenance",
                icon: Wrench,
                subItems: [
                    { name: "All Requests", href: "/maintenance" },
                    { name: "Emergency", href: "/maintenance/emergency" },
                    { name: "In Progress", href: "/maintenance/in-progress" },
                ]
            },
            { name: "Amenities", href: "/amenities", icon: Sparkles },
        ]
    },
    {
        title: "AI Hub",
        items: [
            { name: "AI Reports", href: "/ai-reports", icon: Sparkles },
            { name: "AI Property Assistant", href: "/property-assistant", icon: Bot },
        ]
    },
    {
        title: "Finance",
        items: [
            { name: "Payments", href: "/payments", icon: DollarSign },
            { name: "Due Collection", href: "/due-collection", icon: Clock },
            { name: "Expenses", href: "/expenses", icon: DollarSign },
            { name: "Payroll", href: "/payroll", icon: Wallet },
            {
                name: "Reports",
                icon: BarChart3,
                subItems: [
                    { name: "Financial Report", href: "/reports/financial" },
                    { name: "Rental Report", href: "/reports/rental" },
                    { name: "Collection Report", href: "/reports/collection" },
                ]
            },
        ]
    },
    {
        title: "Admin",
        items: [
            { name: "Users", href: "/users", icon: Users },
            { name: "Roles", href: "/roles", icon: Shield },
            { name: "Settings", href: "/settings", icon: Settings },
        ]
    }
];

export default function Sidebar({ isSidebarOpen, isSidebarCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const { canView, user } = usePermission();
    const [storeName, setStoreName] = useState("SaveMAX");
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        // Automatically expand submenus that have active children on mount
        const initialExpanded: Record<string, boolean> = {};
        menuSections.forEach(section => {
            section.items.forEach(item => {
                if (item.subItems) {
                    const hasActiveChild = item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));
                    if (hasActiveChild) {
                        initialExpanded[item.name] = true;
                    }
                }
            });
        });
        setExpandedMenus(initialExpanded);
    }, [pathname]);

    const toggleSubMenu = (name: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            const data = await res.json();
            if (data.success && data.data?.storeName) {
                setStoreName("SaveMAX");
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    // Map menu items to their resource keys for permission checking
    const getResourceKey = (name: string): string | null => {
        const map: Record<string, string> = {
            'Dashboard': 'dashboard',
            'Properties': 'properties',
            'Units': 'units',
            'Contracts': 'contracts',
            'Agents': 'agents',
            'Owners': 'owners',
            'Inquiries': 'inquiries',
            'Bookings': 'bookings',
            'Maintenance': 'maintenance',
            'Staff': 'staff',
            'Customers': 'customers',
            'Suppliers': 'suppliers',
            'Payments': 'payments',
            'Deposits': 'deposits',
            'Due Collection': 'dueCollection',
            'Payroll': 'payroll',
            'Expenses': 'expenses',
            'Financial Report': 'financialReports',
            'Users': 'users',
            'Roles': 'roles',
            'Settings': 'settings',
            'AI Reports': 'aiReports',
            'AI Property Assistant': 'propertyAssistant',
            'Amenities': 'amenities',
            'Blogs': 'cms'
        };
        return map[name] || null;
    };

    // Filter sections and their items based on permissions
    const filteredSections = menuSections.map(section => ({
        ...section,
        items: section.items.map(item => {
            if (item.subItems) {
                // Hide Contracts and Reports parent menus from agents
                if (user?.role === 'Agent' && (item.name === 'Contracts' || item.name === 'Reports')) {
                    return null;
                }
                // Hide Properties, Tenants, Contracts, Reports and People parent menus from customers
                if (user?.role === 'Customer' && (item.name === 'Properties' || item.name === 'Tenants' || item.name === 'Contracts' || item.name === 'Reports' || item.name === 'People')) {
                    return null;
                }
                const visibleSubItems = item.subItems.filter(sub => {
                    // Hide "Add Property" and "Add Unit" submenus from agents
                    if (user?.role === 'Agent' && (sub.name === 'Add Property' || sub.name === 'Add Unit')) {
                        return false;
                    }
                    const resource = getResourceKey(sub.name);
                    if (!resource) return true;
                    return canView(resource);
                });
                return visibleSubItems.length > 0 ? { ...item, subItems: visibleSubItems } : null;
            }

            // Customer-only items (and hide the staff Dashboard for customers)
            if ((item as any).customerOnly && user?.role !== 'Customer') return null;
            if (item.name === 'Dashboard' && user?.role === 'Customer') return null;

            const resource = getResourceKey(item.name);
            if (!resource) return item;

            const isAllowed = canView(resource);
            if (!isAllowed) return null;

            // Hide Roles and Agents menu from agents even if they have view permission for API access
            if ((resource === 'roles' || resource === 'agents') && user?.role === 'Agent') return null;

            return item;
        }).filter(item => item !== null) as any[]
    })).filter(section => section.items.length > 0);

    const [planName, setPlanName] = useState("");

    useEffect(() => {
        if ((user as any)?.organization?.name) {
            setStoreName((user as any).organization.name);
        }
        if ((user as any)?.organization?.subscription?.plan) {
            setPlanName((user as any).organization.subscription.plan === 'yearly' ? 'Yearly' : 'Monthly');
        }
    }, [user]);

    const isSuperAdmin = Boolean((user as any)?.isSuperAdmin || user?.role === 'Super Admin');

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 transform flex flex-col shadow-xl print:hidden
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 
        ${isSidebarCollapsed ? "w-20" : "w-64"}
      `}
        >
            {/* Premium Header */}
            <div className={`relative h-20 border-b border-gray-100 ${isSidebarCollapsed ? "px-2" : "px-5"}`}>
                <div className={`relative h-full flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
                    {!isSidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base font-bold text-gray-900 tracking-tight truncate">{storeName}</h1>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Tenant Suite</span>
                                    {planName && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                            {planName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* SuperAdmin Portal Banner Shortcut */}
            {isSuperAdmin && !isSidebarCollapsed && (
                <div className="px-3 pt-3">
                    <Link
                        href="/superadmin"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/20 text-xs font-bold"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-400" />
                            <span>SuperAdmin Center</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {filteredSections.map((section, sectionIndex) => (
                    <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
                        {/* Section Title */}
                        {!isSidebarCollapsed && (
                            <div className="px-3 mb-2">
                                <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    {section.title}
                                </h2>
                            </div>
                        )}
                        {isSidebarCollapsed && sectionIndex > 0 && (
                            <div className="my-3 mx-2 border-t border-slate-700/50"></div>
                        )}

                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                if (item.subItems) {
                                    const isExpanded = expandedMenus[item.name];
                                    const hasActiveSub = item.subItems.some((sub: any) => pathname === sub.href || pathname.startsWith(sub.href + '/'));
                                    return (
                                        <li key={item.name} className="space-y-1">
                                            <button
                                                onClick={() => toggleSubMenu(item.name)}
                                                title={isSidebarCollapsed ? item.name : ""}
                                                className={`group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                                                    ${hasActiveSub
                                                        ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                    } ${isSidebarCollapsed ? "justify-center" : ""}`}
                                            >
                                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110
                                                    ${hasActiveSub ? "text-blue-800" : "text-gray-400 group-hover:text-blue-900"} 
                                                    ${isSidebarCollapsed ? "" : "mr-3"}`}
                                                />
                                                {!isSidebarCollapsed && (
                                                    <>
                                                        <span className="truncate">{item.name}</span>
                                                        <ChevronRight className={`ml-auto w-4 h-4 text-gray-405 transition-transform duration-200 ${isExpanded ? "rotate-90 text-blue-900" : ""}`} />
                                                    </>
                                                )}
                                            </button>
                                            
                                            {/* Sub items nested list */}
                                            {isExpanded && !isSidebarCollapsed && (
                                                <ul className="pl-9 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {item.subItems.map((sub: any) => {
                                                        const isSubActive = pathname === sub.href;
                                                        return (
                                                            <li key={sub.name}>
                                                                <Link
                                                                    href={sub.href}
                                                                    className={`flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200
                                                                        ${isSubActive ? "font-bold" : "hover:bg-gray-50"}`}
                                                                    style={isSubActive ? { backgroundColor: '#eff6ff', color: '#000000' } : { color: 'lab(47.7841% -.393212 -10.0268)' }}
                                                                >
                                                                    <div className={`w-1.5 h-1.5 rounded-full mr-2.5 transition-all ${isSubActive ? "bg-blue-700 scale-125" : "bg-gray-300"}`} />
                                                                    <span>{sub.name}</span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}

                                            {/* Collapsed Sidebar sub-items vertical list */}
                                            {isExpanded && isSidebarCollapsed && (
                                                <ul className="py-1 bg-gray-50 rounded-lg space-y-1 border border-gray-100 mt-1">
                                                    {item.subItems.map((sub: any) => {
                                                        const isSubActive = pathname === sub.href;
                                                        return (
                                                            <li key={sub.name}>
                                                                <Link
                                                                    href={sub.href}
                                                                    title={sub.name}
                                                                    className={`flex items-center justify-center p-2 rounded-lg transition-all font-bold`}
                                                                    style={isSubActive ? { backgroundColor: '#eff6ff', color: '#000000' } : { color: 'lab(47.7841% -.393212 -10.0268)' }}
                                                                >
                                                                    <span className="text-[10px] uppercase font-bold tracking-tight">
                                                                        {sub.name.slice(0, 4)}
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                } else {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                title={isSidebarCollapsed ? item.name : ""}
                                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                                                    ${isActive
                                                        ? "bg-[#eff6ff] text-blue-900 shadow-lg shadow-blue-900/20"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                    } ${isSidebarCollapsed ? "justify-center" : ""}`}
                                            >
                                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110
                                                    ${isActive ? "text-blue-900" : "text-gray-400 group-hover:text-blue-900"} 
                                                    ${isSidebarCollapsed ? "" : "mr-3"}`}
                                                />
                                                {!isSidebarCollapsed && (
                                                    <span className="truncate">{item.name}</span>
                                                )}
                                                {isActive && !isSidebarCollapsed && (
                                                    <div className="ml-auto w-1 h-1 bg-blue-900 rounded-full"></div>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </div>
                ))}

                {/* Bottom Profile Menu */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <ul className="space-y-1">
                        <li>
                            <Link
                                href="/profile"
                                title={isSidebarCollapsed ? "My Profile" : ""}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                                    ${pathname === "/profile"
                                        ? "bg-[#eff6ff] text-blue-900 shadow-lg shadow-blue-900/20"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    } ${isSidebarCollapsed ? "justify-center" : ""}`}
                            >
                                <UserCircle className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110
                                    ${pathname === "/profile" ? "text-blue-900" : "text-gray-400 group-hover:text-blue-900"} 
                                    ${isSidebarCollapsed ? "" : "mr-3"}`}
                                />
                                {!isSidebarCollapsed && (
                                    <span className="truncate">My Profile</span>
                                )}
                                {pathname === "/profile" && !isSidebarCollapsed && (
                                    <div className="ml-auto w-1 h-1 bg-blue-900 rounded-full"></div>
                                )}
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className={`flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 ${isSidebarCollapsed ? "justify-center" : ""}`}
                    title={isSidebarCollapsed ? "Logout" : ""}
                >
                    <LogOut className={`w-5 h-5 ${isSidebarCollapsed ? "" : "mr-3"}`} />
                    {!isSidebarCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
