
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Staff from "@/models/Staff";
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
        const permissionError = await checkPermission(request, 'staff', 'view');
        if (permissionError) return permissionError;

        const session: any = await auth();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        let query: any = { isActive: true };
        if (search) {
            query.name = { $regex: escapeRegex(search), $options: "i" };
        }

        query = applyTenantFilter(session, query);

        const [staffMembers, total] = await Promise.all([
            Staff.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Staff.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: staffMembers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch staff" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'staff', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        const body = await request.json();
        const payload = injectTenant(session, body);
        const staff = await Staff.create(payload);
        return NextResponse.json({ success: true, data: staff });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create staff" }, { status: 500 });
    }
}
