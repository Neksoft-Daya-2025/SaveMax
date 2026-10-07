import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { auth } from "@/auth";
import { initModels } from "@/lib/initModels";
import { checkPermission } from "@/lib/rbac";
import { escapeRegex } from "@/lib/security";
import { applyTenantFilter, injectTenant } from "@/lib/tenant";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await connectToDB();
        initModels();

        // Check Permissions
        const permissionError = await checkPermission(request, 'properties', 'view');
        if (permissionError) return permissionError;

        const session: any = await auth();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');
        const search = searchParams.get('search') || "";
        const sortBy = searchParams.get('sort') || 'newest';
        const skip = (page - 1) * limit;

        let query: any = {};

        // Search
        if (search) {
            const safeSearch = escapeRegex(search);
            query.$or = [
                { title: { $regex: safeSearch, $options: 'i' } },
                { 'location.address': { $regex: safeSearch, $options: 'i' } },
                { 'location.city': { $regex: safeSearch, $options: 'i' } },
            ];
        }

        // Filtering
        const agentId = searchParams.get('agent');
        if (agentId) {
            if (!/^[a-f\d]{24}$/i.test(agentId)) {
                return NextResponse.json({ success: false, error: 'Invalid agent ID' }, { status: 400 });
            }
            query.agent = agentId;
        }
        if (searchParams.get('type')) query.propertyType = searchParams.get('type');
        if (searchParams.get('purpose')) query.purpose = searchParams.get('purpose');
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('isFeatured')) query.isFeatured = searchParams.get('isFeatured') === 'true';

        // Apply tenant isolation filter
        query = applyTenantFilter(session, query);

        // Sort
        let sortQuery: any = { createdAt: -1 };
        if (sortBy === 'oldest') sortQuery = { createdAt: 1 };
        else if (sortBy === 'price_asc') sortQuery = { price: 1 };
        else if (sortBy === 'price_desc') sortQuery = { price: -1 };
        else if (sortBy === 'title_asc') sortQuery = { title: 1 };

        const total = await Property.countDocuments(query);
        const properties = await Property.find(query)
            .populate('agent', 'name email')
            .populate('owner', 'name email')
            .sort(sortQuery)
            .skip(skip)
            .limit(limit);

        // Stats scoped to tenant
        const baseStatsFilter = applyTenantFilter(session, {});
        const [totalAll, totalAvailable, totalOccupied, totalMaintenance] = await Promise.all([
            Property.countDocuments(baseStatsFilter),
            Property.countDocuments({ ...baseStatsFilter, status: 'Available' }),
            Property.countDocuments({ ...baseStatsFilter, status: { $in: ['Rented', 'Booked'] } }),
            Property.countDocuments({ ...baseStatsFilter, status: 'Pending' }),
        ]);

        // Per-property unit counts using Unit model
        const Unit = (await import('@/models/Unit')).default;
        const propertyIds = properties.map((p: any) => p._id);
        const unitAggregation = await Unit.aggregate([
            { $match: { property: { $in: propertyIds } } },
            {
                $group: {
                    _id: '$property',
                    total: { $sum: 1 },
                    available: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } },
                    occupied: { $sum: { $cond: [{ $in: ['$status', ['Rented', 'Booked', 'Sold']] }, 1, 0] } },
                    maintenance: { $sum: { $cond: [{ $eq: ['$status', 'Reserved'] }, 1, 0] } },
                }
            }
        ]);

        const unitCountMap: Record<string, any> = {};
        unitAggregation.forEach((u: any) => {
            unitCountMap[u._id.toString()] = u;
        });

        // Attach unitCounts to each property
        const propertiesWithUnits = properties.map((p: any) => {
            const pObj = p.toObject();
            pObj.unitCounts = unitCountMap[p._id.toString()] || { total: 0, available: 0, occupied: 0, maintenance: 0 };
            return pObj;
        });

        return NextResponse.json({
            success: true,
            data: propertiesWithUnits,
            stats: {
                total: totalAll,
                available: totalAvailable,
                occupied: totalOccupied,
                maintenance: totalMaintenance,
            },
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
        const permissionError = await checkPermission(request, 'properties', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        initModels();

        const body = await request.json();

        // Handle empty fields that should be ObjectIds or numbers
        const cleanFields = (data: any) => {
            const cleaned = { ...data };
            const fieldsToClean = ['agent', 'owner', 'price', 'areaSize', 'bedrooms', 'bathrooms', 'parking', 'age'];
            fieldsToClean.forEach(field => {
                if (cleaned[field] === "") delete cleaned[field];
            });
            return cleaned;
        };

        const cleanedBody = cleanFields(body);
        const createdBy = session.user.id;

        // Check for multiple units
        if (body.units && Array.isArray(body.units) && body.units.length > 0) {
            const propertiesToCreate = body.units.map((unitData: any) => {
                const mergedData = injectTenant(session, {
                    ...cleanedBody,
                    ...cleanFields(unitData),
                    createdBy
                });
                delete mergedData.units;
                return mergedData;
            });

            const createdProperties = await Property.insertMany(propertiesToCreate);
            return NextResponse.json({ success: true, count: createdProperties.length, data: createdProperties }, { status: 201 });
        }

        // Single Property Creation with tenant injection
        const propertyData = injectTenant(session, {
            ...cleanedBody,
            createdBy
        });

        const property = await Property.create(propertyData);

        return NextResponse.json({ success: true, data: property }, { status: 201 });
    } catch (error: any) {
        console.error("Property Creation Error Details:", error);

        const isValidationError = error.name === 'ValidationError' || error.name === 'CastError';
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to create property",
            type: error.name,
            details: error.errors
        }, { status: isValidationError ? 400 : 500 });
    }
}
