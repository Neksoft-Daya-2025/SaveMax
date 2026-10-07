import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { SaaSSettings } from '@/lib/initModels';

// GET /api/public/plans - Public endpoint for SaaS Landing Page subscription plans
export async function GET() {
    try {
        await connectDB();

        let settings = await SaaSSettings.findOne().lean();
        if (!settings) {
            settings = await SaaSSettings.create({});
        }

        return NextResponse.json({
            success: true,
            data: {
                currency: (settings as any)?.currency || 'USD',
                trialDays: (settings as any)?.trialDays || 14,
                plans: (settings as any)?.plans || {
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
                landingPage: (settings as any)?.landingPage,
            }
        });
    } catch (error: any) {
        console.error('Error fetching public subscription plans:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            data: {
                currency: 'USD',
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
                }
            }
        });
    }
}
