import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Contract from "@/models/Contract";
import { auth } from "@/auth";
import { initModels, User, Property, Commission } from "@/lib/initModels";
import { checkPermission, getViewScope } from "@/lib/rbac";
import { escapeRegex } from "@/lib/security";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'payments', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const viewScope = await getViewScope('payments');

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        const query: any = {};
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('type')) query.paymentType = searchParams.get('type');
        if (searchParams.get('client')) query.client = searchParams.get('client');
        if (searchParams.get('contract')) query.contract = searchParams.get('contract');
        if (searchParams.get('property')) query.property = searchParams.get('property');
        if (searchParams.get('unit')) query.unit = searchParams.get('unit');

        // Apply filters based on view scope
        if (viewScope === 'all') {
            // Show all records
        } else if (viewScope === 'own' && session?.user?.id) {
            query.client = session.user.id;
        } else {
            // Default: show nothing
            return NextResponse.json({ success: true, data: [] });
        }

        // Apply tenant isolation
        const { applyTenantFilter, injectTenant } = await import('@/lib/tenant');
        Object.assign(query, applyTenantFilter(session, query));

        if (search) {
            const safeSearch = escapeRegex(search);
            // Search in invoice number, notes, OR client name
            const matchingClients = await User.find({
                name: { $regex: safeSearch, $options: "i" }
            }).select('_id');

            const searchFilter = {
                $or: [
                    { invoiceNumber: { $regex: safeSearch, $options: "i" } },
                    { notes: { $regex: safeSearch, $options: "i" } },
                    { client: { $in: matchingClients.map(c => c._id) } }
                ]
            };

            // Combine with existing query
            if (query.client) {
                // If we already filtered by own ID, we must intersect
                if (query.$and) {
                    query.$and.push(searchFilter);
                } else {
                    const existing: any = { status: query.status, paymentType: query.paymentType, property: query.property, unit: query.unit, contract: query.contract, client: query.client };
                    Object.keys(existing).forEach(k => !existing[k] && delete existing[k]);
                    query.$and = [existing, searchFilter];
                    delete query.status;
                    delete query.paymentType;
                    delete query.property;
                    delete query.unit;
                    delete query.contract;
                    delete query.client;
                }
            } else {
                Object.assign(query, searchFilter);
            }
        }

        const skip = (page - 1) * limit;

        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('property', 'title location')
                .populate('unit', 'unitNumber floor block')
                .populate('client', 'name email phone')
                .populate('processedBy', 'name')
                .populate('depositHistory.processedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Payment.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: payments,
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
        // Check Permissions
        const permissionError = await checkPermission(request, 'payments', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
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

        // Resolve tenant timezone for data creation & invoice number
        const { injectTenant, getTenantTimezone } = await import('@/lib/tenant');
        const { getDateCodeInTimezone } = await import('@/lib/dateUtils');
        const tenantTimezone = await getTenantTimezone(session);

        // Generate Invoice Number: INV-DATE-RANDOM in tenant timezone
        const dateStr = getDateCodeInTimezone(new Date(), tenantTimezone);
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${dateStr}-${randomStr}`;

        // Initialize deposit history if receivedAmount > 0
        const depositHistory = [];
        if (cleanedBody.receivedAmount && cleanedBody.receivedAmount > 0) {
            depositHistory.push({
                amount: cleanedBody.receivedAmount,
                date: new Date(),
                method: cleanedBody.paymentMethod || 'Cash',
                processedBy: (session.user as any).id,
                notes: 'Initial payment received upon creation'
            });
        }

        const paymentData = injectTenant(session, {
            ...cleanedBody,
            invoiceNumber,
            processedBy: (session.user as any).id,
            depositHistory
        });

        const payment = await Payment.create(paymentData);

        // Generate Commission for Agent
        try {
            const currentProperty = await Property.findById(cleanedBody.property).populate('agent');
            if (currentProperty && currentProperty.agent) {
                const agent: any = await User.findById(currentProperty.agent);
                if (agent && agent.agentDetails) {
                    const rate = agent.agentDetails.commissionValue || 0;
                    const amount = agent.agentDetails.commissionType === 'percentage'
                        ? (cleanedBody.amount * rate) / 100
                        : rate;

                    await Commission.create({
                        agent: currentProperty.agent,
                        property: currentProperty._id,
                        contract: cleanedBody.contract,
                        payment: (payment as any)._id,
                        amount: amount,
                        rate: rate,
                        type: currentProperty.purpose as any,
                        status: 'Pending',
                        notes: `Commission for ${cleanedBody.paymentType} payment - Invoice ${invoiceNumber}`
                    });
                }
            }
        } catch (commError) {
            console.error("Error creating commission:", commError);
        }

        return NextResponse.json({ success: true, data: payment }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
