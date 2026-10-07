import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Role } from '@/lib/initModels';
import { checkPermission, getViewScope } from '@/lib/rbac';
import { auth } from '@/auth';
import { escapeRegex } from '@/lib/security';
import { applyTenantFilter, injectTenant } from '@/lib/tenant';

// GET /api/customers - List all customers
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check Permissions
        const permissionError = await checkPermission(request, 'customers', 'view');
        if (permissionError) return permissionError;

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const session: any = await auth();

        // Find all Customer role IDs (both tenant-scoped and system-wide)
        const customerRoles = await Role.find({ name: /^Customer$/i }).select('_id');
        const customerRoleIds = customerRoles.map(r => r._id);

        // Find all non-customer roles (Admin, Super Admin, Agent, Owner, Staff, Manager)
        const nonCustomerRoles = await Role.find({
            name: { $in: [/^Admin$/i, /^Super Admin$/i, /^SuperAdmin$/i, /^Agent$/i, /^Owner$/i, /^Manager$/i, /^Staff$/i] }
        }).select('_id');
        const nonCustomerRoleIds = nonCustomerRoles.map(r => r._id);

        const scope = await getViewScope('customers');

        if (scope === 'none') {
            return NextResponse.json({
                success: true,
                data: [],
                pagination: { total: 0, page: 1, limit, pages: 0 }
            });
        }

        let query: any = {
            $and: [
                {
                    $or: [
                        { role: { $in: customerRoleIds } },
                        {
                            $and: [
                                { customerDetails: { $exists: true } },
                                { role: { $nin: nonCustomerRoleIds } }
                            ]
                        }
                    ]
                },
                // Explicitly exclude Owners
                { ownerDetails: { $exists: false } },
                { "ownerDetails.companyName": { $exists: false } },
                // Explicitly exclude Agents
                { "agentDetails.commissionValue": { $exists: false } },
                // Explicitly exclude SuperAdmins
                { isSuperAdmin: { $ne: true } }
            ]
        };

        // Apply tenant isolation
        query = applyTenantFilter(session, query);

        // Scope filter for agents: only see their assigned customers
        if (scope === 'own' && session?.user?.id) {
            query.$and.push({ 'customerDetails.assignedAgents': session.user.id });
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            query.$and.push({
                $or: [
                    { name: { $regex: safeSearch, $options: 'i' } },
                    { email: { $regex: safeSearch, $options: 'i' } },
                    { phone: { $regex: safeSearch, $options: 'i' } }
                ]
            });
        }

        const customers = await User.find(query)
            .select('-password')
            .populate('role')
            .populate('customerDetails.assignedAgents', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check Permissions
        const permissionError = await checkPermission(request, 'customers', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        const body = await request.json();
        let roleId = body.role;

        if (!roleId) {
            let customerRole = await Role.findOne(applyTenantFilter(session, { name: /^Customer$/i }));
            if (!customerRole) {
                customerRole = await Role.findOne({ name: /^Customer$/i });
            }
            if (customerRole) roleId = customerRole._id;
        }

        const payload: any = injectTenant(session, {
            ...body,
            customerDetails: {
                address: body.address,
                notes: body.notes,
                assignedAgents: body.assignedAgents
            }
        });

        if (roleId) payload.role = roleId;

        const customer = await User.create(payload);

        return NextResponse.json({ success: true, data: customer }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
