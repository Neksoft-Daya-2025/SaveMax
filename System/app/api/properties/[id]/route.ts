
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { auth } from "@/auth";
import { applyTenantFilter } from '@/lib/tenant';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session: any = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const scope = session.user?.permissions?.properties?.view;
        if (!session.user?.isSuperAdmin && scope !== 'all' && scope !== 'own') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await connectToDB();
        const query = applyTenantFilter(session, { _id: id });
        if (scope === 'own' && !session.user?.isSuperAdmin) query.$or = [{ createdBy: session.user.id }, { agent: session.user.id }, { owner: session.user.id }];
        const property = await Property.findOne(query)
            .populate('agent', 'name email phone profileImage')
            .populate('owner', 'name email phone profileImage')
            .populate('createdBy', 'name email phone');

        if (!property) {
            return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: property });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const member: any = session.user;
        if (!member.isSuperAdmin && !member.permissions?.properties?.edit) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await connectToDB();
        const existing = await Property.findOne(applyTenantFilter(session, { _id: id }));
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const body = await request.json();
        const cleanFields = (data: any) => {
            const cleaned = { ...data };
            for (const key of ['organization', 'createdBy', 'submissionSource', '_id', 'createdAt', 'updatedAt', '__v']) delete cleaned[key];
            const fieldsToClean = ['agent', 'owner', 'price', 'areaSize', 'bedrooms', 'bathrooms', 'parking', 'age'];
            fieldsToClean.forEach(field => {
                if (cleaned[field] === "") delete cleaned[field];
            });
            return cleaned;
        };

        const cleanedBody = cleanFields(body);

        // Handle Multiple Units
        if (body.units && Array.isArray(body.units) && body.units.length > 0) {
            console.log("PUT /api/properties/[id] - Multi Unit Update. Count:", body.units.length);
            const results = [];
            for (const unitData of body.units) {
                console.log("Processing Unit. ID:", unitData._id, "UnitNo:", unitData.unit);
                // Determine if this unit is the current property being updated
                // The frontend should send the current property with its ID in the units array, or we assume it based on matching fields?
                // Better: The frontend should include _id for the existing one.

                // Clean the base body to remove system fields
                const { _id, createdAt, updatedAt, __v, units, ...baseData } = cleanedBody;

                // Prepare unit specific overrides
                const unitOverrides = cleanFields(unitData);

                const unitPayload = {
                    ...baseData,
                    ...unitOverrides,
                    organization: existing.organization,
                    createdBy: unitData._id === id ? existing.createdBy : session.user.id
                };

                if (unitData._id === id) {
                    // Update the existing property
                    console.log("Updating existing property unit:", id);
                    // For update, we can allow partials, but ideally we set what we have
                    const updated = await Property.findByIdAndUpdate(id, unitPayload, { new: true });
                    results.push(updated);
                } else if (!unitData._id) {
                    // Create new property
                    console.log("Creating new property unit for:", unitData.unit);
                    try {
                        const created = await Property.create(unitPayload) as any;
                        console.log("Successfully created new unit:", created._id);
                        results.push(created);
                    } catch (err: any) {
                        console.error("Failed to create new unit:", err);
                    }
                }
                // If it has an ID but not the current one, we skip it (can't update siblings indiscriminately here)
            }

            // If the current property was NOT in the units list (validation fail?), ensure it's at least updated with the common body?
            // But if user sent units, they likely included it. 
            // If they didn't, maybe they "removed" it? But we decided not to support deletion here.
            // Let's fallback: If no unit matched 'id', we perform a standard update using the main body
            const currentUpdated = results.find((r: any) => r?._id?.toString() === id);
            if (!currentUpdated) {
                await Property.findByIdAndUpdate(id, cleanedBody, { new: true });
            }

            return NextResponse.json({ success: true, data: results });
        }

        const property = await Property.findByIdAndUpdate(id, cleanedBody, { new: true });

        if (!property) {
            return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: property });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const member: any = session.user;
        if (!member.isSuperAdmin && !member.permissions?.properties?.delete) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        await connectToDB();
        const existing = await Property.findOne(applyTenantFilter(session, { _id: id }));
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const property = await Property.findByIdAndDelete(id);

        if (!property) {
            return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Property deleted" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
