
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Commission from "@/models/Commission";
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
        if (searchParams.get('agent')) query.agent = searchParams.get('agent');
        if (searchParams.get('status')) query.status = searchParams.get('status');

        query = applyTenantFilter(session, query);

        const commissions = await Commission.find(query)
            .populate('agent', 'name email')
            .populate('property', 'title location')
            .populate('contract', 'type details')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: commissions });
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

        const payload = injectTenant(session, body);
        const commission = await Commission.create(payload);

        return NextResponse.json({ success: true, data: commission }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
