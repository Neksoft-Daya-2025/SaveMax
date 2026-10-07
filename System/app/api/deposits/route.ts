
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { initModels, Deposit, Property } from "@/lib/initModels";
import { auth } from "@/auth";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";

export async function GET(request: Request) {
    try {
        await connectToDB();
        initModels();

        const session = await auth();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        let query: any = {};
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('type')) query.type = searchParams.get('type');
        if (searchParams.get('client')) query.client = searchParams.get('client');
        if (searchParams.get('contract')) query.contract = searchParams.get('contract');

        if (search) {
            query.$or = [
                { receiptNumber: { $regex: search, $options: "i" } },
                { notes: { $regex: search, $options: "i" } }
            ];
        }

        query = applyTenantFilter(session, query);
        const skip = (page - 1) * limit;

        const [deposits, total] = await Promise.all([
            Deposit.find(query)
                .populate('property', 'title location')
                .populate('unit', 'unitNumber floor block')
                .populate('client', 'name email phone')
                .populate('processedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Deposit.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: deposits,
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

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        initModels();
        const body = await request.json();

        // Sanitize empty fields
        const cleanedBody = { ...body };
        if (cleanedBody.client === "") delete cleanedBody.client;
        if (cleanedBody.property === "") delete cleanedBody.property;
        if (cleanedBody.unit === "") delete cleanedBody.unit;
        if (cleanedBody.contract === "") delete cleanedBody.contract;

        // Resolve tenant timezone for receipt number generation
        const { getTenantTimezone } = await import('@/lib/tenant');
        const { getDateCodeInTimezone } = await import('@/lib/dateUtils');
        const tenantTimezone = await getTenantTimezone(session);

        // Generate Receipt Number: DEP-DATE-RANDOM in tenant timezone
        const dateStr = getDateCodeInTimezone(new Date(), tenantTimezone);
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        const receiptNumber = `DEP-${dateStr}-${randomStr}`;

        const payload = injectTenant(session, {
            ...cleanedBody,
            receiptNumber,
            processedBy: (session.user as any).id
        });

        const deposit = await Deposit.create(payload);

        return NextResponse.json({ success: true, data: deposit }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
