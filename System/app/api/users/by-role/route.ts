/* Developed by RUDRA via NEKLLM */
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Role, User } from "@/lib/initModels";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";
import { auth } from "@/auth";

/**
 * GET /api/users/by-role?role=Agent
 * Fetches users by role name scoped to current tenant
 */
export async function GET(request: Request) {
    try {
        await connectToDB();

        const session = await auth();
        const { searchParams } = new URL(request.url);
        const roleName = searchParams.get("role");

        if (!roleName) {
            return NextResponse.json({
                success: false,
                error: "Role parameter is required"
            }, { status: 400 });
        }

        // Find the role scoped to tenant or system
        const roleQuery = applyTenantFilter(session, {
            name: { $regex: new RegExp(`^${roleName}$`, 'i') }
        });
        let role = await Role.findOne(roleQuery);

        if (!role) {
            // Check if global system role exists
            role = await Role.findOne({ name: { $regex: new RegExp(`^${roleName}$`, 'i') } });
        }

        if (!role) {
            return NextResponse.json({
                success: true,
                data: [],
                count: 0
            });
        }

        // Fetch users with this role scoped to tenant
        let userQuery: any = { role: role._id };
        userQuery = applyTenantFilter(session, userQuery);

        const users = await User.find(userQuery)
            .select('-password')
            .populate('role', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: users,
            role: {
                id: role._id,
                name: role.name
            },
            count: users.length
        });

    } catch (error: any) {
        console.error("Error fetching users by role:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
