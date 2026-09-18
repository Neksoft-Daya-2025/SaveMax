/* Developed by RUDRA via NEKLLM */
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import { initModels } from "@/lib/initModels";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        await connectToDB();
        initModels();

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
        }
        const { propertyId, unitId, name, email, phone, visitDate, visitTime, message } = body;

        // Validate required fields
        if (![propertyId, name, email, phone, visitDate, visitTime].every(value => typeof value === 'string' && value.trim()) ||
            (unitId != null && typeof unitId !== 'string') ||
            (message != null && typeof message !== 'string')) {
            return NextResponse.json(
                { success: false, error: "Please fill in all required fields." },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return NextResponse.json(
                { success: false, error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        // Validate propertyId is a valid ObjectId
        if (!mongoose.isObjectIdOrHexString(propertyId)) {
            return NextResponse.json(
                { success: false, error: "Invalid property." },
                { status: 400 }
            );
        }

        const parsedVisitDate = new Date(visitDate);
        if (Number.isNaN(parsedVisitDate.getTime())) {
            return NextResponse.json({ success: false, error: 'Invalid visit date.' }, { status: 400 });
        }
        const property = await Property.findById(propertyId);
        if (!property) {
            return NextResponse.json({ success: false, error: 'Property not found.' }, { status: 404 });
        }
        if (unitId) {
            if (!mongoose.isObjectIdOrHexString(unitId) ||
                !await Unit.exists({ _id: unitId, property: property._id, organization: property.organization || null })) {
                return NextResponse.json({ success: false, error: 'Invalid unit for this property.' }, { status: 400 });
            }
        }

        // Public submissions must never overwrite an existing account's profile.
        let user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            user = await User.create({
                name,
                email: email.trim().toLowerCase(),
                phone,
                organization: property.organization,
                status: "Active",
            });
        }

        // Build booking data
        const bookingData: any = {
            property: propertyId,
            organization: property.organization,
            customer: user._id,
            visitDate: parsedVisitDate,
            visitTime,
            status: "Pending",
            message: message || "",
        };

        // Add unit if provided and valid
        if (unitId && mongoose.Types.ObjectId.isValid(unitId)) {
            bookingData.unit = unitId;
        }

        const booking = await Booking.create(bookingData);

        return NextResponse.json(
            { success: true, data: booking },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Public booking error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
