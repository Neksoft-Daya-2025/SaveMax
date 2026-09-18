/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { User, Role, Property } from "@/lib/initModels";
import { initModels } from "@/lib/initModels";
import { checkPermission } from "@/lib/rbac";
import { escapeRegex } from "@/lib/security";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'owners', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        // 1. Find the roles for strict filtering scoped to tenant
        const [ownerRole, agentRole, managerRole, superAdminRole, adminRole, customerRole] = await Promise.all([
            Role.findOne(applyTenantFilter(session, { name: /^Owner$/i })),
            Role.findOne(applyTenantFilter(session, { name: /^Agent$/i })),
            Role.findOne(applyTenantFilter(session, { name: /^Manager$/i })),
            Role.findOne({ name: /^Super Admin$/i }),
            Role.findOne(applyTenantFilter(session, { name: /^Admin$/i })),
            Role.findOne(applyTenantFilter(session, { name: /^Customer$/i }))
        ]);

        let query: any = {
            $and: [
                {
                    $or: [
                        { ownerDetails: { $exists: true } },
                        ...(ownerRole ? [{ role: ownerRole._id }] : [])
                    ]
                },
                // Only exclude if they have definite agent properties
                { "agentDetails.commissionValue": { $exists: false } }
            ]
        };

        // Explicitly exclude system / non‑owner roles from this listing.
        const excludedRoles = [
            agentRole?._id,
            managerRole?._id,
            superAdminRole?._id,
            adminRole?._id,
            customerRole?._id
        ].filter(Boolean);

        if (excludedRoles.length > 0) {
            query.$and.push({ role: { $nin: excludedRoles } });
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            query.$and.push({
                $or: [
                    { name: { $regex: safeSearch, $options: "i" } },
                    { email: { $regex: safeSearch, $options: "i" } },
                    { phone: { $regex: safeSearch, $options: "i" } },
                    { "ownerDetails.companyName": { $regex: safeSearch, $options: "i" } }
                ]
            });
        }

        query = applyTenantFilter(session, query);
        const skip = (page - 1) * limit;

        // 2. Fetch all users matching the query
        const [owners, total, allOwners] = await Promise.all([
            User.find(query)
                .select('-password')
                .populate('role')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(query),
            User.find(query).select('_id')
        ]);

        // 3. For each owner, fetch stats (Property count) scoped to tenant
        const ownersWithStats = await Promise.all(owners.map(async (owner: any) => {
            const propQuery = applyTenantFilter(session, { owner: owner._id });
            const propertiesCount = await Property.countDocuments(propQuery);

            return {
                ...owner.toObject(),
                propertiesCount
            };
        }));

        // 4. Global Stats scoped to tenant
        const totalPropertiesQuery = applyTenantFilter(session, {});
        const totalProperties = await Property.countDocuments(totalPropertiesQuery);

        return NextResponse.json({
            success: true,
            data: ownersWithStats,
            stats: {
                totalOwners: allOwners.length,
                totalProperties
            },
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'owners', 'create');
        if (permissionError) return permissionError;

        const session = await auth();
        const body = await request.json();
        let roleId = body.role;

        // If no role is provided, try to attach the default Owner role scoped to tenant
        if (!roleId) {
            let ownerRole = await Role.findOne(applyTenantFilter(session, { name: /^Owner$/i }));
            if (!ownerRole) {
                ownerRole = await Role.findOne({ name: /^Owner$/i });
            }
            if (ownerRole) {
                roleId = ownerRole._id;
            }
        }

        const payload: any = injectTenant(session, { ...body });
        delete payload.customerDetails;
        if (roleId) {
            payload.role = roleId;
        } else {
            delete payload.role;
        }

        const owner = await User.create(payload);

        return NextResponse.json({ success: true, data: owner });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
