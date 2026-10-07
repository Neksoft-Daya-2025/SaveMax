import mongoose, { Schema, Model, models } from 'mongoose';

export interface ISubscriptionPlanConfig {
    id: 'monthly' | 'yearly';
    name: string;
    price: number;
    currency: string;
    billingInterval: 'month' | 'year';
    description: string;
    features: string[];
    badge?: string;
    discountNotice?: string;
    isActive: boolean;
}

export interface ILandingPageMetric {
    val: string;
    label: string;
}

export interface ILandingPageConfig {
    // Brand & Header
    logoUrl?: string;
    brandTitle?: string;
    brandBadge?: string;
    brandSubtitle?: string;

    // Hero Section
    badgeText: string;
    heroTitle: string;
    heroSubtitle: string;
    primaryCtaText: string;
    secondaryCtaText: string;

    // Platform Metrics
    metrics: ILandingPageMetric[];

    // Features Section
    featuresBadge: string;
    featuresTitle: string;
    featuresSubtitle: string;

    // Modules Section
    modulesBadge: string;
    modulesTitle: string;
    modulesSubtitle: string;

    // Pricing Section
    pricingBadge: string;
    pricingTitle: string;
    pricingSubtitle: string;

    // Organization Registration Section
    registrationBadge: string;
    registrationTitle: string;
    registrationSubtitle: string;

    // Testimonials / Reviews Section
    testimonialsBadge: string;
    testimonialsTitle: string;
    testimonialsSubtitle: string;

    // FAQ Section
    faqBadge: string;
    faqTitle: string;
    faqSubtitle: string;

    // Bottom CTA Banner
    ctaBannerTitle: string;
    ctaBannerSubtitle: string;
    ctaBannerButtonText: string;

    // Footer
    footerDescription: string;
    footerCopyright: string;
}

export interface ISaaSSettings {
    _id: string;
    platformName: string;
    supportEmail: string;
    phone?: string;
    address?: string;
    currency: string;
    timezone?: string;
    trialDays: number;
    plans: {
        monthly: ISubscriptionPlanConfig;
        yearly: ISubscriptionPlanConfig;
    };
    landingPage: ILandingPageConfig;
    createdAt: Date;
    updatedAt: Date;
}

