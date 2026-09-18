/* Developed by RUDRA via NEKLLM */

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Amenity, initModels } from "@/lib/initModels";
import { checkPermission } from "@/lib/rbac";
import { escapeRegex } from "@/lib/security";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'amenities', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status");

        let query: any = {};

        if (search) {
            query.name = { $regex: escapeRegex(search), $options: "i" };
        }

        if (status) {
            query.status = status;
        }

        query = applyTenantFilter(session, query);

        const amenities = await Amenity.find(query).sort({ name: 1 });

        return NextResponse.json({
            success: true,
            data: amenities
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
        const permissionError = await checkPermission(request, 'amenities', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ success: false, error: "Amenity name is required" }, { status: 400 });
        }

        // Check if exists within same tenant
        const existingQuery = applyTenantFilter(session, {
            name: { $regex: new RegExp(`^${escapeRegex(body.name)}$`, 'i') }
        });
        const existing = await Amenity.findOne(existingQuery);
        if (existing) {
            return NextResponse.json({ success: false, error: "Amenity with this name already exists" }, { status: 400 });
        }

        const payload = injectTenant(session, {
            ...body,
            createdBy: session.user.id
        });

        const amenity = await Amenity.create(payload);

        return NextResponse.json({ success: true, data: amenity });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
