import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import Settings from "@/models/Settings";
import { initModels } from "@/lib/initModels";

export const dynamic = "force-dynamic";

// Public API — no auth required
export async function GET() {
    try {
        await connectToDB();
        initModels();

        // Fetch company settings
        const settings = await Settings.findOne().lean();

        // Fetch featured/available properties (max 6)
        const featuredProperties = await Property.find({
            $or: [{ isFeatured: true }, { isHot: true }],
            status: { $in: ['Available', 'Booked'] }
        })
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(6)
            .lean();

        // If less than 6 featured, fill with recent available
        let properties = featuredProperties;
        if (properties.length < 6) {
            const existingIds = properties.map((p: any) => p._id);
            const moreProperties = await Property.find({
                _id: { $nin: existingIds },
                status: { $in: ['Available', 'Booked'] }
            })
                .sort({ createdAt: -1 })
                .limit(6 - properties.length)
                .lean();
            properties = [...properties, ...moreProperties];
        }

        // Fetch available units (max 8)
        const units = await Unit.find({
            status: { $in: ['Available', 'Booked'] }
        })
            .populate('property', 'title location propertyType purpose')
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();

        // Get stats
        const totalProperties = await Property.countDocuments();
        const availableProperties = await Property.countDocuments({ status: 'Available' });
        const soldProperties = await Property.countDocuments({ status: 'Sold' });
        const rentedProperties = await Property.countDocuments({ status: 'Rented' });
        const totalUnits = await Unit.countDocuments();
        const availableUnits = await Unit.countDocuments({ status: 'Available' });

        return NextResponse.json({
            success: true,
            data: {
                settings: settings ? {
                    storeName: (settings as any).storeName,
                    address: (settings as any).address,
                    phone: (settings as any).phone,
                    email: (settings as any).email,
                    website: (settings as any).website,
                    logoUrl: (settings as any).logoUrl,
                    businessHours: (settings as any).businessHours,
                    currency: (settings as any).currency,
                } : null,
                properties: properties.map((p: any) => ({
                    _id: p._id,
                    title: p.title,
                    description: p.description,
                    propertyType: p.propertyType,
                    purpose: p.purpose,
                    status: p.status,
                    price: p.price,
                    areaSize: p.areaSize,
                    areaUnit: p.areaUnit,
                    bedrooms: p.bedrooms,
                    bathrooms: p.bathrooms,
                    parking: p.parking,
                    location: p.location,
                    amenities: p.amenities,
                    images: p.images,
                    isFeatured: p.isFeatured,
                    isHot: p.isHot,
                })),
                units: units.map((u: any) => ({
                    _id: u._id,
                    unitNumber: u.unitNumber,
                    block: u.block,
                    floor: u.floor,
                    type: u.type,
                    price: u.price,
                    areaSize: u.areaSize,
                    bedrooms: u.bedrooms,
                    bathrooms: u.bathrooms,
                    windows: u.windows,
                    status: u.status,
                    features: u.features,
                    images: u.images,
                    isCorner: u.isCorner,
                    facing: u.facing,
                    property: u.property ? {
                        _id: u.property._id,
                        title: u.property.title,
                        location: u.property.location,
                        propertyType: u.property.propertyType,
                        purpose: u.property.purpose,
                    } : null,
                })),
                stats: {
                    totalProperties,
                    availableProperties,
                    soldProperties,
                    rentedProperties,
                    totalUnits,
                    availableUnits,
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
