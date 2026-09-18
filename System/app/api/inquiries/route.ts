/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { auth } from "@/auth";
import { initModels } from "@/lib/initModels";
import { checkPermission, getViewScope } from "@/lib/rbac";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'inquiries', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const viewScope = await getViewScope('inquiries');

        const { searchParams } = new URL(request.url);

        let query: any = {};
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('property')) query.property = searchParams.get('property');

        // Apply filters based on view scope
        if (viewScope === 'all') {
            // Show all records (Admin/Agent)
        } else if (viewScope === 'own' && session?.user?.email) {
            // Customer only see inquiries matching their email
            query.email = session.user.email.toLowerCase().trim();
        } else {
            // Default: show nothing or unexpected scope
            return NextResponse.json({ success: true, data: [] });
        }

        // Apply tenant isolation filter
        query = applyTenantFilter(session, query);

        const inquiries = await Inquiry.find(query)
            .populate('property', 'title price')
            .populate('unit', 'unitNumber floor block')
            .populate('agent', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: inquiries });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check Permissions
        const permissionError = await checkPermission(request, 'inquiries', 'create');
        if (permissionError) return permissionError;

        const session = await auth();

        await connectToDB();
        initModels();
        const body = await request.json();
        const cleanedBody = { ...body };

        // Tag the inquiry with the current user if they are logged in
        if (session?.user) {
            const user: any = session.user;
            cleanedBody.customer = user.id;

            // Optional: fallback for name/email/phone if not provided
            if (!cleanedBody.name) cleanedBody.name = user.name;
            if (!cleanedBody.email) cleanedBody.email = user.email;
            if (!cleanedBody.phone) cleanedBody.phone = user.phone;
        }

        // Clean up fields sent as empty strings to avoid validation/BSON errors
        const fieldsToClean = ['property', 'unit', 'agent', 'customer', 'phone', 'name', 'email'];
        fieldsToClean.forEach(field => {
            if (cleanedBody[field] === "") delete cleanedBody[field];
        });

        const payload = injectTenant(session, cleanedBody);
        const inquiry = await Inquiry.create(payload);
        return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
