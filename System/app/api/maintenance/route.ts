
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Property, Unit } from "@/lib/initModels";
import Maintenance from "@/models/Maintenance";
import { auth } from "@/auth";
import { initModels } from "@/lib/initModels";
import { checkPermission, getViewScope } from "@/lib/rbac";
import { escapeRegex } from "@/lib/security";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'maintenance', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const viewScope = await getViewScope('maintenance');

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const limit = parseInt(searchParams.get("limit") || "10");
        const page = parseInt(searchParams.get("page") || "1");

        let query: any = {};
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('priority')) query.priority = searchParams.get('priority');
        if (searchParams.get('property')) query.property = searchParams.get('property');
        if (searchParams.get('unit')) query.unit = searchParams.get('unit');

        // Apply filters based on view scope
        if (viewScope === 'all') {
            // Show all
        } else if (viewScope === 'own' && session?.user?.id) {
            if (session.user.role === 'Agent') {
                query.assignedTo = session.user.id;
            } else {
                query.requestedBy = session.user.id;
            }
        } else {
            // Default: show nothing
            return NextResponse.json({ success: true, data: [] });
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            // Search in title or description or matched properties
            const matchedPropertiesQuery = applyTenantFilter(session, {
                title: { $regex: safeSearch, $options: "i" }
            });
            const matchedProperties = await Property.find(matchedPropertiesQuery).select('_id');

            const searchFilter = {
                $or: [
                    { title: { $regex: safeSearch, $options: "i" } },
                    { description: { $regex: safeSearch, $options: "i" } },
                    { property: { $in: matchedProperties.map(p => p._id) } }
                ]
            };

            // Combine with existing query
            if (query.requestedBy || query.assignedTo) {
                // If we already filtered by own ID, we must intersect
                if (query.$and) {
                    query.$and.push(searchFilter);
                } else {
                    const existing: any = { status: query.status, priority: query.priority, property: query.property, unit: query.unit, requestedBy: query.requestedBy, assignedTo: query.assignedTo };
                    Object.keys(existing).forEach(k => !existing[k] && delete existing[k]);
                    query.$and = [existing, searchFilter];
                    delete query.status;
                    delete query.priority;
                    delete query.property;
                    delete query.unit;
                    delete query.requestedBy;
                    delete query.assignedTo;
                }
            } else {
                Object.assign(query, searchFilter);
            }
        }

        // Apply tenant isolation filter
        query = applyTenantFilter(session, query);

        const skip = (page - 1) * limit;

        const [maintenance, total] = await Promise.all([
            Maintenance.find(query)
                .populate('property', 'title')
                .populate('unit', 'unitNumber block')
                .populate('assignedTo', 'name')
                .populate('requestedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Maintenance.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: maintenance,
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
        const permissionError = await checkPermission(request, 'maintenance', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        initModels();
        const body = await request.json();
        const cleanedBody = { ...body };

        if (!cleanedBody.property) {
            return NextResponse.json({ success: false, error: "Property is required" }, { status: 400 });
        }

        // If user is a customer, ensure they only create requests for themselves
        if (session.user.role === 'Customer') {
            cleanedBody.requestedBy = session.user.id;
        }

        if (cleanedBody.unit === "") delete cleanedBody.unit;
        if (cleanedBody.assignedTo === "") delete cleanedBody.assignedTo;
        if (cleanedBody.requestedBy === "") delete cleanedBody.requestedBy;

        const payload = injectTenant(session, cleanedBody);
        const maintenance = await Maintenance.create(payload);
        return NextResponse.json({ success: true, data: maintenance }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
