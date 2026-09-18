/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { User, Role, Property, Commission } from "@/lib/initModels";
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
        const permissionError = await checkPermission(request, 'agents', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        // 1. Find the roles for strict filtering scoped to tenant
        const [agentRole, ownerRole, managerRole, superAdminRole, adminRole, customerRole] = await Promise.all([
            Role.findOne(applyTenantFilter(session, { name: /^Agent$/i })),
            Role.findOne(applyTenantFilter(session, { name: /^Owner$/i })),
            Role.findOne(applyTenantFilter(session, { name: /^Manager$/i })),
            Role.findOne({ name: /^Super Admin$/i }),
            Role.findOne(applyTenantFilter(session, { name: /^Admin$/i })),
            Role.findOne(applyTenantFilter(session, { name: /^Customer$/i }))
        ]);

        let query: any = {
            $and: [
                {
                    $or: [
                        { "agentDetails.commissionValue": { $exists: true } },
                        { "agentDetails.commissionType": { $exists: true } },
                        ...(agentRole ? [{ role: agentRole._id }] : [])
                    ]
                },
                // Explicitly exclude anyone who is clearly an owner
                { ownerDetails: { $exists: false } }
            ]
        };

        // Explicitly exclude system / non‑agent roles from this listing.
        const excludedRoles = [
            ownerRole?._id,
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
                    { phone: { $regex: safeSearch, $options: "i" } }
                ]
            });
        }

        query = applyTenantFilter(session, query);
        const skip = (page - 1) * limit;

        // 2. Fetch all users matching the query
        const [agents, total, allAgents] = await Promise.all([
            User.find(query)
                .select('-password')
                .populate('role')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(query),
            User.find(query).select('_id')
        ]);

        // 3. For each agent, fetch performance stats scoped to tenant
        const agentsWithStats = await Promise.all(agents.map(async (agent: any) => {
            const propQuery = applyTenantFilter(session, { agent: agent._id });
            const listingsCount = await Property.countDocuments(propQuery);
            const commQuery = applyTenantFilter(session, {
                agent: agent._id,
                status: { $in: ['Pending', 'Approved', 'Paid'] }
            });
            const commissions = await Commission.find(commQuery);
            const totalEarnings = commissions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const paidEarnings = commissions
                .filter(c => c.status === 'Paid')
                .reduce((acc, curr) => acc + (curr.amount || 0), 0);

            return {
                ...agent.toObject(),
                listingsCount,
                totalEarnings,
                paidEarnings
            };
        }));

        // 4. Calculate global stats for cards scoped to tenant
        const commGlobalQuery = applyTenantFilter(session, {
            status: { $in: ['Pending', 'Approved', 'Paid'] }
        });
        const globalCommissions = await Commission.find(commGlobalQuery);
        const totalPaidCommissions = globalCommissions
            .filter(c => c.status === 'Paid')
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const totalEarnedCommissions = globalCommissions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        return NextResponse.json({
            success: true,
            data: agentsWithStats,
            stats: {
                totalAgents: allAgents.length,
                totalPaidCommissions,
                totalEarnedCommissions
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
        const permissionError = await checkPermission(request, 'agents', 'create');
        if (permissionError) return permissionError;

        const session = await auth();
        const body = await request.json();
        let roleId = body.role;

        // If no role is provided, try to attach the default Agent role scoped to tenant
        if (!roleId) {
            let agentRole = await Role.findOne(applyTenantFilter(session, { name: 'Agent' }));
            if (agentRole) {
                roleId = agentRole._id;
            }
        }

        const payload: any = injectTenant(session, { ...body });
        if (roleId) {
            payload.role = roleId;
        }

        const agent = await User.create(payload);

        return NextResponse.json({ success: true, data: agent });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