const PlanConfigSchema = new Schema<ISubscriptionPlanConfig>(
    {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        billingInterval: { type: String, required: true },
        description: { type: String, default: '' },
        features: [{ type: String }],
        badge: { type: String, default: '' },
        discountNotice: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    { _id: false }
);

const LandingPageSchema = new Schema<ILandingPageConfig>(
    {
        // Brand & Header
        logoUrl: {
            type: String,
            default: '',
        },
        brandTitle: {
            type: String,
            default: 'PropSaaS',
        },
        brandBadge: {
            type: String,
            default: 'CLOUD',
        },
        brandSubtitle: {
            type: String,
            default: 'All-in-One Multi-Tenant PMS',
        },

        // Hero
        badgeText: {
            type: String,
            default: 'Next-Generation Multi-Tenant SaaS Property Management',
        },
        heroTitle: {
            type: String,
            default: 'Manage Properties, Leases & Teams in One Cloud Workspace',
        },
        heroSubtitle: {
            type: String,
            default: 'The all-in-one multi-tenant SaaS operating system built for real estate enterprises, property managers, agents, and landlords. Complete with automated rent collection, lease tracking, maintenance dispatch, and dynamic role delegation.',
        },
        primaryCtaText: {
            type: String,
            default: 'Start Free Trial (14-Day Free Trial)',
        },
        secondaryCtaText: {
            type: String,
            default: 'Explore Plans',
        },

        // Metrics
        metrics: {
            type: [
                {
                    val: { type: String, default: '' },
                    label: { type: String, default: '' },
                }
            ],
            default: () => [
                { val: '99.99%', label: 'Cloud SLA & Uptime Guarantee' },
                { val: '500+', label: 'Organizations Powered' },
                { val: '50,000+', label: 'Units & Leases Managed' },
                { val: '$120M+', label: 'Annual Rent Facilitated' },
            ],
        },

        // Features
        featuresBadge: {
            type: String,
            default: 'Enterprise Grade Architecture',
        },
        featuresTitle: {
            type: String,
            default: 'Everything Your Organization Needs to Scale',
        },
        featuresSubtitle: {
            type: String,
            default: 'Engineered with multi-tenant isolation, automated financial ledgers, and intelligent maintenance dispatch.',
        },

        // Modules
        modulesBadge: {
            type: String,
            default: 'Feature Spectrum',
        },
        modulesTitle: {
            type: String,
            default: 'Complete Suite of Real Estate Tools',
        },
        modulesSubtitle: {
            type: String,
            default: 'No third-party plugins needed. Everything you need is integrated directly into your organization dashboard.',
        },

        // Pricing
        pricingBadge: {
            type: String,
            default: 'Transparent SaaS Pricing',
        },
        pricingTitle: {
            type: String,
            default: 'Simple, Predictable Subscription Plans',
        },
        pricingSubtitle: {
            type: String,
            default: 'Start with a 14-day free trial. Scale seamlessly as your property portfolio expands.',
        },

        // Registration
        registrationBadge: {
            type: String,
            default: 'Instant Multi-Tenant Workspace Provisioning',
        },
        registrationTitle: {
            type: String,
            default: 'Create Your Organization Workspace',
        },
        registrationSubtitle: {
            type: String,
            default: 'Get started with your 14-day free trial. No credit card required. Isolated tenant database, custom branding, and automatic 3-tier roles setup.',
        },

        // Testimonials / Reviews
        testimonialsBadge: {
            type: String,
            default: 'Client Endorsements',
        },
        testimonialsTitle: {
            type: String,
            default: 'Trusted by Forward-Thinking Property Leaders',
        },
        testimonialsSubtitle: {
            type: String,
            default: 'See how real estate organizations streamline their daily operations with PropSaaS.',
        },

        // FAQ
        faqBadge: {
            type: String,
            default: 'Got Questions?',
        },
        faqTitle: {
            type: String,
            default: 'Frequently Asked Questions',
        },
        faqSubtitle: {
            type: String,
            default: 'Everything you need to know about the platform, onboarding, and multi-tenancy.',
        },

        // Bottom CTA Banner
        ctaBannerTitle: {
            type: String,
            default: 'Ready to Supercharge Your Real Estate Organization?',
        },
        ctaBannerSubtitle: {
            type: String,
            default: 'Join hundreds of property management leaders. Set up your organization in minutes.',
        },
        ctaBannerButtonText: {
            type: String,
            default: 'Start Free Trial (Free Trial)',
        },

        // Footer
        footerDescription: {
            type: String,
            default: 'The next-generation multi-tenant cloud operating system for real estate enterprises, property managers, agents, and landlords worldwide.',
        },
        footerCopyright: {
            type: String,
            default: 'PropSaaS Platform. All rights reserved.',
        },
    },
    { _id: false }
);

const SaaSSettingsSchema = new Schema<ISaaSSettings>(
    {
        platformName: {
            type: String,
            default: 'PropertyNext SaaS',
        },
        supportEmail: {
            type: String,
            default: 'contact@savemax.ro',
        },
        phone: {
            type: String,
            default: '+1 (555) 019-2834',
        },
        address: {
            type: String,
            default: '100 Enterprise Blvd, Suite 500, San Francisco, CA 94107',
        },
        currency: {
            type: String,
            default: 'USD',
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        trialDays: {
            type: Number,
            default: 14,
        },
        plans: {
            monthly: {
                type: PlanConfigSchema,
                default: () => ({
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
                }),
            },
            yearly: {
                type: PlanConfigSchema,
                default: () => ({
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
                }),
            },
        },
        landingPage: {
            type: LandingPageSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);

const SaaSSettings = (models.SaaSSettings as Model<ISaaSSettings>) || mongoose.model<ISaaSSettings>('SaaSSettings', SaaSSettingsSchema);

export default SaaSSettings;
