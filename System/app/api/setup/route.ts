/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Role, SaaSSettings } from '@/lib/initModels';

/**
 * SaaS Initial Setup API - Creates Root Super Administrator Account and Initializes SaaS Settings
 * This endpoint is only accessible when no Super Administrator exists in the system.
 */
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check if any Super Admin already exists
        const existingSuperAdmins = await User.countDocuments({ isSuperAdmin: true });
        if (existingSuperAdmins > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Setup already completed. A Super Administrator account already exists.'
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // 1. Create or Find Super Admin Role
        let superAdminRole: any = await Role.findOne({ name: 'Super Admin', isSystem: true });

        if (!superAdminRole) {
            const standardResources = [
                'dashboard',
                'properties',
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
                'units',
                'deposits',
                'suppliers'
            ];

            const allPermissions: any = {
                dashboard: { view: true },
                settings: { view: true, edit: true },
                aiReports: { view: true },
                propertyAssistant: { view: true },
            };

            standardResources.forEach(resource => {
                allPermissions[resource] = {
                    view: 'all',
                    create: true,
                    edit: true,
                    delete: true
                };
            });

            superAdminRole = await Role.create({
                name: 'Super Admin',
                description: 'Full access to entire SaaS platform and all organizations',
                permissions: allPermissions,
                isSystem: true
            });
        }

        // 2. Initialize default SaaS Platform Settings (Monthly & Yearly subscription plans)
        let saasSettings = await SaaSSettings.findOne();
        if (!saasSettings) {
            saasSettings = await SaaSSettings.create({
                platformName: 'SaveMAX',
                supportEmail: 'support@propertynext.com',
                phone: '+1 (555) 019-2834',
                address: '100 Enterprise Blvd, Suite 500, San Francisco, CA 94107',
                currency: 'USD',
                timezone: 'UTC',
                trialDays: 14,
                plans: {
                    monthly: {
                        id: 'monthly',
                        name: 'Professional Monthly',
                        price: 49,
                        currency: 'USD',
                        billingInterval: 'month',
                        description: 'Complete property & tenant management suite billed monthly.',
                        features: [
                            'Up to 100 Properties & Units',
                            'Tenant & Lease Management',
                            'Automated Rent Collection & Invoicing',
                            'Maintenance & Work Order Tracking',
                            'Staff & Agent Role Permissions',
                            'Standard Financial Reports',
                            'Email & SMS Notifications',
                            'Standard Support',
                        ],
                        badge: 'Popular',
                        isActive: true,
                    },
                    yearly: {
                        id: 'yearly',
                        name: 'Enterprise Annual',
                        price: 490,
                        currency: 'USD',
                        billingInterval: 'year',
                        description: 'Full-scale enterprise management with maximum savings & priority features.',
                        features: [
                            'Unlimited Properties & Units',
                            'Advanced Tenant & Lease Lifecycle',
                            'Automated Rent Collection & Due Reminders',
                            'Maintenance & Emergency Dispatch Hub',
                            'Multi-Agent & Staff Roles Access',
                            'AI Property Analytics & Forecasting',
                            'Full Accounting, Expenses & Payroll',
                            'Custom Organization Branding & Logo',
                            '24/7 Priority Dedicated Support',
                        ],
                        badge: 'Best Value',
                        discountNotice: 'Save ~17% (2 Months Free)',
                        isActive: true,
                    },
                },
                landingPage: {
                    heroTitle: 'Smart Property Management, Built for Modern Real Estate Enterprises',
                    heroSubtitle: 'Effortlessly manage thousands of properties, units, tenants, digital leases, automated rent collection, and AI-driven insights across all your portfolios in one unified multi-tenant SaaS workspace.',
                    badgeText: '🚀 Multi-Tenant Property Management SaaS',
                },
            });
        }

        // 3. Create Root SuperAdmin User
        const superAdminUser: any = await User.create({
            name: name || 'Super Administrator',
            email: email.toLowerCase().trim(),
            password: password,
            role: superAdminRole._id,
            isSuperAdmin: true,
            status: 'Active',
            emailVerified: true,
        });

        console.log('✅ Root Super Administrator created:', superAdminUser.email);

        return NextResponse.json({
            success: true,
            message: 'SaaS Platform initialized successfully! You can now log in as Super Administrator.',
            data: {
                user: {
                    id: superAdminUser._id,
                    name: superAdminUser.name,
                    email: superAdminUser.email,
                    isSuperAdmin: true
                }
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('❌ SaaS Setup error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to complete SaaS platform setup' },
            { status: 500 }
        );
    }
}

/**
 * Check if SaaS initial setup is required
 */
export async function GET() {
    try {
        await connectDB();

        const superAdminCount = await User.countDocuments({ isSuperAdmin: true });

        return NextResponse.json({
            success: true,
            setupRequired: superAdminCount === 0,
            stats: {
                superAdmins: superAdminCount,
            }
        });

    } catch (error: any) {
        console.error('❌ Setup check error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
