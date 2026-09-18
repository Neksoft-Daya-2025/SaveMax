/* Developed by RUDRA via NEKLLM */

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { auth } from "@/auth";
import { initModels } from "@/lib/initModels";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";

export async function GET(request: Request) {
    try {
        await connectToDB();
        initModels();
        const session = await auth();
        const { searchParams } = new URL(request.url);

        let query: any = {};
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('category')) query.category = searchParams.get('category');
        if (searchParams.get('featured')) query.isFeatured = true;

        query = applyTenantFilter(session, query);

        const blogs = await BlogPost.find(query)
            .populate('author', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: blogs });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        const body = await request.json();

        // Generate slug if not provided
        if (!body.slug) {
            body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        const payload = injectTenant(session, {
            ...body,
            author: (session.user as any).id
        });

        const blog = await BlogPost.create(payload);

        return NextResponse.json({ success: true, data: blog }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
