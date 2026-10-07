import { auth } from "@/auth";
import { connectToDB } from "@/lib/mongodb";
import { initModels, Contract, Property, Customer, Unit, User } from "@/lib/initModels";
import { checkPermission, getViewScope } from "@/lib/rbac";
import { escapeRegex } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'contracts', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const viewScope = await getViewScope('contracts');

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || "";
        const skip = (page - 1) * limit;

        let query: any = {};
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('type')) query.type = searchParams.get('type');

        // Apply filters based on view scope
        if (viewScope === 'all') {
            // Show all records
        } else if (viewScope === 'own' && session?.user?.id) {
            query['parties.client'] = session.user.id;
        } else {
            // Default: show nothing
            return NextResponse.json({ success: true, data: [] });
        }

        // Apply tenant isolation
        const { applyTenantFilter, injectTenant } = await import('@/lib/tenant');
        query = applyTenantFilter(session, query);

        // Search logic: Since property title and client name are in populated fields, 
        // we might need to filter after population or use more complex aggregation.
        // For simplicity with find(), we can search properties/users first or use regex if they were denormalized.
        // Let's assume search is mainly for property titles or client names.

        let contracts;
        let total;

        if (search) {
            const safeSearch = escapeRegex(search);
            const [matchingProperties, matchingUsers] = await Promise.all([
                Property.find({ title: { $regex: safeSearch, $options: 'i' } }).select('_id'),
                User.find({ name: { $regex: safeSearch, $options: 'i' } }).select('_id')
            ]);

            const searchFilter = {
                $or: [
                    { property: { $in: matchingProperties.map(p => p._id) } },
                    { 'parties.client': { $in: matchingUsers.map(u => u._id) } }
                ]
            };

            // Combine with existing query
            if (query.$and) {
                query.$and.push(searchFilter);
            } else if (Object.keys(query).length > 0) {
                const existingQuery = { ...query };
                Object.keys(existingQuery).forEach(key => delete query[key]);
                query.$and = [existingQuery, searchFilter];
            } else {
                Object.assign(query, searchFilter);
            }
        }

        total = await Contract.countDocuments(query);
        contracts = await Contract.find(query)
            .populate('property', 'title location price')
            .populate('unit', 'unitNumber floor block price')
            .populate('parties.owner', 'name email')
            .populate('parties.client', 'name email')
            .populate('parties.agent', 'name email')
            .sort({ 'details.startDate': -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: contracts,
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
        const permissionError = await checkPermission(request, 'contracts', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        const body = await request.json();
        const payload = { ...body };

        // Clean up optional ObjectId fields if they are empty strings
        if (payload.unit === "") delete payload.unit;
        if (payload.parties?.agent === "") delete payload.parties.agent;

        // Basic validation
        if (!payload.property || !payload.parties?.client || !payload.details?.startDate || !payload.details?.amount) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Fetch property to get owner
        const property = await Property.findById(payload.property);
        if (!property) {
            return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
        }

        const { injectTenant } = await import('@/lib/tenant');
        const contractData = injectTenant(session, {
            ...payload,
            parties: {
                ...payload.parties,
                owner: property.owner || property.createdBy,
            }
        });

        const contract = await Contract.create(contractData);

        // Update Property and Unit status if needed
        const statusToSet = body.type === 'Sale' ? 'Sold' : 'Rented';
        const isRentOrSale = ['Rent', 'Lease', 'Sale'].includes(body.type);

        if (isRentOrSale) {
            if (body.unit) {
                // Update specific unit status
                await Unit.findByIdAndUpdate(body.unit, { status: statusToSet });

                // Check for remaining available units in same property
                const availableUnitsCount = await Unit.countDocuments({
                    property: body.property,
                    status: 'Available'
                });

                // Only mark property as Rented/Sold if NO units are left available
                if (availableUnitsCount === 0) {
                    await Property.findByIdAndUpdate(body.property, { status: statusToSet });
                }
            } else {
                // No unit specified, update property directly
                await Property.findByIdAndUpdate(body.property, { status: statusToSet });
            }
        }

        return NextResponse.json({ success: true, data: contract }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
