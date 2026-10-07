
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, Role } from '@/lib/initModels';
import { checkPermission } from '@/lib/rbac';
import { escapeRegex } from '@/lib/security';
import { applyTenantFilter, injectTenant } from '@/lib/tenant';
import { auth } from '@/auth';

// GET /api/users - List all users
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check Permissions
        const permissionError = await checkPermission(request, 'users', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "100"); // Increased default for dropdowns
        const search = searchParams.get("search") || "";
        const roleName = searchParams.get("role");

        let query: any = {};

        if (search) {
            const safeSearch = escapeRegex(search);
            query.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { email: { $regex: safeSearch, $options: "i" } }
            ];
        }

        if (roleName) {
            // Case-insensitive role search with escaped input scoped to tenant
            const roleQuery = applyTenantFilter(session, {
                name: { $regex: new RegExp(`^${escapeRegex(roleName)}$`, 'i') }
            });
            const role = await Role.findOne(roleQuery);
            if (role) {
                query.role = role._id;
            } else {
                return NextResponse.json({
                    success: true,
                    data: [],
                    pagination: { page, limit, total: 0, pages: 0 }
                });
            }
        } else {
            // By default, only return users that have a role assigned
            query.role = { $exists: true, $ne: null };
        }

        // Apply tenant isolation filter (superadmin excluded, regular users scoped to their org)
        query = applyTenantFilter(session, query);

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .populate('role', 'name description')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: users,
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

// POST /api/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check Permissions
        const permissionError = await checkPermission(request, 'users', 'create');
        if (permissionError) return permissionError;

        const session = await auth();
        const body = await request.json();

        const payload = injectTenant(session, body);
        const user: any = await User.create(payload);

        // Return without password
        const userObj = user.toObject();
        delete userObj.password;

        return NextResponse.json({ success: true, data: userObj }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
