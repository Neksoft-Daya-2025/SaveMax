import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext, createDefaultOrganizationRoles } from '@/lib/tenant';
import { Organization, User, SaaSSettings } from '@/lib/initModels';
import { escapeRegex } from '@/lib/security';

// GET /api/superadmin/organizations - List organizations with pagination & filters
export async function GET(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const plan = searchParams.get('plan');
        const skip = (page - 1) * limit;

        const query: any = {};

        if (search) {
            const safe = escapeRegex(search);
            query.$or = [
                { name: { $regex: safe, $options: 'i' } },
                { email: { $regex: safe, $options: 'i' } },
                { slug: { $regex: safe, $options: 'i' } },
            ];
        }

        if (status) {
            query.status = status;
        }

        if (plan) {
            query['subscription.plan'] = plan;
        }

        const [organizations, total] = await Promise.all([
            Organization.find(query)
                .populate('adminUser', 'name email phone status')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Organization.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: organizations,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        });
    } catch (error: any) {
        console.error('Error fetching organizations:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/superadmin/organizations - Provision new organization + roles + admin
export async function POST(request: NextRequest) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();
        const {
            name,
            email,
            phone,
            address,
            plan = 'monthly',
            billingCycle = 'monthly',
            subscriptionStatus = 'active',
            adminName,
            adminEmail,
            adminPassword,
        } = body;

        // Validation
        if (!name || !email || !adminEmail || !adminPassword) {
            return NextResponse.json(
                { success: false, error: 'Organization name, organization email, admin email, and admin password are required' },
                { status: 400 }
            );
        }

        if (adminPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Admin password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if admin user email already exists
        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase().trim() });
        if (existingAdmin) {
            return NextResponse.json(
                { success: false, error: `A user with email ${adminEmail} already exists.` },
                { status: 400 }
            );
        }

        // Generate URL-friendly unique slug
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

        // Get SaaS plan price & currency from SaaSSettings
        const saasSettings = await SaaSSettings.findOne().lean();
        const planKey = plan === 'yearly' ? 'yearly' : 'monthly';
        const planConfig = (saasSettings as any)?.plans?.[planKey];
        const planAmount = planConfig?.price || (planKey === 'yearly' ? 490 : 49);
        const currency = (saasSettings as any)?.currency || 'USD';

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (plan === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // 1. Create Organization document
        const orgTimezone = body.timezone || (saasSettings as any)?.timezone || 'UTC';
        const orgCurrency = body.currency || currency;

        const organization = await Organization.create({
            name: name.trim(),
            slug,
            email: email.toLowerCase().trim(),
            phone: phone || '',
            address: address || '',
            status: 'active',
            subscription: {
                plan: planKey,
                status: subscriptionStatus,
                billingCycle: billingCycle || planKey,
                amount: planAmount,
                currency: orgCurrency,
                startDate,
                endDate,
                autoRenew: true,
            },
            settings: {
                storeName: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone || '',
                address: address || '',
                currency: orgCurrency,
                timezone: orgTimezone,
                taxRate: 0,
            }
        });

        // 2. Automatically create the 3 standard roles for this organization (Admin, Agent, Customer)
        const { adminRole, agentRole, customerRole } = await createDefaultOrganizationRoles(organization._id);

        // 3. Create the primary Organization Admin User
        const adminUser: any = await User.create({
            name: adminName.trim() || 'Organization Admin',
            email: adminEmail.toLowerCase().trim(),
            password: adminPassword,
            role: adminRole._id,
            organization: organization._id,
            status: 'Active',
            emailVerified: true,
        });

        // 4. Update organization with adminUser reference
        organization.adminUser = adminUser._id;
        await organization.save();

        console.log(`✅ Organization created: ${organization.name} (${organization.slug}) with Admin: ${adminUser.email}`);

        return NextResponse.json({
            success: true,
            message: 'Organization created successfully!',
            data: {
                organization: {
                    id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                    email: organization.email,
                    plan: organization.subscription.plan,
                    status: organization.status,
                    startDate: organization.subscription.startDate,
                    endDate: organization.subscription.endDate,
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
        console.error('Error creating organization:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create organization' }, { status: 500 });
    }
}
