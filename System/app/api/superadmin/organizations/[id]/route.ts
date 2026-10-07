import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getTenantContext } from '@/lib/tenant';
import { Organization, User, Property, Unit, Customer, Contract, Payment, Maintenance, Role } from '@/lib/initModels';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/superadmin/organizations/[id] - Get organization details & usage statistics
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        const { id } = await params;
        await connectDB();

        const organization: any = await Organization.findById(id).populate('adminUser', 'name email phone status').lean();

        if (!organization) {
            return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
        }

        // Fetch usage counts for this organization
        const [propertiesCount, unitsCount, tenantsCount, usersCount, contractsCount, maintenanceCount] = await Promise.all([
            Property.countDocuments({ organization: organization._id }),
            Unit.countDocuments({ organization: organization._id }),
            Customer.countDocuments({ organization: organization._id }),
            User.countDocuments({ organization: organization._id }),
            Contract.countDocuments({ organization: organization._id }),
            Maintenance.countDocuments({ organization: organization._id }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                ...organization,
                stats: {
                    propertiesCount,
                    unitsCount,
                    tenantsCount,
                    usersCount,
                    contractsCount,
                    maintenanceCount,
                }
            }
        });
    } catch (error: any) {
        console.error('Error fetching organization details:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT /api/superadmin/organizations/[id] - Update organization details / subscription
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        const { id } = await params;
        await connectDB();
        const body = await request.json();

        const organization = await Organization.findById(id);
        if (!organization) {
            return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
        }

        // Update basic details if provided
        if (body.name) organization.name = body.name.trim();
        if (body.email) organization.email = body.email.toLowerCase().trim();
        if (body.phone !== undefined) organization.phone = body.phone;
        if (body.address !== undefined) organization.address = body.address;
        if (body.status) organization.status = body.status;

        // Update subscription if provided
        if (body.subscription) {
            organization.subscription = {
                ...organization.subscription,
                ...body.subscription,
            };
        }

        // If plan changed directly
        if (body.plan) {
            organization.subscription.plan = body.plan;
            organization.subscription.billingCycle = body.plan;
        }

        if (body.subscriptionStatus) {
            organization.subscription.status = body.subscriptionStatus;
        }

        if (body.endDate) {
            organization.subscription.endDate = new Date(body.endDate);
        }

        // Reset Admin password if requested
        if (body.newAdminPassword && organization.adminUser) {
            if (body.newAdminPassword.length < 6) {
                return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
            }
            const adminUser = await User.findById(organization.adminUser);
            if (adminUser) {
                adminUser.password = body.newAdminPassword;
                await adminUser.save();
            }
        }

        await organization.save();

        return NextResponse.json({
            success: true,
            message: 'Organization updated successfully',
            data: organization,
        });
    } catch (error: any) {
        console.error('Error updating organization:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE /api/superadmin/organizations/[id] - Delete an organization
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { isSuperAdmin } = await getTenantContext(request);
        if (!isSuperAdmin) {
            return NextResponse.json({ success: false, error: 'Access denied: Super Administrator access required' }, { status: 403 });
        }

        const { id } = await params;
        await connectDB();

        const organization = await Organization.findById(id);
        if (!organization) {
            return NextResponse.json({ success: false, error: 'Organization not found' }, { status: 404 });
        }

        // Cascade delete or archive all organization data
        await Promise.all([
            User.deleteMany({ organization: organization._id }),
            Role.deleteMany({ organization: organization._id }),
            Property.deleteMany({ organization: organization._id }),
            Unit.deleteMany({ organization: organization._id }),
            Customer.deleteMany({ organization: organization._id }),
            Contract.deleteMany({ organization: organization._id }),
            Payment.deleteMany({ organization: organization._id }),
            Maintenance.deleteMany({ organization: organization._id }),
            Organization.findByIdAndDelete(id),
        ]);

        return NextResponse.json({
            success: true,
            message: 'Organization and associated data deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting organization:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
