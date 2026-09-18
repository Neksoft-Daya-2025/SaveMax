/* Developed by RUDRA via NEKLLM */
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { createDefaultOrganizationRoles } from '@/lib/tenant';
import { Organization, User, SaaSSettings } from '@/lib/initModels';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const {
            name,
            email,
            phone = '',
            address = '',
            plan = 'monthly',
            adminName,
            adminEmail,
            adminPassword,
            currency: customCurrency,
            timezone: customTimezone,
        } = body;

        // 1. Validation
        if (!name || !name.trim()) {
            return NextResponse.json(
                { success: false, error: 'Organization / Company name is required.' },
                { status: 400 }
            );
        }

        if (!email || !email.trim()) {
            return NextResponse.json(
                { success: false, error: 'Organization contact email is required.' },
                { status: 400 }
            );
        }

        if (!adminEmail || !adminEmail.trim()) {
            return NextResponse.json(
                { success: false, error: 'Administrator email is required.' },
                { status: 400 }
            );
        }

        if (!adminPassword || adminPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Administrator password must be at least 6 characters.' },
                { status: 400 }
            );
        }

        const normalizedAdminEmail = adminEmail.toLowerCase().trim();
        const normalizedOrgEmail = email.toLowerCase().trim();

        // 2. Check if a user with this admin email already exists
        const existingUser = await User.findOne({ email: normalizedAdminEmail });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: `An account with email ${normalizedAdminEmail} already exists. Please use a different email or log in.` },
                { status: 409 }
            );
        }

        // 3. Generate a clean and unique URL slug
        let baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        if (!baseSlug) baseSlug = 'org';

        let slug = baseSlug;
        let counter = 1;
        while (await Organization.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // 4. Retrieve SaaS platform settings for defaults
        const saasSettings: any = await SaaSSettings.findOne().lean();
        const trialDays = saasSettings?.trialDays || 14;
        const planKey = plan === 'yearly' ? 'yearly' : 'monthly';
        const planConfig = saasSettings?.plans?.[planKey];
        const planAmount = planConfig?.price || (planKey === 'yearly' ? 490 : 49);
        const orgCurrency = customCurrency || saasSettings?.currency || 'USD';
        const orgTimezone = customTimezone || saasSettings?.timezone || 'UTC';

        // Calculate 14-day trial period dates
        const startDate = new Date();
        const trialEndDate = new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000);

        // 5. Create Organization
        const organization = await Organization.create({
            name: name.trim(),
            slug,
            email: normalizedOrgEmail,
            phone: phone.trim(),
            address: address.trim(),
            status: 'active',
            subscription: {
                plan: planKey,
                status: 'trial',
                billingCycle: planKey,
                amount: planAmount,
                currency: orgCurrency,
                startDate,
                endDate: trialEndDate,
                autoRenew: true,
            },
            settings: {
                storeName: name.trim(),
                email: normalizedOrgEmail,
                phone: phone.trim(),
                address: address.trim(),
                currency: orgCurrency,
                timezone: orgTimezone,
                taxRate: 0,
            }
        });

        // 6. Initialize default 3-tier roles (Admin, Agent, Customer)
        const { adminRole, agentRole, customerRole } = await createDefaultOrganizationRoles(organization._id);

        // 7. Create Primary Admin User
        const adminUser: any = await User.create({
            name: (adminName && adminName.trim()) || `${name.trim()} Admin`,
            email: normalizedAdminEmail,
            password: adminPassword,
            role: adminRole._id,
            organization: organization._id,
            status: 'Active',
            emailVerified: true,
        });

        // 8. Associate Admin User with Organization
        organization.adminUser = adminUser._id;
        await organization.save();

        console.log(`🎉 Self-registered organization: ${organization.name} (${organization.slug}) by ${adminUser.email}`);

        return NextResponse.json({
            success: true,
            message: 'Organization created successfully! Your 14-day free trial has been activated.',
            data: {
                organization: {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                    email: organization.email,
                    plan: organization.subscription.plan,
                    status: organization.subscription.status,
                    trialDays,
                    trialEndDate,
                },
                admin: {
                    id: adminUser._id,
                    name: adminUser.name,
                    email: adminUser.email,
                },
                roles: {
                    adminRoleId: adminRole._id,
                    agentRoleId: agentRole._id,
                    customerRoleId: customerRole._id,
                }
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating public organization:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create organization. Please try again.' },
            { status: 500 }
        );
    }
}
