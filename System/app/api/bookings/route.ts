
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { User, Property, Customer } from "@/lib/initModels";
import Booking from "@/models/Booking";
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
        const permissionError = await checkPermission(request, 'bookings', 'view');
        if (permissionError) return permissionError;

        const session = await auth();
        const viewScope = await getViewScope('bookings');

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        let query: any = {};
        if (searchParams.get('status')) query.status = searchParams.get('status');
        if (searchParams.get('property')) query.property = searchParams.get('property');

        // Apply filters based on view scope
        if (viewScope === 'all') {
            // Show all
        } else if (viewScope === 'own' && session?.user?.id) {
            if (session.user.role === 'Agent') {
                query.agent = session.user.id;
            } else {
                query.customer = session.user.id;
            }
        } else {
            // Default: show nothing
            return NextResponse.json({ success: true, data: [] });
        }

        if (search) {
            const safeSearch = escapeRegex(search);
            // Search in User model (for customers) and Property model with tenant filtering
            const userQuery = applyTenantFilter(session, {
                $or: [
                    { name: { $regex: safeSearch, $options: "i" } },
                    { email: { $regex: safeSearch, $options: "i" } }
                ]
            });
            const propQuery = applyTenantFilter(session, {
                title: { $regex: safeSearch, $options: "i" }
            });

            const [matchedUsers, matchedProperties] = await Promise.all([
                User.find(userQuery).select('_id'),
                Property.find(propQuery).select('_id')
            ]);

            const searchFilter = {
                $or: [
                    { customer: { $in: matchedUsers.map(u => u._id) } },
                    { property: { $in: matchedProperties.map(p => p._id) } }
                ]
            };

            // Combine with existing query
            if (query.customer || query.agent) {
                // If we already filtered by own ID, we must intersect
                if (query.$and) {
                    query.$and.push(searchFilter);
                } else {
                    const existing: any = { status: query.status, property: query.property, customer: query.customer, agent: query.agent };
                    Object.keys(existing).forEach(k => !existing[k] && delete existing[k]);
                    query.$and = [existing, searchFilter];
                    delete query.status;
                    delete query.property;
                    delete query.customer;
                    delete query.agent;
                }
            } else {
                Object.assign(query, searchFilter);
            }
        }

        // Apply tenant isolation filter
        query = applyTenantFilter(session, query);

        const bookings = await Booking.find(query)
            .populate('property', 'title price location')
            .populate('unit', 'unitNumber floor block')
            .populate('customer', 'name email phone')
            .populate('agent', 'name')
            .sort({ visitDate: 1, visitTime: 1 });

        return NextResponse.json({ success: true, data: bookings });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check Permissions
        const permissionError = await checkPermission(request, 'bookings', 'create');
        if (permissionError) return permissionError;

        const session: any = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();
        initModels();
        const body = await request.json();
        const cleanedBody = { ...body };

        // If user is a customer, ensure they only create bookings for themselves
        if (session.user.role === 'Customer') {
            cleanedBody.customer = session.user.id;
        }

        // Clean up optional ObjectIds sent as empty strings to avoid BSON errors
        const objectIdFields = ['customer', 'property', 'agent', 'unit'];
        objectIdFields.forEach(field => {
            if (cleanedBody[field] === "") delete cleanedBody[field];
        });

        const payload = injectTenant(session, cleanedBody);
        const booking = await Booking.create(payload);
        return NextResponse.json({ success: true, data: booking }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
