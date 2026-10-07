import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Unit, Property } from '@/lib/initModels';
import { auth } from '@/auth';
import { checkPermission } from '@/lib/rbac';
import { escapeRegex } from '@/lib/security';
import { applyTenantFilter, injectTenant } from '@/lib/tenant';

// GET /api/units - List all Units
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check Permissions
        const permissionError = await checkPermission(request, 'units', 'view');
        if (permissionError) return permissionError;

        const session: any = await auth();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const propertyId = searchParams.get("propertyId");
        const status = searchParams.get("status");
        const type = searchParams.get("type");
        const bedrooms = searchParams.get("bedrooms");
        const bathrooms = searchParams.get("bathrooms");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        let query: any = {};

        if (propertyId) {
            query.property = propertyId;
        }

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (bedrooms) {
            query.bedrooms = parseInt(bedrooms);
        }

        if (bathrooms) {
            query.bathrooms = parseInt(bathrooms);
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            query.$or = [
                { unitNumber: { $regex: safeSearch, $options: "i" } },
                { block: { $regex: safeSearch, $options: "i" } }
            ];
        }

        // Apply tenant isolation
        query = applyTenantFilter(session, query);

        const skip = (page - 1) * limit;

        const sortQuery: any = {};
        sortQuery[sortBy] = sortOrder === "asc" ? 1 : -1;

        const tenantScopedFilter = applyTenantFilter(session, {});

        const [units, total, summaries] = await Promise.all([
            Unit.find(query)
                .populate('property', 'title location images description')
                .populate('owner', 'name email')
                .sort(sortQuery)
                .skip(skip)
                .limit(limit),
            Unit.countDocuments(query),
            Unit.aggregate([
                { $match: tenantScopedFilter },
                {
                    $facet: {
                        generalStats: [
                            {
                                $group: {
                                    _id: null,
                                    totalUnits: { $sum: 1 },
                                    distinctProperties: { $addToSet: "$property" },
                                    avgPrice: { $avg: "$price" },
                                    minPrice: { $min: "$price" },
                                    maxPrice: { $max: "$price" }
                                }
                            }
                        ],
                        statusStats: [
                            {
                                $group: {
                                    _id: "$status",
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        typeStats: [
                            {
                                $group: {
                                    _id: "$type",
                                    count: { $sum: 1 },
                                    availableCount: {
                                        $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] }
                                    }
                                }
                            },
                            { $sort: { count: -1 } },
                            { $limit: 1 }
                        ]
                    }
                }
            ])
        ]);

        const rawStats = summaries[0];
        const gen = (rawStats && rawStats.generalStats && rawStats.generalStats[0]) || { totalUnits: 0, distinctProperties: [], avgPrice: 0, minPrice: 0, maxPrice: 0 };
        const statusMap = (rawStats && rawStats.statusStats || []).reduce((acc: any, curr: any) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});
        const occupiedCount = (statusMap['Sold'] || 0) + (statusMap['Rented'] || 0) + (statusMap['Booked'] || 0) + (statusMap['Reserved'] || 0);
        const mostCommonType = (rawStats && rawStats.typeStats && rawStats.typeStats[0]) || { _id: "Apartment", count: 0, availableCount: 0 };

        const summary = {
            totalUnits: gen.totalUnits || 0,
            propertiesCount: (gen.distinctProperties && gen.distinctProperties.length) || 0,
            averageRent: gen.avgPrice || 0,
            minPrice: gen.minPrice || 0,
            maxPrice: gen.maxPrice || 0,
            mostCommonType: mostCommonType._id || "Apartment",
            mostCommonTypeCount: mostCommonType.count || 0,
            mostCommonTypeAvailableCount: mostCommonType.availableCount || 0,
            occupiedCount,
            occupancyRate: gen.totalUnits > 0 ? Math.round((occupiedCount / gen.totalUnits) * 100) : 0
        };

        return NextResponse.json({
            success: true,
            data: units,
            summary,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/units - Create new Unit
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check Permissions
        const permissionError = await checkPermission(request, 'units', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        const body = await request.json();

        // Validation
        if (!body.property || !body.unitNumber || !body.price || !body.areaSize) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check uniqueness
        const existing = await Unit.findOne({
            property: body.property,
            block: body.block,
            unitNumber: body.unitNumber
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: "Unit number already exists in this block/property" },
                { status: 400 }
            );
        }

        const unitData = injectTenant(session, {
            ...body,
            createdBy: session.user.id
        });

        const unit = await Unit.create(unitData);

        return NextResponse.json({ success: true, data: unit }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Unit already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
